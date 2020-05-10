package me.vidrox.safegistics.apollo.interceptors

import me.vidrox.safegistics.apollo.entities.User
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    var user: User
): Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var newRequest: Request = chain.request()

        newRequest = newRequest.newBuilder()
            .addHeader(
                "Authorization",
                "Bearer " + if (user.token.isNullOrEmpty()) "" else user.token!!
            )
            .build()

        return chain.proceed(newRequest)
    }
}