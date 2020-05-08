package me.vidrox.safegistics

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.navigation.findNavController
import me.vidrox.safegistics.ui.main.MainFragmentDirections

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.main_activity)

        /*val direction = MainFragmentDirections.actionMainFragmentToAuthFragment()
        val navController = findNavController(R.id.nav_host_fragment)
        navController.navigate(direction)*/
    }
}
