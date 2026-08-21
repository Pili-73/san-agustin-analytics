package abad.pilar.san_agustin_analytics.adapters

import abad.pilar.san_agustin_analytics.modelos.Partido
import kotlinx.serialization.InternalSerializationApi

interface PartidoListener {
    @OptIn(InternalSerializationApi::class)
    fun onPartidoClick(partido: Partido, posicion: Int)
}