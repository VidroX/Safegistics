package me.vidrox.safegistics.apollo.entities

import android.content.Context
import android.util.Log
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import me.vidrox.safegistics.Config
import me.vidrox.safegistics.utils.Crypto
import javax.inject.Inject

@JsonClass(generateAdapter = true)
data class UserData(
    var id: String,
    var __typename: String,
    var Cls: String,
    var email: String,
    var mobilePhone: String,
    var firstName: String,
    var lastName: String,
    var patronymic: String,
    var birthday: String,
    var dateJoined: String,
    var isActive: Boolean,
    var isStaff: Boolean?,
    var manager: UserData?
)

class User @Inject constructor(
    var userData: UserData?,
    var token: String?
) {
    fun save(context: Context): Boolean {
        try {
            val sharedPref = context.getSharedPreferences(
                Config.USER_SHARED_PREFERENCES,
                Context.MODE_PRIVATE
            )

            val moshi = Moshi.Builder().build()
            val jsonAdapter = moshi.adapter(UserData::class.java)

            with(sharedPref.edit()) {
                token.let {
                    putString(
                        Crypto.encode64(".Token"),
                        if (it != null)
                            Crypto.encode64(it)
                        else ""
                    )
                }
                userData.let {
                    putString(
                        Crypto.encode64(".UserData"),
                        if (it != null)
                            Crypto.encode64(jsonAdapter.toJson(it))
                        else ""
                    )
                }

                apply()
            }
        } catch (ex: Exception) {
            Log.e("UserSession_Save", ex.toString())
            return false
        }

        return true
    }

    companion object {
        private val dummyUser = User(
            null,
            null
        )

        fun get(context: Context): User {
            try {
                val sharedPref = context.getSharedPreferences(
                    Config.USER_SHARED_PREFERENCES,
                    Context.MODE_PRIVATE
                )

                val moshi = Moshi.Builder().build()
                val jsonAdapter = moshi.adapter<UserData>(UserData::class.java)

                val userDataString =
                    sharedPref.getString(Crypto.encode64(".UserData"), null)

                val userToken =
                    sharedPref.getString(Crypto.encode64(".Token"), null)

                if (userToken != null && userToken.isNotEmpty() &&
                    userDataString != null && userDataString.isNotEmpty()) {

                    val decryptedUserData = Crypto.decode64(userDataString)
                    val decryptedUserToken = Crypto.decode64(userToken)

                    val userData = jsonAdapter.fromJson(decryptedUserData)

                    return User(userData, decryptedUserToken)
                }
            } catch (ex: Exception) {
                Log.e("UserSession_Get", ex.toString())
                return dummyUser
            }

            return dummyUser
        }

        fun clear(context: Context): Boolean {
            try {
                val sharedPref = context.getSharedPreferences(
                    Config.USER_SHARED_PREFERENCES,
                    Context.MODE_PRIVATE
                )

                with(sharedPref.edit()) {
                    remove(Crypto.encode64(".UserData"))
                    remove(Crypto.encode64(".Token"))

                    apply()
                }
            } catch (ex: Exception) {
                Log.e("UserSession_Clear", ex.toString())
                return false
            }

            return true
        }

        fun isTokenExpired(user: User?): Boolean {
            return false
        }
    }

}