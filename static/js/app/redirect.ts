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

// @ts-ignore
const properties: any = prop

// rediretion delay in seconds
let delay: number = (properties.debug ? 120 : 5)

function update(): void {
    // update countdown
    $('#timer').text(`You're getting redirected in ${(delay !== 1 ? delay : 'one')} second${(delay !== 1 ? 's' : '')}...`)
    // update page title
    if (!document.title.includes(':'))
        document.title += `: ${delay}`
    else
        document.title = `${document.title.split(':')[0]}: ${delay}`
}

$(() => {
    // run countdown
    update()
    const interval = setInterval(() => {
        if (1 == delay) {
            window.location.href = properties.location
            clearInterval(interval)
            return
        }
        delay -= 1
        update()
    }, 1000)
})