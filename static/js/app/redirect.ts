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
// export properties from js - the idiot way
const properties: any = prop

// rediretion delay in seconds
let delay: number = (properties.debug ? 120 : 5)

/**
 * Updates the #timer element and page title
 */
const update = (): void => {
    // update countdown
    $('#timer').text(`You're getting redirected in ${(delay !== 1 ? delay : 'one')} second${(delay !== 1 ? 's' : '')}...`)
    // update page title
    // asign time to the title if not already done so
    if (!document.title.includes(':'))
        document.title += `: ${delay}`
    else
    // extract and update time from the title
        document.title = `${document.title.split(':')[0]}: ${delay}`
}

$(() => {
    update()
    // run countdown timer every 1000ms (one second)
    const interval = setInterval(() => {
        // check for end of the delay
        if (1 == delay) {
            // stop the interval task
            clearInterval(interval)
            // redirect to the target page
            window.location.href = properties.location
            return
        }
        // update the delay
        delay -= 1
        update()
    }, 1000)
})