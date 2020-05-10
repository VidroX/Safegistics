package me.vidrox.safegistics.apollo

import com.apollographql.apollo.ApolloClient
import me.vidrox.safegistics.Config
import me.vidrox.safegistics.apollo.interceptors.AuthInterceptor
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import javax.inject.Inject

class ApolloConnector @Inject constructor(
    val authInterceptor: AuthInterceptor
) {
    fun setupApollo(): ApolloClient {
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)
            .build()

        return ApolloClient.builder()
            .serverUrl(Config.API_BASE_URL)
            .okHttpClient(okHttpClient)
            .build()
    }
}