package me.vidrox.safegistics.ui.auth

import android.view.View
import androidx.lifecycle.ViewModel
import com.apollographql.apollo.exception.ApolloNetworkException
import me.vidrox.safegistics.apollo.repositories.AuthRepository
import me.vidrox.safegistics.exceptions.ApiExceptions
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.RequestListener
import me.vidrox.safegistics.users.LoginMutation
import me.vidrox.safegistics.utils.Coroutines

class AuthViewModel : ViewModel() {
    var email: String? = null
    var password: String? = null
    var authListener: RequestListener<LoginMutation.Data>? = null

    private val authRepository: AuthRepository = AuthRepository()

    fun onLoginBtnClick(view: View) {
        authListener?.onRequest()
        val localErrors = arrayListOf<ExceptionWithCode>()

        if (email.isNullOrEmpty()) {
            localErrors.add(ExceptionWithCode(-2, "This field cannot be empty"))
        }

        if (password.isNullOrEmpty()) {
            localErrors.add(ExceptionWithCode(-3, "This field cannot be empty"))
        }

        if (email.isNullOrEmpty() || password.isNullOrEmpty()) {
            authListener?.onError(localErrors)
            return
        }

        Coroutines.mainThread {
            try {
                val result = authRepository.login(email ?: "", password ?: "")

                authListener?.onSuccess(result)
            } catch (e: ApiExceptions) {
                authListener?.onError(e.exceptions)
            } catch (e: ApolloNetworkException) {
                localErrors.add(ExceptionWithCode(-4, "Cannot connect to server"))
                authListener?.onError(localErrors)
            }

            return@mainThread
        }
    }
}
