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

import RandExp from 'randexp'
import {config} from '../main'
import {URL} from 'url'
import FileSystem, {PathLike} from 'fs'

export default class StringUtil {

    private static KEY_REGEX?: RegExp

    private constructor() {
        // prevent instantiaton
    }

    private static keyRegex = (): RegExp => {
        if (!StringUtil.KEY_REGEX)
            throw new Error('Not yet initialized.')
        return StringUtil.KEY_REGEX
    }

    static init = (): void => {
        StringUtil.KEY_REGEX = new RegExp(config.database.key)
    }

    static createKey = (): string => new RandExp(StringUtil.keyRegex()).gen()

    static checkKey = (key: string): boolean => StringUtil.keyRegex().test(key)

    static checkUrl = (url: string): boolean => {
        try {
            new URL(url)
            return true
        } catch (error) {
            return false
        }
    }

    static fromFile = (path: PathLike): string => FileSystem.readFileSync(path, 'UTF-8')

}
