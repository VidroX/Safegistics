package me.vidrox.safegistics

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.viewModels
import androidx.lifecycle.Observer
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.ui.main.MainViewModel
import javax.inject.Inject

class MainActivity : AppCompatActivity() {
    @Inject
    lateinit var user: User

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_activity)

        App.appComponent.inject(this)

        val userObserver = Observer<User?> { newUser ->
            user.userData = newUser?.userData
            user.token = newUser?.token
            user.save(applicationContext)

            invalidateOptionsMenu()
        }
        viewModel.user.observe(this, userObserver)

        /*val direction = MainFragmentDirections.actionMainFragmentToAuthFragment()
        val navController = findNavController(R.id.nav_host_fragment)
        navController.navigate(direction)*/
    }
}
