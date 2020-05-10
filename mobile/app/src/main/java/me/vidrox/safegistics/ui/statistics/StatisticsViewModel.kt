package me.vidrox.safegistics.ui.statistics

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.apollographql.apollo.exception.ApolloNetworkException
import me.vidrox.safegistics.apollo.repositories.UsersRepository
import me.vidrox.safegistics.apollo.repositories.WarningsRepository
import me.vidrox.safegistics.exceptions.ApiExceptions
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.RequestListener
import me.vidrox.safegistics.users.AllUsersQuery
import me.vidrox.safegistics.utils.Coroutines
import me.vidrox.safegistics.warnings.WarningsQuery
import org.joda.time.LocalDate

class StatisticsViewModel : ViewModel() {
    var warningsListener: RequestListener<WarningsQuery.Data>? = null
    var usersListener: RequestListener<AllUsersQuery.Data>? = null

    var warningsLiveData: MutableLiveData<WarningsQuery.Data?> = MutableLiveData(null)
    var usersLiveData: MutableLiveData<AllUsersQuery.Data?> = MutableLiveData(null)
    var warningsLoading: MutableLiveData<Boolean> = MutableLiveData(false)
    var usersLoading: MutableLiveData<Boolean> = MutableLiveData(false)

    val warningsRepository: WarningsRepository = WarningsRepository()
    val usersRepository: UsersRepository = UsersRepository()

    fun reset() {
        warningsLiveData = MutableLiveData(null)
        usersLiveData = MutableLiveData(null)
        warningsLoading = MutableLiveData(false)
        usersLoading = MutableLiveData(false)
    }

    fun getWarnings () {
        warningsListener?.onRequest()

        Coroutines.mainThread {
            val localErrors = arrayListOf<ExceptionWithCode>()

            try {
                val response = warningsRepository.loadWarnings(
                    rowsPerPage = null,
                    dateFrom = LocalDate.now().minusWeeks(1),
                    dateTo = LocalDate.now().plusDays(1)
                )
                if (response.warnings() != null) {
                    warningsListener?.onSuccess(response)
                    return@mainThread
                }

                localErrors.add(ExceptionWithCode(-1, "No results queried"))
                warningsListener?.onError(localErrors)
            } catch(e: ApiExceptions){
                warningsListener?.onError(e.exceptions)
            } catch (e: ApolloNetworkException) {
                localErrors.add(ExceptionWithCode(-4, "Cannot connect to server"))
                warningsListener?.onError(localErrors)
            }
        }
    }

    fun getUsers () {
        usersListener?.onRequest()

        Coroutines.mainThread {
            val localErrors = arrayListOf<ExceptionWithCode>()

            try {
                val response = usersRepository.getUsers(
                    rowsPerPage = 0
                )
                if (response.allUsers() != null) {
                    usersListener?.onSuccess(response)
                    return@mainThread
                }

                localErrors.add(ExceptionWithCode(-1, "No results queried"))
                usersListener?.onError(localErrors)
            } catch(e: ApiExceptions){
                usersListener?.onError(e.exceptions)
            } catch (e: ApolloNetworkException) {
                localErrors.add(ExceptionWithCode(-4, "Cannot connect to server"))
                usersListener?.onError(localErrors)
            }
        }
    }
}
