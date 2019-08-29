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

/*
 * Object responsible for being a container in which to validate and store a redirect
 */

import StringUtil from '../util/StringUtil'

export default class Redirect {

    // location (uri encoded url) of the redirect
    private readonly $location: string

    private readonly $key: string

    private readonly $instant: boolean

    private constructor(location: string, key: string, instant: boolean) {
        this.$location = location
        this.$key = key
        this.$instant = instant
    }

    /**
     * Creates (and validates the values) an instance of a redirect
     *
     * @param location - the location (url) of the redirect
     * @param key - the key of the redirect (will be randomized if unset)
     * @param instant - should the redirect happen instantly?
     *
     * @returns an instance of a redirect
     *
     * @throws if the values can't be validated
     */
    static new(location: string, key?: string, instant: boolean = false): Redirect {
        // generate key from regex if unset
        if (!key)
            key = StringUtil.createKey()
        // validate key against regex
        else if (!StringUtil.checkKey(key))
            throw new Error(`Key "${key}" is invalid.`)
        // validate url
        if (!StringUtil.checkUrl(location))
            throw new Error(`Invalid url: ${location}`)
        return new Redirect(encodeURI(location), key, instant)
    }

    /**
     * Parses a json object back to a redirect
     *
     * @param json - the json object which normally should be stored in a databaes
     *
     * @throws if values are missing
     */
    static fromJson(json: any): Redirect {
        if (!json._location || !json._key)
            throw new Error(`Json (${json}) is missing some neccessary properties.`)
        return new Redirect(json._location, json._key, json._instant)
    }

    /**
     * Converts the redirect into a json object ready to store into a database
     *
     * @returns a json object of the redirect (prefixed with underscores)
     */
    toJson(): any {
        return {
            _key: this.$key,
            _location: this.$location,
            _instant: this.$instant
        }
    }

    /**
     * @returns the url (uri decoded) of the redirect
     */
    location = (): string => decodeURI(this.$location)

    /**
     * @returns the key of the redirect
     */
    key = (): string => this.$key

    /**
     * @returns if the redirect should happen instantly (HTTP level)
     */
    instant = (): boolean => this.$instant

}