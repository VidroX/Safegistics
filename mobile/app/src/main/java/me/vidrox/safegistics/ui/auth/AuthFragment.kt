package me.vidrox.safegistics.ui.auth

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import me.vidrox.safegistics.App
import me.vidrox.safegistics.BuildConfig
import me.vidrox.safegistics.R
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.apollo.entities.UserData
import me.vidrox.safegistics.databinding.AuthFragmentBinding
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.RequestListener
import me.vidrox.safegistics.ui.main.MainViewModel
import me.vidrox.safegistics.users.LoginMutation
import org.joda.time.LocalDate
import org.joda.time.LocalDateTime
import javax.inject.Inject

class AuthFragment : Fragment(), RequestListener<LoginMutation.Data> {

    companion object {
        fun newInstance() = AuthFragment()
    }

    @Inject
    lateinit var user: User

    private val viewModel: AuthViewModel by viewModels()

    private lateinit var dataBinding: AuthFragmentBinding
    private lateinit var progress: LinearLayout

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {

         dataBinding =
            DataBindingUtil.inflate(inflater, R.layout.auth_fragment, container, false)

        dataBinding.viewmodel = viewModel

        App.appComponent.inject(this@AuthFragment)

        progress = activity?.findViewById(R.id.mainProgressBar) as LinearLayout

        setHasOptionsMenu(true)

        (requireActivity() as AppCompatActivity).supportActionBar?.title =
            getString(R.string.log_into_safegistics)

        return dataBinding.root
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        dataBinding.viewmodel?.authListener = this
    }

    override fun onRequest() {
        if (BuildConfig.DEBUG) {
            Log.d("AuthFragment", "Request started")
        }

        dataBinding.authBoxEmail.error = null
        dataBinding.authBoxPassword.error = null
        progress.visibility = View.VISIBLE
    }

    override fun onSuccess(result: LoginMutation.Data?) {
        if (BuildConfig.DEBUG) {
            Log.d("AuthFragment", "Request completed without errors")
            Log.d("AuthFragment", result.toString())
        }

        progress.visibility = View.GONE

        val remoteUser = result?.login()
        if (remoteUser != null) {
            val manager = remoteUser.user()?.manager()

            user.token = remoteUser.token()?.accessToken()
            user.userData = UserData(
                __typename = remoteUser.user()?.__typename()!!,
                id = remoteUser.user()?.id()!!,
                Cls = remoteUser.user()?.Cls()!!,
                email = remoteUser.user()?.email()!!,
                mobilePhone = remoteUser.user()?.mobilePhone()!!,
                firstName = remoteUser.user()?.firstName()!!,
                lastName = remoteUser.user()?.lastName()!!,
                patronymic = remoteUser.user()?.patronymic()!!,
                birthday = LocalDate(remoteUser.user()?.birthday()!!).toString(),
                dateJoined = LocalDateTime(remoteUser.user()?.dateJoined()).toString(),
                isActive = remoteUser.user()?.isActive!!,
                isStaff = remoteUser.user()?.isStaff,
                manager = if (manager != null) UserData(
                    __typename = manager.__typename(),
                    id = manager.id(),
                    Cls = manager.Cls()!!,
                    email = manager.email()!!,
                    mobilePhone = manager.mobilePhone(),
                    firstName = manager.firstName(),
                    lastName = manager.lastName(),
                    patronymic = manager.patronymic()!!,
                    birthday = LocalDate(manager.birthday()).toString(),
                    dateJoined = LocalDateTime(manager.dateJoined()).toString(),
                    isActive = manager.isActive!!,
                    isStaff = manager.isStaff,
                    manager = null
                ) else null
            )

            user.save(requireContext())
        }

        requireActivity().invalidateOptionsMenu()

        val navController = findNavController()
        val direction = AuthFragmentDirections.actionAuthFragmentToMainFragment()
        navController.navigate(direction)
    }

    override fun onError(e: List<ExceptionWithCode>, message: String) {
        progress.visibility = View.GONE

        if (message.isNotEmpty()) {
            Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
            return
        }

        e.forEach {
            if (BuildConfig.DEBUG) {
                Log.e("AuthFragment", "Code: ${it.code}, Message: ${it.message}")
            }

            when (it.code){
                100, -1 -> {
                    dataBinding.authBoxEmail.error = getString(R.string.incorrect_credentials)
                    dataBinding.authBoxPassword.error = getString(R.string.incorrect_credentials)
                }
                else -> {
                    Toast.makeText(
                        requireContext(),
                        getString(R.string.internal_error),
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
}
