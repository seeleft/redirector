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

import IDatabase from './IDatabase'
import MongoDatabaseImpl from './impl/MongoDatabaseImpl'
import {args} from '../main'
import DebugDatabaseImpl from './impl/DebugDatabaseImpl'

/*
 * Helper class responsible for instantiating database implementations
 */
export default class DatabaseFactory {

    // prevent instantiaton
    private constructor() {
    }

    /**
     * Creates and connects asynchronously to a database
     *
     * @param type - the type of the database (e.g. "mongodb")
     * @param uri - the connection uri of the database
     * @param options - optional settings which differ by database {@param type}
     *
     * @returns a promise which's result will be the instance of the database
     */
    static of(type: string, uri: string, options: any): Promise<IDatabase> {
        if (args.get('debug'))
            type = 'debug'
        switch (type.toLowerCase()) {
            case 'mongodb':
                return new MongoDatabaseImpl().connect(uri, options)
            case 'debug':
                // uri and options are ignored here!!
                return new DebugDatabaseImpl().connect(uri, options)
            default:
                throw new Error(`Unknown database type '${type}'.`)
        }
    }
}