package abad.pilar.san_agustin_analytics.adapters

import abad.pilar.san_agustin_analytics.databinding.ItemPartidoBinding
import abad.pilar.san_agustin_analytics.modelos.Partido
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import kotlinx.serialization.InternalSerializationApi

class PartidoAdapter @OptIn(InternalSerializationApi::class) constructor(
    var datos: ArrayList<Partido>,
    val listener: PartidoListener
) : RecyclerView.Adapter<PartidoViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PartidoViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = ItemPartidoBinding.inflate(inflater, parent, false)
        return PartidoViewHolder(binding, listener)
    }

    @OptIn(InternalSerializationApi::class)
    override fun onBindViewHolder(holder: PartidoViewHolder, position: Int) {
        holder.bind(datos[position])
    }

    @OptIn(InternalSerializationApi::class)
    override fun getItemCount(): Int = datos.size

}
