package me.vidrox.safegistics.ui.warnings

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.apollographql.apollo.exception.ApolloNetworkException
import me.vidrox.safegistics.Config
import me.vidrox.safegistics.apollo.repositories.WarningsRepository
import me.vidrox.safegistics.exceptions.ApiExceptions
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.recyclerview.PageRequestListener
import me.vidrox.safegistics.utils.Coroutines
import me.vidrox.safegistics.warnings.WarningsQuery

class WarningsViewModel : ViewModel() {
    var requestListener: PageRequestListener<WarningsQuery.Data>? = null

    var endCursor: MutableLiveData<String?> = MutableLiveData(null)
    var hasNextPage: MutableLiveData<Boolean> = MutableLiveData(true)
    var warningsLiveData: MutableLiveData<ArrayList<WarningsQuery.Node>> =
        MutableLiveData(arrayListOf())

    val repository: WarningsRepository = WarningsRepository()

    fun reset() {
        endCursor = MutableLiveData(null)
        hasNextPage = MutableLiveData(true)
        warningsLiveData = MutableLiveData(arrayListOf())
    }

    fun getWarnings (cursor: String?) {
        requestListener?.onRequest()

        Coroutines.mainThread {
            val localErrors = arrayListOf<ExceptionWithCode>()

            try {
                val response = repository.loadWarnings(Config.API_ROW_COUNT, cursor)

                if (response.warnings() != null && response.warnings()?.pageInfo() != null) {
                    requestListener?.onSuccess(
                        response,
                        response.warnings()!!.pageInfo().endCursor()!!,
                        response.warnings()!!.pageInfo().hasNextPage()
                    )
                }
                localErrors.add(ExceptionWithCode(-1, "No results queried"))
                requestListener?.onError(localErrors)
            } catch(e: ApiExceptions){
                requestListener?.onError(e.exceptions)
            } catch (e: ApolloNetworkException) {
                localErrors.add(ExceptionWithCode(-4, "Cannot connect to server"))
                requestListener?.onError(localErrors)
            }
        }
    }
}
