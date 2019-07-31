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

import Redirect from './Redirect'


/*
 * Interface responsible for implementing databases
 */
export default interface IDatabase {

    /**
     * Initiate database connection asynchronously
     *
     * @param uri - the database connection uri
     * @param options - the database settings
     *
     * @returns a promise which's result will be the instance of the database
     */
    connect(uri: string, options: any): Promise<IDatabase>

    /**
     * Looks up a redirect in the database by key
     *
     * @param key - the key of the redirect to lookup
     *
     * @returns a promise which's result will be the redirect (will be rejected if no redirect matches the {@param key})
     */
    find(key: string): Promise<Redirect>

    /**
     * Looks up a redirect in the database and deletes it
     *
     * @param key - the key of the redirect to delete
     *
     * @returns a promise which will be rejected on failure (no redirect matching the {@param key}, etc...)
     */
    delete(key: string): Promise<void>

    /**
     * Inserts or replaces the redirect in the database
     *
     * @param redirect - the redirect to insert or replace wit an existing one
     *
     * @returns a promise which will be rejected on failure
     */
    insert(redirect: Redirect): Promise<void>

    /*
     * Closes the database
     * Todo: gracefully close the database
     */
    close(): void

}