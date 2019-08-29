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

import {Log} from '../../main'
import Redirect from '../Redirect'
import IDatabase from '../IDatabase'
import {Collection, MongoClient} from 'mongodb'

/*
 * MongoDB implementation of a database
 */
export default class MongoDatabaseImpl implements IDatabase {

    private client?: MongoClient

    private collection?: Collection

    connect = (uri: string, options: any): Promise<IDatabase> => new Promise((resolve, reject) => {
        MongoClient.connect(uri, {useNewUrlParser: true}, (error, client) => {
            if (error)
                reject(error)
            else {
                this.client = client
                this.collection = this.client.db(options.database || 'admin').collection(options.collection || 'redirects')
                resolve(this)
            }
        })
    })

    find = (key: string): Promise<Redirect> => new Promise((resolve, reject) => {
        if (!this.collection)
            reject(new Error('Database initialization error.'))
        else this.collection.find({_key: {$eq: key}}).toArray((error, documents) => {
            if (error)
                reject(error)
            else if (!documents || 0 == documents.length)
                reject(new Error(`No document found for key '${key}'.`))
            else
                resolve(Redirect.fromJson(documents[0]))
        })
    })

    delete = (key: string): Promise<void> => new Promise((resolve, reject) => {
        if (!this.collection)
            reject(new Error('Database initialization error.'))
        else this.collection.deleteOne({_key: {$eq: key}}, (error, result) => {
            if (error)
                reject(error)
            else if (0 == result.result.n)
                reject(new Error(`No document found for key '${key}'.`))
            else
                resolve()
        })
    })

    insert = (redirect: Redirect): Promise<void> => new Promise((resolve, reject) => {
        if (!this.collection)
            reject(new Error('Database initialization error.'))
        else {
            const collection: Collection = this.collection
            collection.findOne({_key: {$eq: redirect.key()}}, (error, document) => {
                if (error || !document)
                    collection.insertOne(redirect.toJson(), error => {
                        if (error) reject(error)
                        else resolve()
                    })
                else reject(new Error('Redirect already existing.'))
            })
        }
    })

    close(): void {
        if (this.client)
            this.client.close(true, error => {
                if (error)
                    Log.warn(`Could not close database connection: ${error.message}`)
            })
    }
}