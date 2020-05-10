package me.vidrox.safegistics

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import androidx.navigation.findNavController
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.ui.auth.AuthFragmentDirections
import me.vidrox.safegistics.ui.main.MainFragmentDirections
import javax.inject.Inject

class MainActivity : AppCompatActivity() {
    @Inject
    lateinit var user: User

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_activity)

        App.appComponent.inject(this)

        if (savedInstanceState == null && user.userData != null &&
            user.token != null && !User.isTokenExpired(user)) {

            val direction = AuthFragmentDirections.actionAuthFragmentToMainFragment()
            val navController = findNavController(R.id.nav_host_fragment)
            navController.navigate(direction)
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        if (user.userData != null) {
            val inflater: MenuInflater = menuInflater
            inflater.inflate(R.menu.toolbar_user_menu, menu)

            return true
        }
        return false
    }

    override fun onPrepareOptionsMenu(menu: Menu?): Boolean {
        val item = menu?.findItem(R.id.user_name)
        item?.isEnabled = false

        if (user.userData != null) {
            val userData = user.userData
            item?.title = userData!!.lastName + " " + userData.firstName
        }

        return super.onPrepareOptionsMenu(menu)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.logout_button -> {
                logoutUser()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp() =
        findNavController(R.id.nav_host_fragment).navigateUp()

    private fun logoutUser() {
        User.clear(applicationContext)
        user.userData = null
        user.token = null

        invalidateOptionsMenu()

        val direction = MainFragmentDirections.actionMainFragmentToAuthFragment()
        val navController = findNavController(R.id.nav_host_fragment)
        navController.navigate(direction)
    }
}
