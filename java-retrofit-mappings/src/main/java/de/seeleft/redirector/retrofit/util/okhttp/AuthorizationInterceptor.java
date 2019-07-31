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

package de.seeleft.redirector.retrofit.util.okhttp;

import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import retrofit2.Retrofit;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

/**
 * Utility responsible for adding authentication to retrofit's underlaying okhttp client
 *
 * @since 1.0
 */
@AllArgsConstructor
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class AuthorizationInterceptor implements Interceptor
{

    /** expected authorization header value */
    private final @NonNull String expect;

    /** name of the header used for authorization */
    private @NonNull String header = "Authorization";

    @Override
    public Response intercept(final Chain chain) throws IOException
    {
        return chain.proceed(chain.request().newBuilder().addHeader(this.header, this.expect).build());
    }

    /**
     * Reflectively add the {@link AuthorizationInterceptor} to a {@link Retrofit} instance's {@link OkHttpClient}
     *
     * @param retrofit - the {@link Retrofit} instance for which to add the {@link AuthorizationInterceptor}
     *
     * @return - the {@link Retrofit} instance which's {@link OkHttpClient} got added the
     * {@link AuthorizationInterceptor}
     */
    public Retrofit retrofit(final @NonNull Retrofit retrofit)
    {
        try
        {

            final var callFactory = retrofit.callFactory();

            final var clientBuilder = callFactory.getClass().getMethod("newBuilder").invoke(callFactory);
            clientBuilder.getClass().getMethod("addInterceptor", Interceptor.class).invoke(clientBuilder, this);

            final var client = (OkHttpClient) clientBuilder.getClass().getMethod("build").invoke(clientBuilder);

            final var retrofitConstructor = Retrofit.Builder.class.getDeclaredConstructor(Retrofit.class);
            retrofitConstructor.setAccessible(true);

            final var retrofitBuilder = retrofitConstructor.newInstance(retrofit);
            retrofitBuilder.getClass().getMethod("client", OkHttpClient.class).invoke(retrofitBuilder, client);

            return (Retrofit) retrofitBuilder.getClass().getDeclaredMethod("build").invoke(retrofitBuilder);

        } catch (final IllegalAccessException | NoSuchMethodException | InvocationTargetException | InstantiationException e)
        {
            throw new RuntimeException(e);
        }
    }

    /**
     * Adds the {@link AuthorizationInterceptor} to an {@link OkHttpClient}
     *
     * @param client - the {@link OkHttpClient} for which to add the {@link AuthorizationInterceptor}
     *
     * @return - the {@link OkHttpClient} which got added the {@link AuthorizationInterceptor}
     */
    public OkHttpClient okhttp(final @NonNull OkHttpClient client)
    {
        return client.newBuilder().addInterceptor(this).build();
    }

}
