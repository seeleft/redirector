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

import IDatabase from '../IDatabase'
import Redirect from '../Redirect'

export default class DebugDatabaseImpl implements IDatabase {

    private readonly redirects: Map<string, Redirect> = new Map()

    // nothing to do here
    connect = (uri: string, options: any): Promise<IDatabase> => Promise.resolve(this)


    delete = (key: string): Promise<void> => {
        if (this.redirects.delete(key))
            return Promise.resolve()
        else
            return Promise.reject(new Error(`No entry found for key '${key}'.`))
    }

    find = (key: string): Promise<Redirect> => {
        const redirect: Redirect | undefined = this.redirects.get(key)
        if (!redirect)
            return Promise.reject(new Error(`No entry found for key '${key}'.`))
        return Promise.resolve(redirect)
    }

    insert = (redirect: Redirect): Promise<void> => {
        this.redirects.set(redirect.key(), redirect)
        return Promise.resolve()
    }

    close = (): void => {
        // nothing to do here
    }
}

