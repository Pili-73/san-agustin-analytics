package abad.pilar.san_agustin_analytics.modelos

import kotlinx.serialization.Serializable

@kotlinx.serialization.InternalSerializationApi
@Serializable
data class Partido(
    val id: Int? = null,
    val equipo: String,
    val rival: String,
    val campo: String,
    val fecha: String,
    val hora: String
)

