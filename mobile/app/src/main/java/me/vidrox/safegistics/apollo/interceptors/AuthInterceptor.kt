package me.vidrox.safegistics.apollo.interceptors

import android.content.Context
import android.util.Log
import androidx.navigation.Navigation.findNavController
import me.vidrox.safegistics.BuildConfig
import me.vidrox.safegistics.MainActivity
import me.vidrox.safegistics.R
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.ui.main.MainFragmentDirections
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.lang.Exception
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    var context: Context,
    var user: User
): Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var newRequest: Request = chain.request()

        if (User.isTokenExpired(user)) {
            user.userData = null
            user.token = null

            User.clear(context)

            val activity: MainActivity? = context as? MainActivity

            if (activity != null) {
                try {
                    val direction = MainFragmentDirections.actionMainFragmentToAuthFragment()
                    val navController = findNavController(activity, R.id.nav_host_fragment)
                    navController.navigate(direction)
                } catch (e: Exception) {
                    if (BuildConfig.DEBUG) {
                        Log.e("AuthInterceptor", e.toString())
                    }
                }
            }
        } else {
            newRequest = newRequest.newBuilder()
                .addHeader(
                    "Authorization",
                    "Bearer ${user.token}"
                )
                .build()
        }

        return chain.proceed(newRequest)
    }
}