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

/**
 * Extracts the current key from DOM
 *
 * @return string - the current key
 */
const key = (): string => {
    const key: JQuery<HTMLInputElement> = $('#key')
    return key.val() || key.prop('placeholder')
}

/* Updates the #output element (URL representation) */
const updateOutput = (): void => {
    // get current url
    let location: string = window.location.toString()
    // append trailing slash to url
    if (!location.endsWith('/'))
        location += '/'
    // append key to url
    location += key()
    // update the output textbox
    $('#output').val(location)
}

/**
 * Alertify framework utility method (due to missing typescript types)
 *
 * @param success - {@code FALSE} will turn the alert red and {@code TRUE} will turn it green
 * @param message - the alert message
 */
const notify = (success: boolean, message: string): void => {
    // @ts-ignore
    const $alertify: any = alertify
    if (success) // noinspection TypeScriptValidateJSTypes
        $alertify.success(message)
    else {
        $alertify.error(message)
        // @ts-ignore
        // reset google recaptcha (to allow a next try)
        grecaptcha.reset()
    }
}

/* Form validation of the #location element */
const validateLocation = (): void => {
    const location: JQuery<HTMLInputElement> = $('#location')
    formStatus(location, checkUrl(location.val() as string))
}

/**
 * Form validation of the #key element
 *
 * @param highlight - should the element be highlighted on successful validation?
 */
const validateKey = (highlight: boolean): void => {
    const keyElement: JQuery<HTMLInputElement> = $('#key')
    if (properties.key.regex.test(key())) {
        if (highlight) {
            updateOutput()
            formStatus(keyElement, true)
        }
    } else formStatus(keyElement, false)
}

/**
 * Copies text of the #output element to the clipboard
 */
const copy = (): void => {
    // select output element
    // noinspection JSDeprecatedSymbols
    $('#output').select()
    // execute copy command
    document.execCommand('copy')
    // notify the user
    notify(true, 'Copied to clipboard!')
}

// noinspection JSUnusedGlobalSymbols
/* recaptcha onload callback */
function show() {
    // make centered container visible after captcha has been loaded
    $('#center').removeAttr('hidden')
}

// noinspection JSUnusedGlobalSymbols
/**
 * Submit callback (invoked by recaptcha)
 *
 * @param response - the recaptcha response
 */
function submit(response?: string): void {
    const location: JQuery<HTMLInputElement> = $('#location')
    if (!location.hasClass('uk-form-success') || $('#key').hasClass('uk-form-danger')) {
        notify(false, 'Fill in the form correctly!')
        validateLocation()
        validateKey(false)
        return
    }
    // noinspection JSIgnoredPromiseFromCall
    $.ajax({
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: `/api/v1/create/${key()}`,
        data: JSON.stringify({
            location: location.val(),
            instant: $('#instant-redirect').prop('checked'),
            response
        }),
        error: (jqXHR, message, error) => notify(false, (jqXHR.responseJSON || {error: {}}).error.message || error),
        success: () => notify(true, 'Success!')
    })
}

// noinspection RegExpRedundantEscape
/**
 * Validates an URL
 * adopted from: http://stackoverflow.com/questions/1303872/ddg#8317014
 *
 * @param url - the URL string
 * @return boolean - will be {@code TRUE} if string is a valid url
 */
const checkUrl = (url: string): boolean => /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/.test(url)

/**
 * Updates a {@link HTMLInputElement}s status (form validation util)
 *
 * @param element - the {@link HTMLInputElement} extraced with {@link JQuery}
 * @param status - {@code FALSE} will turn the element red and {@code TRUE} green
 */
const formStatus = (element: JQuery<HTMLInputElement>, status: boolean): void => {
    if (status) {
        if (element.hasClass('uk-form-danger'))
            element.removeClass('uk-form-danger')
        if (!element.hasClass('uk-form-success'))
            element.addClass('uk-form-success')
    } else {
        if (element.hasClass('uk-form-success'))
            element.removeClass('uk-form-success')
        if (!element.hasClass('uk-form-danger'))
            element.addClass('uk-form-danger')
    }
}

$(() => {
    updateOutput()
    // listen to location input
    $('#location').on('input propertychange paste', validateLocation)
    // listen to key input change
    $('#key').on('input propertychange paste', () => validateKey(true))
})