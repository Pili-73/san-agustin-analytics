package abad.pilar.san_agustin_analytics.modelos

import abad.pilar.san_agustin_analytics.HojaActivity

data class Estadisticas(
    val acciones: Int,
    val pctAcciones: Int,
    val lanzamientos: Int,
    val pctLanzamientos: Int,
    val goles: Int,
    val pctGoles: Int,
    val paradas: Int,
    val pctParadas: Int,
    val fueras: Int,
    val pctFueras: Int,
    val perdidas: Int,
    val pctPerdidas: Int,
    val infracciones: Int,
    val pctInfracciones: Int,
    val robos: Int,
    val pctRobos: Int,
    val malPases: Int,
    val pctMalPases: Int,
    val continuidades: Int,
    val pctContinuidades: Int,
)
