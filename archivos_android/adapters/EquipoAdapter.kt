package abad.pilar.san_agustin_analytics.adapters

import abad.pilar.san_agustin_analytics.R
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView

class EquipoAdapter(
    context: Context,
    private val equipos: List<String>
) : ArrayAdapter<String>(context, R.layout.item_equipo, equipos) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context)
            .inflate(R.layout.item_equipo, parent, false)

        val txtEquipo = view.findViewById<TextView>(R.id.itemEquipo)
        txtEquipo.text = equipos[position]

        return view
    }

    override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
        return getView(position, convertView, parent)
    }
}
