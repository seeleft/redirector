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

import {URL} from 'url'
import {post} from 'request'

const RECAPTCHA_BASE_URL: string = 'https://www.google.com/recaptcha/api/siteverify'

export default class CaptchaService {

    private readonly secretKey: string

    constructor(secretKey: string) {
        this.secretKey = secretKey
    }

    verify = (response: string): Promise<boolean> => new Promise(resolve => {
        // build request url
        const url: URL = new URL(RECAPTCHA_BASE_URL)
        url.searchParams.append('secret', this.secretKey)
        url.searchParams.append('response', response)
        // send request to recaptcha api
        post(url.toString(), (error, response, body) => {
            if (error || 200 !== response.statusCode)
                resolve(false)
            else
                resolve(JSON.parse(body).success)
        })
    })

}


