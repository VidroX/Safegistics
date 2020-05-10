package me.vidrox.safegistics.apollo.repositories

import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.coroutines.toDeferred
import me.vidrox.safegistics.App
import me.vidrox.safegistics.apollo.ApolloRequest
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.users.LoginMutation
import javax.inject.Inject

class AuthRepository: ApolloRequest() {
    @Inject
    lateinit var apollo: ApolloClient
    @Inject
    lateinit var user: User

    init {
        App.appComponent.inject(this)
    }

    suspend fun login(email: String, password: String): LoginMutation.Data {
        val loginMutation = LoginMutation.builder()
            .email(email)
            .password(password)
            .build()

        return request {
            apollo.mutate(loginMutation).toDeferred().await()
        }
    }
}