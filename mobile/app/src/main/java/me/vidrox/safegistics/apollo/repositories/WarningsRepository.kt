package me.vidrox.safegistics.apollo.repositories

import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.coroutines.toDeferred
import me.vidrox.safegistics.App
import me.vidrox.safegistics.apollo.ApolloRequest
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.warnings.WarningsQuery
import org.joda.time.LocalDate
import javax.inject.Inject

class WarningsRepository: ApolloRequest() {
    @Inject
    lateinit var apollo: ApolloClient
    @Inject
    lateinit var user: User

    init {
        App.appComponent.inject(this)
    }

    suspend fun loadWarnings(
        rowsPerPage: Int? = null,
        cursor: String? = null,
        ordering: String = "-date_issued",
        dateFrom: LocalDate? = null,
        dateTo: LocalDate? = null
    ): WarningsQuery.Data {
        var warningsQuery = WarningsQuery.builder()
            .orderBy(ordering)

        if (rowsPerPage != null) {
            warningsQuery = warningsQuery.rowsPerPage(rowsPerPage)
        }

        if (cursor != null) {
            warningsQuery = warningsQuery.cursor(cursor)
        }

        if (dateFrom != null) {
            warningsQuery = warningsQuery.fromDate(dateFrom.toString())
        }

        if (dateTo != null) {
            warningsQuery = warningsQuery.toDate(dateTo.toString())
        }

        return request {
            apollo.query(warningsQuery.build()).toDeferred().await()
        }
    }
}