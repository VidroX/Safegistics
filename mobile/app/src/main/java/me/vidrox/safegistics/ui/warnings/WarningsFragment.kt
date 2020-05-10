package me.vidrox.safegistics.ui.warnings

import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import kotlinx.android.synthetic.main.warnings_fragment.*
import kotlinx.android.synthetic.main.warnings_info.view.*
import me.vidrox.safegistics.BuildConfig
import me.vidrox.safegistics.Config
import me.vidrox.safegistics.R
import me.vidrox.safegistics.adapters.recyclerview.WarningsRecyclerViewAdapter
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.recyclerview.LoadMoreListener
import me.vidrox.safegistics.listeners.recyclerview.PageRequestListener
import me.vidrox.safegistics.listeners.recyclerview.RecyclerScrollListener
import me.vidrox.safegistics.listeners.recyclerview.RecyclerViewItemClickListener
import me.vidrox.safegistics.warnings.WarningsQuery
import org.joda.time.LocalDateTime
import java.util.*
import kotlin.collections.HashMap

class WarningsFragment :
    Fragment(),
    PageRequestListener<WarningsQuery.Data>,
    LoadMoreListener,
    RecyclerViewItemClickListener<WarningsQuery.Node> {

    companion object {
        fun newInstance() = WarningsFragment()
    }

    private lateinit var progress: LinearLayout
    private lateinit var bottomProgress: LinearLayout
    private lateinit var mLayoutManager: LinearLayoutManager

    private val viewModel: WarningsViewModel by viewModels()

    private lateinit var warningsAdapter: WarningsRecyclerViewAdapter

    private var refreshing = false
    private var mScrollListener: RecyclerScrollListener? = null

    private fun generateAdditionalData(warnings: List<WarningsQuery.Node>):
            HashMap<WarningsQuery.Node, HashMap<String, Any>> {

        val result: HashMap<WarningsQuery.Node, HashMap<String, Any>> = HashMap()

        for (warning in warnings) {
            result[warning] = HashMap()
            if (warning.type() == "sleeping") {
                result[warning]?.set("icon", R.drawable.ic_warning_severe)
                result[warning]?.set("type", getString(R.string.sleeping))
            } else {
                result[warning]?.set("icon", R.drawable.ic_warning_moderate)
                result[warning]?.set("type", getString(R.string.other))
            }
        }

        return result
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        warningsAdapter = WarningsRecyclerViewAdapter(arrayListOf(), hashMapOf(), getCurrentLocale())

        mLayoutManager = LinearLayoutManager(context)

        warnings_recycler.apply {
            layoutManager = mLayoutManager
            adapter = warningsAdapter
        }

        mScrollListener = RecyclerScrollListener(mLayoutManager)
        mScrollListener?.setOnLoadMoreListener(this)

        warnings_recycler.addOnScrollListener(mScrollListener!!)

        warnings_recycler.setHasFixedSize(true)
        warnings_recycler.setItemViewCacheSize(20)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {

        (requireActivity() as AppCompatActivity).supportActionBar?.title =
            getString(R.string.warnings)

        return inflater.inflate(R.layout.warnings_fragment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)

        progress = requireActivity().findViewById(R.id.warnings_progress) as LinearLayout
        bottomProgress = requireActivity().findViewById(R.id.warnings_bottom_progress) as LinearLayout

        viewModel.requestListener = this

        warningsAdapter.itemClickListener = this

        warnings_recycler_wrapper.setOnRefreshListener {
            refresh()
            viewModel.getWarnings(null)
        }

        if (viewModel.warningsLiveData.value.isNullOrEmpty() ||
            viewModel.warningsLiveData.value!!.size <= 0) {
            if (!refreshing) {
                viewModel.getWarnings(null)
            }
        }

        if (!viewModel.warningsLiveData.value.isNullOrEmpty() &&
            viewModel.warningsLiveData.value != warningsAdapter.warnings) {
            warningsAdapter.updateData(
                viewModel.warningsLiveData.value!!,
                generateAdditionalData(viewModel.warningsLiveData.value!!),
                clearItems = true
            )
        }
    }

    private fun refresh() {
        refreshing = true
        warnings_recycler.removeOnScrollListener(mScrollListener!!)
        mScrollListener = RecyclerScrollListener(mLayoutManager)
        mScrollListener?.setOnLoadMoreListener(this)
        warnings_recycler.addOnScrollListener(mScrollListener!!)
        viewModel.reset()
    }

    override fun onRequest() {
        if (viewModel.warningsLiveData.value.isNullOrEmpty() ||
            viewModel.warningsLiveData.value!!.size <= 0) {
            if (!refreshing) {
                progress.visibility = View.VISIBLE
            }
        } else {
            if (viewModel.hasNextPage.value!! &&
                viewModel.warningsLiveData.value!!.size >= Config.API_ROW_COUNT) {
                if (!refreshing) {
                    bottomProgress.visibility = View.VISIBLE
                }
            }
        }
    }

    override fun onSuccess(result: WarningsQuery.Data, cursor: String, hasNextPage: Boolean) {
        progress.visibility = View.GONE
        bottomProgress.visibility = View.GONE
        mScrollListener?.setLoaded()

        val edges = result.warnings()?.edges()

        if (!edges.isNullOrEmpty()) {
            val nodeList = arrayListOf<WarningsQuery.Node>()

            edges.forEach {
                if (it.node() != null) {
                    nodeList.add(it.node()!!)
                }
            }

            viewModel.warningsLiveData.value!!.addAll(nodeList)

            if (refreshing) {
                warningsAdapter.updateData(
                    nodeList,
                    generateAdditionalData(viewModel.warningsLiveData.value!!),
                    clearItems = true
                )
            } else {
                warningsAdapter.updateData(
                    nodeList,
                    generateAdditionalData(viewModel.warningsLiveData.value!!),
                    clearItems = false
                )
            }
            viewModel.hasNextPage.value = result.warnings()?.pageInfo()?.hasNextPage()
            viewModel.endCursor.value = result.warnings()?.pageInfo()?.endCursor()
        } else {
            viewModel.hasNextPage.value = false
        }

        if (refreshing) {
            warnings_recycler_wrapper.isRefreshing = false
            refreshing = false
        }
    }

    override fun onError(e: List<ExceptionWithCode>) {
        progress.visibility = View.GONE
        bottomProgress.visibility = View.GONE
        mScrollListener?.setLoaded()

        if (refreshing) {
            warnings_recycler_wrapper.isRefreshing = false
            refreshing = false
        }
    }

    override fun onLoadMore() {
        if (viewModel.hasNextPage.value!! && viewModel.warningsLiveData.value!!.size >= Config.API_ROW_COUNT && !refreshing) {
            if (BuildConfig.DEBUG) {
                Log.d("WarningsFragment", "Loading more data")
                Log.d("WarningsFragment", "End cursor: ${viewModel.endCursor.value}")
            }
            viewModel.getWarnings(viewModel.endCursor.value!!)
        }
    }

    override fun onClick(itemData: WarningsQuery.Node?) {
        if (itemData != null) {
            val dialogBuilder = AlertDialog.Builder(requireContext())
            val inflater = requireActivity().layoutInflater
            val view = inflater.inflate(R.layout.warnings_info, null)

            val locale = getCurrentLocale()

            val driver = itemData.device()?.driver()
            val driverName = if (
                !driver?.firstName().isNullOrEmpty() &&
                !driver?.lastName().isNullOrEmpty() &&
                !driver?.patronymic().isNullOrEmpty()
            ) {
               "${driver?.firstName()} ${driver?.lastName()} ${driver?.patronymic()}"
            } else {
                getString(R.string.no_driver_device)
            }

            val date = if (locale.language == "en") {
                LocalDateTime(itemData.dateIssued()).toString("MM/dd/YYYY HH:mm", locale)
            } else {
                LocalDateTime(itemData.dateIssued()).toString("dd.MM.YYYY HH:mm", locale)
            }

            val type = if (itemData.type() == "sleeping") {
                getString(R.string.sleeping)
            } else {
                getString(R.string.other)
            }

            val severity = if (itemData.type() == "sleeping") {
                getString(R.string.severe)
            } else {
                getString(R.string.moderate)
            }

            view.device_id.text = itemData.device()?.deviceId() ?: getString(R.string.no_device)
            view.driver_full_name.text = driverName
            view.date_issued.text = date
            view.type.text = type
            view.severity.text = severity

            dialogBuilder.setView(view)
                .setCancelable(true)
                .setPositiveButton(getString(R.string.ok)) { dialog, _ -> dialog.cancel() }

            val alert = dialogBuilder.create()

            alert.setOnShowListener {
                val color = ContextCompat.getColor(requireContext(), R.color.colorAccent)
                alert.getButton(AlertDialog.BUTTON_POSITIVE).setTextColor(color)
            }

            alert.setTitle(getString(R.string.warning_info_title))
            alert.show()
        }
    }

    override fun onLongClick(view: View, itemData: WarningsQuery.Node?) {

    }

    private fun getCurrentLocale(): Locale =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N){
            requireContext().resources.configuration.locales[0];
        } else{
            requireContext().resources.configuration.locale;
        }
}
