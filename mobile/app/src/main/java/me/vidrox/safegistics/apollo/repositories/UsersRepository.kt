package me.vidrox.safegistics.apollo.repositories

import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.coroutines.toDeferred
import me.vidrox.safegistics.App
import me.vidrox.safegistics.apollo.ApolloRequest
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.users.AllUsersQuery
import javax.inject.Inject

class UsersRepository: ApolloRequest() {
    @Inject
    lateinit var apollo: ApolloClient
    @Inject
    lateinit var user: User

    init {
        App.appComponent.inject(this)
    }

    suspend fun getUsers(
        rowsPerPage: Int? = null,
        cursor: String? = null,
        ordering: String = "-id"
    ): AllUsersQuery.Data {
        var allUsersQuery = AllUsersQuery.builder()
            .orderBy(ordering)

        if (rowsPerPage != null) {
            allUsersQuery = allUsersQuery.rowsPerPage(rowsPerPage)
        }

        if (cursor != null) {
            allUsersQuery = allUsersQuery.cursor(cursor)
        }

        return request {
            apollo.query(allUsersQuery.build()).toDeferred().await()
        }
    }
}