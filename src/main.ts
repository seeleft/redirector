/*
 * This file is licensed under the MIT License and is part of the "redirector" project.
 * Copyright (c) 2019 Daniel Riegler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import cors from 'cors'
import Toml from 'toml'
import moment from 'moment'
import Lodash from 'lodash'
import FileSystem from 'fs'
import exitHook from 'exit-hook'
import http, {Server} from 'http'
import BodyParser from 'body-parser'
import Redirect from './database/Redirect'
import express, {Application, Response, Router} from 'express'
import DatabaseFactory from './database/DatabaseFactory'
import Winston, {format, Logger, transports} from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'

export const args: Map<string, any> = new Map()

// parse argv arguments
Lodash.filter(process.argv).map(arg => arg = arg.trim()).filter(arg => arg.startsWith('--')).map(arg => arg = arg.replace('--', '')).filter(arg => /[A-Z=-]/i.test(arg)).forEach(arg => {
    if (!arg.includes('=') || arg.endsWith('='))
        args.set(arg, true)
    else {
        const parts: Array<string> = arg.split('=', 1)
        try {
            parts[1] = JSON.parse(parts[1])
        } catch (error) {
        }
        args.set(parts[0], parts[1])
    }
})

// parse config
let config: any = Toml.parse(FileSystem.readFileSync(args.get('config') || './config.toml', 'UTF-8'))

// merge config.debug.toml to existing config if such a file exists
if (args.get('debug') && FileSystem.existsSync('./config.debug.toml'))
    config = Lodash.merge(config, Toml.parse(FileSystem.readFileSync('./config.debug.toml', 'UTF-8')))

// setup logger
export const Log: Logger = Winston.createLogger({
    level: args.get('debug') ? 'debug' : 'info',
    exitOnError: !args.get('debug'),
    silent: args.get('log-silent'),
    transports: new transports.Console(),
    format: format.printf(info => `[${moment().format('HH:mm:ss.SSS')} ${info.level.toUpperCase()}]: ${info.message}`)
})

// setup rotate file logger
if (!args.get('no-log-file'))
    Log.add(new WinstonDailyRotateFile({
        datePattern: 'DD-MM-YYYY',
        zippedArchive: true,
        filename: '%DATE%.log',
        dirname: args.get('log-path') || './logs',
        maxSize: '20M',
        maxFiles: '14d'
    }))

// http response handler/formatter
const result = (response: Response, error?: Error): void => {
    if (error)
        response.status(500)
    response.json({
        success: !error,
        error: {
            name: error && error.name || null,
            message: error && error.message || null
        }
    })
}

// initialize and connect to database
DatabaseFactory.of(config.database.type, config.database.uri, config.database.options).then(database => {

    // close database on shutdown
    exitHook(database.close)

    const application: Application = express()

    // initialize static files
    if (config.http.static.enabled) {
        // allow cross origin requests
        application.use(cors())
        // serve static files
        application.use(config.http.static.path, express.static('static', {dotfiles: 'deny'}))
    }

    // add body-parser to express
    application.use(BodyParser.json())

    // setup api router
    const api: Router = express.Router({caseSensitive: true})

    // handle content, whitelist and authorization
    api.use((request, response, next) => {
        // set conent type to json since this is a restful api
        response.contentType('application/json')
        // compar e request ip address with whitelist
        const whitelist: Array<any> = config.http.authorization.whitelist // use any as type because array could potentially include non-string objects
        if ('*' !== whitelist[0] && !whitelist.includes(request.header('x-forwarded-for') || request.connection.remoteAddress))
            response.status(401).send()
        // compare request authorization header with expected one
        else if (config.http.authorization.expect !== request.header(config.http.authorization.header))
            response.status(401).send()
        else
            next()
    })

    // default get api endpoint; ping to validate that the api is up and running
    api.get('/', (request, response) => result(response))

    // handle incoming post requests (create redirects)
    api.post('/:key*?', (request, response) => {
        const key: string = request.params.key
        const location: string = request.body.location
        if (!key)
            result(response, new Error('Missing key in path.'))
        else if (!location)
            result(response, new Error('Missing location parameter in request body.'))
        else {
            // parse redirect
            let redirect: Redirect
            try {
                redirect = Redirect.new(request.body.location, request.params.key)
            } catch (error) {
                result(response, error)
                return
            }
            // push redirect into the database
            database.insert(redirect)
                .then(() => result(response))
                .catch(error => result(response, error))
        }
    })

    // handle incoming delete requests (delete redirects)
    api.delete('/:key*?', (request, response) => {
        const key: string = request.params.key
        if (!key) result(response, new Error('Missing key in path.'))
        else database.delete(request.params.key)
            .then(() => result(response))
            .catch(error => result(response, error))
    })

    // add api router to express
    application.use(config.http.apiPath, api)

    // handle default get requests
    application.get('/:key*?', (request, response) => {
        const status: number = config.http.redirect.status
        const key: string = request.params.key
        // redirect to default url if no key is given
        if (!key)
            response.redirect(status, config.http.redirect.default)
        // lookup given key in database and redirect user
        else database.find(key)
            .then(redirect => response.redirect(status, redirect.location()))
            .catch(() => response.status(404).send())
    })

    const server: Server = http.createServer(application)

    // start http server
    server.listen({
        port: config.http.port,
        host: config.http.host,
        path: config.http.path
    }, () => Log.info(`HTTP server is now listening: ${JSON.stringify(config.http)}`))

}).catch(error => Log.error(`Could not connect to database: ${error.message}`))