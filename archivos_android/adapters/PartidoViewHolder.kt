package abad.pilar.san_agustin_analytics.adapters

import abad.pilar.san_agustin_analytics.databinding.ItemPartidoBinding
import abad.pilar.san_agustin_analytics.modelos.Partido
import androidx.recyclerview.widget.RecyclerView
import kotlinx.serialization.InternalSerializationApi

@OptIn(InternalSerializationApi::class)
class PartidoViewHolder(
    val binding: ItemPartidoBinding,
    val listener: PartidoListener
) : RecyclerView.ViewHolder(binding.root) {

    @OptIn(InternalSerializationApi::class)
    lateinit var partido: Partido

    init {
        binding.root.setOnClickListener {
            listener.onPartidoClick(partido, bindingAdapterPosition)
        }
    }

    fun bind(p: Partido) {
        partido = p
        with(binding) {
            txtPartido.text = "${p.equipo} vs ${p.rival}"
            txtCampo.text = "${p.campo}"
            txtFecha.text = "${p.fecha}"
            txtHora.text = "${p.hora}"
        }
    }
}
