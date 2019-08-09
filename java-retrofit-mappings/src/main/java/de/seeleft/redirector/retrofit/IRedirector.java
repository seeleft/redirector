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

package de.seeleft.redirector.retrofit;

import de.seeleft.redirector.retrofit.response.RedirectorResponse;
import de.seeleft.redirector.retrofit.util.okhttp.AuthorizationInterceptor;
import lombok.NonNull;
import okhttp3.OkHttpClient;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.http.*;

/**
 * Retrofit2 mappings for the redirector's http/rest endpoints
 *
 * @author Daniel Riegler
 * @since 1.0
 */
@SuppressWarnings("unused")
public interface IRedirector
{

    /** version of the framework */
    String VERSION = Constants.VERSION;

    /** version of the {@link Retrofit} framework */
    String RETROFIT_VERSION = Constants.RETROFIT_VERSION;

    /**
     * Creates or updates an existing redirect
     *
     * @param url - the url of the redirect to create
     * @param key - the key of the redirect to create (will be overwritten if exists)
     *
     * @return {@link Call<RedirectorResponse>}
     * TODO: change url to body part: location
     */
    @POST("/create/{key}")
    Call<RedirectorResponse> create(final @NonNull @Body String url, final @NonNull @Path("key") String key);

    /**
     * Looks up and deletes a redirect
     *
     * @param key - the key of the redirect to delete
     *
     * @return {@link Call<RedirectorResponse>}
     */
    @DELETE("/delete/{key}")
    Call<RedirectorResponse> delete(final @NonNull @Path("key") String key);

    /**
     * Helper method used to setup {@link Retrofit} and create the {@link IRedirector} mappings
     *
     * @param interceptor - the {@link AuthorizationInterceptor} to use
     * @param baseUrl     - the url of the redirector instance (default: {@link IRedirector#DEFAULT_BASE_URL})
     *
     * @return - the {@link IRedirector} mappings
     */
    static IRedirector create(final @NonNull AuthorizationInterceptor interceptor, final String baseUrl)
    {
        return new Retrofit.Builder().
                baseUrl(null != baseUrl ? baseUrl : Constants.URL).
                client(interceptor.okhttp(new OkHttpClient())).
                validateEagerly(true).build().
                create(IRedirector.class);
    }

}
