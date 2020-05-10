package me.vidrox.safegistics.ui.statistics

import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet
import kotlinx.android.synthetic.main.statistics_fragment.*
import me.vidrox.safegistics.App
import me.vidrox.safegistics.R
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.exceptions.ExceptionWithCode
import me.vidrox.safegistics.listeners.RequestListener
import me.vidrox.safegistics.users.AllUsersQuery
import me.vidrox.safegistics.utils.CastUtils.tryCast
import me.vidrox.safegistics.warnings.WarningsQuery
import org.joda.time.LocalDateTime
import java.util.*
import javax.inject.Inject
import kotlin.collections.HashMap
import kotlin.collections.LinkedHashMap


class StatisticsFragment : Fragment() {

    companion object {
        fun newInstance() = StatisticsFragment()
    }

    @Inject
    lateinit var user: User

    private lateinit var refreshLayout: SwipeRefreshLayout
    private lateinit var progress: LinearLayout
    private lateinit var warningsChart: LineChart

    private var refreshing = false

    private val viewModel: StatisticsViewModel by viewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {

        (requireActivity() as AppCompatActivity).supportActionBar?.title =
            getString(R.string.statistics)

        App.appComponent.inject(this@StatisticsFragment)

        return inflater.inflate(R.layout.statistics_fragment, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        warningsChart = requireActivity().findViewById(R.id.statistics_warning_chart) as LineChart
        progress = requireActivity().findViewById(R.id.statistics_progress) as LinearLayout
        refreshLayout =
            requireActivity().findViewById(R.id.statistics_container) as SwipeRefreshLayout

        refreshLayout.setOnRefreshListener {
            refresh()

            if (user.userData?.isStaff != null && user.userData?.isStaff!!) {
                viewModel.getUsers()
            }

            viewModel.getWarnings()
        }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)

        if (!viewModel.usersLoading.value!! || !viewModel.warningsLoading.value!!) {
            statistics_container.visibility = View.VISIBLE
            progress.visibility = View.GONE
        } else {
            statistics_container.visibility = View.GONE
            progress.visibility = View.VISIBLE
        }

        setRequestListeners()

        if (user.userData?.isStaff != null && user.userData?.isStaff!!) {
            cardview_users.visibility = View.VISIBLE
        }

        if (user.userData?.isStaff != null && user.userData?.isStaff!! &&
            viewModel.usersLiveData.value == null) {
            if (!refreshing) {
                viewModel.getUsers()
            }
        }

        if (viewModel.warningsLiveData.value == null) {
            if (!refreshing) {
                viewModel.getWarnings()
            }
        }

        if (viewModel.warningsLiveData.value != null || viewModel.usersLiveData.value != null) {
            statistics_users_amount.text =
                viewModel.usersLiveData.value?.allUsers()?.totalCount().toString()
            statistics_warnings_amount.text =
                viewModel.warningsLiveData.value?.warnings()?.totalCount().toString()
        }

        if (viewModel.warningsLiveData.value != null) {
            buildChart()
        }
    }

    private fun refresh() {
        refreshing = true
        viewModel.reset()
    }

    private fun setRequestListeners() {
        viewModel.usersListener = object : RequestListener<AllUsersQuery.Data> {
            override fun onRequest() {
                viewModel.usersLoading.value = true
            }

            override fun onSuccess(result: AllUsersQuery.Data?) {
                viewModel.usersLoading.value = false

                viewModel.usersLiveData.value = result

                statistics_users_amount.text = result?.allUsers()?.totalCount().toString()

                if (!viewModel.usersLoading.value!! && !viewModel.warningsLoading.value!!) {
                    progress.visibility = View.GONE
                    statistics_container.visibility = View.VISIBLE
                }

                if (refreshing) {
                    refreshLayout.isRefreshing = false
                    refreshing = false
                }
            }

            override fun onError(e: List<ExceptionWithCode>) {
                viewModel.usersLoading.value = false

                if (!viewModel.usersLoading.value!! && !viewModel.warningsLoading.value!!) {
                    progress.visibility = View.GONE
                    statistics_container.visibility = View.VISIBLE
                }

                if (refreshing) {
                    refreshLayout.isRefreshing = false
                    refreshing = false
                }
            }
        }

        viewModel.warningsListener = object : RequestListener<WarningsQuery.Data> {
            override fun onRequest() {
                viewModel.warningsLoading.value = true
            }

            override fun onSuccess(result: WarningsQuery.Data?) {
                viewModel.warningsLoading.value = false

                viewModel.warningsLiveData.value = result

                statistics_warnings_amount.text = result?.warnings()?.totalCount().toString()

                if (!viewModel.usersLoading.value!! && !viewModel.warningsLoading.value!!) {
                    progress.visibility = View.GONE
                    statistics_container.visibility = View.VISIBLE
                }

                if (refreshing) {
                    refreshLayout.isRefreshing = false
                    refreshing = false
                }

                buildChart()
            }

            override fun onError(e: List<ExceptionWithCode>) {
                viewModel.warningsLoading.value = false

                if (!viewModel.usersLoading.value!! && !viewModel.warningsLoading.value!!) {
                    progress.visibility = View.GONE
                    statistics_container.visibility = View.VISIBLE
                }

                if (refreshing) {
                    refreshLayout.isRefreshing = false
                    refreshing = false
                }
            }
        }
    }

