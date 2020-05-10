package me.vidrox.safegistics.adapters.recyclerview

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import coil.api.load
import kotlinx.android.synthetic.main.warnings_card.view.*
import me.vidrox.safegistics.R
import me.vidrox.safegistics.listeners.recyclerview.Constants
import me.vidrox.safegistics.listeners.recyclerview.RecyclerViewItemClickListener
import me.vidrox.safegistics.warnings.WarningsQuery
import org.joda.time.LocalDateTime
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

class WarningsRecyclerViewAdapter(
    var warnings: ArrayList<WarningsQuery.Node?>,
    var additionalData: HashMap<WarningsQuery.Node, HashMap<String, Any>>,
    var locale: Locale
) : RecyclerView.Adapter<WarningsRecyclerViewAdapter.WarningsViewHolder>() {

    var itemClickListener: RecyclerViewItemClickListener<WarningsQuery.Node>? = null

    fun updateData(
        newWarnings: List<WarningsQuery.Node>,
        newAdditionalData: HashMap<WarningsQuery.Node, HashMap<String, Any>>,
        clearItems: Boolean
    ) {
        if (clearItems) {
            warnings.clear()
            additionalData.clear()
        }

        warnings.addAll(newWarnings)
        additionalData = newAdditionalData
        notifyDataSetChanged()
    }

    fun clearData() {
        warnings.clear()
        additionalData.clear()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): WarningsViewHolder {
        val view =
            LayoutInflater.from(parent.context).inflate(R.layout.warnings_card, parent, false)

        return WarningsViewHolder(view)
    }

    override fun getItemCount(): Int = warnings.size

    override fun onBindViewHolder(holder: WarningsViewHolder, position: Int) {
        val warningsMap = additionalData[warnings[position]]
        var icon = R.drawable.ic_warning
        var type = ""
        if (warningsMap != null) {
            icon = warningsMap["icon"] as? Int ?: R.drawable.ic_warning
            type = warningsMap["type"] as? String ?: ""
        }
        holder.bind(warnings[position]!!, icon, type, itemClickListener, locale)
    }

    override fun getItemViewType(position: Int): Int {
        return if (warnings[position] == null) {
            Constants.VIEW_TYPE_LOADING
        } else {
            Constants.VIEW_TYPE_ITEM
        }
    }

    class WarningsViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val warningsDate = view.warnings_date
        private val warningsFullName = view.warnings_full_name
        private val warningsType = view.warnings_type
        private val warningsSeverity = view.warnings_status

        fun bind(
            warning: WarningsQuery.Node,
            icon: Int,
            type: String,
            itemClickListener: RecyclerViewItemClickListener<WarningsQuery.Node>?,
            locale: Locale
        ) {
            val driver = warning.device()?.driver()

            val date = if (locale.language == "en") {
                LocalDateTime(warning.dateIssued()).toString("MM/dd/YYYY HH:mm", locale)
            } else {
                LocalDateTime(warning.dateIssued()).toString("dd.MM.YYYY HH:mm", locale)
            }

            warningsDate.text = date
            if (!driver?.firstName().isNullOrEmpty() &&
                !driver?.lastName().isNullOrEmpty() &&
                !driver?.patronymic().isNullOrEmpty()) {

                warningsFullName.text =
                    "${driver?.firstName()} ${driver?.lastName()} ${driver?.patronymic()}"
            } else {
                warningsFullName.text = "-"
            }
            warningsType.text = type
            warningsSeverity.load(icon)

            itemView.setOnClickListener { itemClickListener?.onClick(warning) }
            itemView.setOnLongClickListener {
                itemClickListener?.onLongClick(it, warning)
                true
            }
        }
    }
}