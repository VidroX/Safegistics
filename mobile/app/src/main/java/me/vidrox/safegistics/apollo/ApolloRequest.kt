package me.vidrox.safegistics.apollo

import android.util.Log
import com.apollographql.apollo.api.Response
import me.vidrox.safegistics.exceptions.ApiExceptions
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import java.lang.Exception

abstract class ApolloRequest {
    suspend fun<T: Any> request(call: suspend () -> Response<T>) : T{
        val response = call.invoke()

        if (!response.hasErrors() && response.data != null) {
            return response.data!!
        } else {
            val errors = arrayListOf<ExceptionWithCode>()

            response.errors?.forEach {
                Log.e("AuthFragment", it.customAttributes.toString())
                try {
                    val extensions = it.customAttributes["extensions"]
                    val code = (extensions as? Map<*, *>)?.get("code").toString().toInt()

                    errors.add(ExceptionWithCode(code, it.message))
                } catch (e: Exception) {
                    errors.add(ExceptionWithCode(-1, it.message))
                }
            }

            throw ApiExceptions(errors)
        }
    }
}