    private fun buildChart() {
        if (viewModel.warningsLiveData.value == null) {
            return
        }

        val chartMap = generateChartMap()
        val entries = chartMap["entries"]
        val frequencies = chartMap["frequencies"] as? LinkedHashMap<*, *>

        val dataSets = arrayListOf<ILineDataSet>()
        val xAxisValues = arrayListOf<String>()
        if (frequencies != null) {
            for ((date, _) in frequencies) {
                xAxisValues.add(date.toString())
            }
        }

        entries.tryCast<List<Entry>> {
            val frequencySet = LineDataSet(this.asReversed(), getString(R.string.date))
            frequencySet.color = ContextCompat.getColor(requireContext(), R.color.colorAccent)
            frequencySet.valueTextColor = ContextCompat.getColor(requireContext(), R.color.colorAccent)
            frequencySet.mode = LineDataSet.Mode.CUBIC_BEZIER
            frequencySet.lineWidth = 2f
            frequencySet.valueTextSize = 10f
            frequencySet.valueTextColor =
                ContextCompat.getColor(requireContext(), R.color.colorAccent)
            frequencySet.circleRadius = 3f
            frequencySet.circleHoleColor =
                ContextCompat.getColor(requireContext(), R.color.colorAccent)
            frequencySet.setCircleColor(ContextCompat.getColor(requireContext(), R.color.colorAccent))

            dataSets.add(frequencySet)

            warningsChart.setTouchEnabled(true)
            warningsChart.isDragEnabled = true
            warningsChart.setDrawGridBackground(false)
            warningsChart.setPinchZoom(true)
            warningsChart.setScaleEnabled(true)
            warningsChart.extraRightOffset = 16f
            warningsChart.extraLeftOffset = 16f
            warningsChart.extraTopOffset = 16f
            warningsChart.extraBottomOffset = 16f
            warningsChart.setDrawGridBackground(false)

            warningsChart.xAxis.setDrawGridLines(false)
            warningsChart.xAxis.granularity = 1f
            warningsChart.xAxis.position = XAxis.XAxisPosition.BOTTOM
            warningsChart.xAxis.valueFormatter = IndexAxisValueFormatter(xAxisValues.asReversed())

            val data = LineData(dataSets)
            warningsChart.data = data
            warningsChart.animateX(250)
            warningsChart.animateY(350)
            warningsChart.legend.isEnabled = false
            warningsChart.description.isEnabled = false
            warningsChart.invalidate()
        }
    }

    private fun generateChartMap(): HashMap<String, Any> {
        val frequencies: LinkedHashMap<String, Int> = linkedMapOf()
        val warnings = viewModel.warningsLiveData.value?.warnings()?.edges()?.asIterable()!!

        val locale = getCurrentLocale()

        for (warning in warnings) {
            val warningNode = warning.node()!!
            val dateTime = if (locale.language == "en") {
                LocalDateTime(warningNode.dateIssued()).toString("MM/dd/YY", locale)
            } else {
                LocalDateTime(warningNode.dateIssued()).toString("dd.MM.YY", locale)
            }

            if (!frequencies.containsKey(dateTime)) {
                frequencies[dateTime] = 1
            } else {
                frequencies[dateTime] = frequencies[dateTime]!!.plus(1)
            }
        }

        val entries = arrayListOf<Entry>()
        var i = frequencies.size
        for ((_, frequency) in frequencies) {
            i--
            entries.add(Entry(i.toFloat(), frequency.toFloat()))
        }

        return hashMapOf(
            "entries" to entries,
            "frequencies" to frequencies
        )
    }

    private fun getCurrentLocale(): Locale =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N){
            requireContext().resources.configuration.locales[0];
        } else{
            requireContext().resources.configuration.locale;
        }
}
