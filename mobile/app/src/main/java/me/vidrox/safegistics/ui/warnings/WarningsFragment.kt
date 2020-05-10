package me.vidrox.safegistics.ui.warnings

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.viewModels
import me.vidrox.safegistics.R

class WarningsFragment : Fragment() {

    companion object {
        fun newInstance() = WarningsFragment()
    }

    private val viewModel: WarningsViewModel by viewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {

        (requireActivity() as AppCompatActivity).supportActionBar?.title =
            getString(R.string.warnings)

        return inflater.inflate(R.layout.warnings_fragment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
    }

}
