package me.vidrox.safegistics.apollo

import com.apollographql.apollo.ApolloClient
import me.vidrox.safegistics.Config
import okhttp3.OkHttpClient

class ApolloConnector {
    companion object {
        fun setupApollo(): ApolloClient {
            val okHttpClient = OkHttpClient.Builder().build();

            return ApolloClient.builder()
                .serverUrl(Config.API_BASE_URL)
                .okHttpClient(okHttpClient)
                .build();
        }
    }
}