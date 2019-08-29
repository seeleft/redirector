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

import Lodash from 'lodash'
import Handlebars from 'handlebars'
import {Response} from 'express'
import {args} from '../main'
import StringUtil from './StringUtil'

export default class Templates {

    private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map()

    private readonly components: any = {}

    constructor(templates: Array<string>, components: Array<string>) {
        // prerender/compile page templates
        templates.forEach(template => this.templates.set(template, Templates.compile(template)))
        // parse page components
        components.forEach(component => {
            const fileName: string = `${component}.html`
            this.components[component] = `\r<!-- component: ${fileName} -->\n${StringUtil.fromFile(`./templates/components/${fileName}`)}`
        })
    }

    // compile page template
    static compile = (template: string): HandlebarsTemplateDelegate => Handlebars.compile(StringUtil.fromFile(`./templates/${template}.hbs`))

    render = (template: string, response: Response, context: any = {}) => {
        // merge context with default values
        context = Lodash.merge({
            debug: args.get('debug'),
            components: this.components
        }, context)
        // lookup template
        const templateDelegate: HandlebarsTemplateDelegate | undefined = (context.debug ? Templates.compile(template) : this.templates.get(template))
        // check if template is available
        if (!templateDelegate) {
            response.sendStatus(500)
            return
        }
        // render template
        let content: string = templateDelegate(context)
        // render template and send response to the client
        response.contentType('text/html').send(content)
    }

}
