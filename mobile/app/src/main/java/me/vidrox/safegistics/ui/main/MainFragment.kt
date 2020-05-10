package me.vidrox.safegistics.ui.main

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.viewModels
import androidx.navigation.Navigation
import androidx.navigation.plusAssign
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import me.vidrox.safegistics.R
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.NavigationUI.setupActionBarWithNavController
import me.vidrox.safegistics.components.KeepStateNavigator

class MainFragment : Fragment() {

    companion object {
        fun newInstance() = MainFragment()
    }

    private val viewModel: MainViewModel by viewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {

        return inflater.inflate(R.layout.main_fragment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)

        setupBottomNavigationBar()
    }

    private fun setupBottomNavigationBar() {
        val bottomNavigationView = activity?.findViewById<BottomNavigationView>(R.id.navigation)
        val fragmentContainer = activity?.findViewById<View>(R.id.auth_container)
        if (fragmentContainer != null) {
            val navController = Navigation.findNavController(fragmentContainer)
            val navHostFragment = childFragmentManager.findFragmentById(R.id.auth_container)!!
            val navigator = KeepStateNavigator(requireActivity(), navHostFragment.childFragmentManager, R.id.auth_container)
            navController.navigatorProvider += navigator

            navController.setGraph(R.navigation.bottom_nav)

            val appBarConfiguration = AppBarConfiguration(
                setOf(
                    R.id.statistics_fragment, R.id.warnings_fragment
                )
            )
            setupActionBarWithNavController(
                (requireActivity() as AppCompatActivity),
                navController,
                appBarConfiguration
            )

            bottomNavigationView?.setupWithNavController(navController)
        }
    }

}
