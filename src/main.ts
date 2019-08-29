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

import Toml from 'toml'
import Path from 'path'
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
import StringUtil from './util/StringUtil'
import Templates from './util/Templates'
import CaptchaService from './util/CaptchaService'

export const args: Map<string, any> = new Map()

// parse argv arguments
Lodash.filter(process.argv).map(arg => arg.trim()).filter(arg => arg.startsWith('--')).map(arg => arg = arg.replace('--', '')).filter(arg => /[A-Z=-]/i.test(arg)).forEach(arg => {
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
export let config: any = Toml.parse(StringUtil.fromFile(args.get('config') || './config.toml'))

// merge config.debug.toml to existing config if such a file exists
if (args.get('debug') && FileSystem.existsSync('./config.debug.toml'))
    config = Lodash.merge(config, Toml.parse(StringUtil.fromFile('./config.debug.toml')))

StringUtil.init()

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

    // serve static files
    application.use('/', express.static(Path.join(__dirname, '../static'), {dotfiles: 'deny'}))

    // add body-parser to express
    application.use(BodyParser.json())

    // setup recaptcha service
    const captchaService: CaptchaService = new CaptchaService(config.recaptcha['secret-key'])

    // setup api router
    const api: Router = express.Router({caseSensitive: true})

    // handle api authorization
    api.use((request, response, next) => {
        // set content type to json since this is a restful api
        response.contentType('application/json')
        // skip authorization in debug mode
        if (args.get('debug')) {
            next()
            return
        }
        // extract authorization header
        const token: string = (request.header(config.http.authorization.header) || [''])[0] || ''
        // check for captcha response if authorization header is unset
        if (!token) {
            const captcha: string = request.body.captcha
            // deny access on unset captcha response
            if (!captcha) {
                response.sendStatus(401)
                return
            }
            // verify captcha response
            captchaService.verify(captcha).then(success => {
                if (!success)
                    response.sendStatus(401)
                else
                    next()
            })
        }
        // compare authorization header with expected one
        if (config.http.authorization.expect !== token)
            response.sendStatus(401)
        else
            next()
    })

    // handle incoming post requests (create redirects)
    api.post('/create/:key*?', (request, response) => {
        const key: string = request.params.key
        const location: string = request.body.location
        if (!key)
            result(response, new Error('Missing key in request path.'))
        else if (!location)
            result(response, new Error('Missing location parameter in request body.'))
        else {
            // parse redirect
            let redirect: Redirect
            try {
                redirect = Redirect.new(request.body.location, request.params.key, request.body.instant)
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
    /*api.delete('/delete/:key*?', (request, response) => {
        const key: string = request.params.key
        if (!key) result(response, new Error('Missing key in path.'))
        else database.delete(request.params.key)
            .then(() => result(response))
            .catch(error => result(response, error))
    })*/

    // add api router to express
    application.use(`${config.http.apiPath}/v1`, api)

    // setup templates
    const templates: Templates = new Templates([
        'redirect',
        'index'
    ], [
        'footer',
        'head',
        'scripts',
        'heading'
    ])

    // handle default get requests
    application.get('/', (request, response) =>
        // render the response
        templates.render('index', response, {
            // key properties
            key: {
                regex: config.database.key,
                random: StringUtil.createKey()
            },
            // recaptcha site key
            'site-key': config.recaptcha['site-key']
        })
    )

    // handle default get requests
    application.get('/:key*?', (request, response) =>
        // lookup given key in database and redirect user
        database.find(request.params.key)
            .then(redirect => {
                if (redirect.instant())
                // redirect the client directly
                    response.redirect(config.http.redirect.status, redirect.location())
                else
                // render the redirect template
                    templates.render('redirect', response, {redirect})
            })
            .catch(() => response.sendStatus(404))
    )

    const server: Server = http.createServer(application)

    // start http server
    server.listen({
        port: config.http.port,
        host: config.http.host,
        path: config.http.path
    }, () => Log.info(`HTTP server is now listening at http://${config.http.host}:${config.http.port}${config.http.path}`))

}).catch(error => Log.error(`INITIALIZATION ERROR: ${error.message}`))