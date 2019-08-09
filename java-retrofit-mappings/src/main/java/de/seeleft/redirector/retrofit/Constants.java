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

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import retrofit2.Retrofit;

import java.io.IOException;
import java.util.Objects;
import java.util.Properties;

/**
 * Constants class which gets its properties from a classpath meta file
 *
 * @since 1.0
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
final class Constants
{

    /* meta file in the classpath to load the properties from */
    private static final String META_FILE = ".meta";

    static final String URL, RETROFIT_VERSION, VERSION;

    static
    {

        final var properties = new Properties();

        // load properties from classpath meta file
        try (final var stream = ClassLoader.getSystemResourceAsStream(META_FILE))
        {
            properties.load(Objects.requireNonNull(stream));
        } catch (final IOException | NullPointerException e)
        {
            e.printStackTrace();
        }

        // assign properties
        URL = properties.getProperty("url", "https://seeleft.de/go/api/v1/");
        RETROFIT_VERSION = properties.getProperty("retrofit.version",
                Retrofit.class.getPackage().getImplementationVersion());
        VERSION = properties.getProperty("version",
                Constants.class.getPackage().getImplementationVersion());

    }

}
