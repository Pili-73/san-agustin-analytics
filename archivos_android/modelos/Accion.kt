package abad.pilar.san_agustin_analytics.modelos

import android.annotation.SuppressLint
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable

@SuppressLint("UnsafeOptInUsageError")
@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Accion(
    val idAccion: Int? = null,
    val idPartido: Int,
    val ataqueDefensa: String,        // ATAQUE / DEFENSA
    val posContra: String?,           // POSICIONAL / CONTRAATAQUE / REPLIEGUE
    val tipoContra: String?,
    val formacion: String?,             // 6:0 / 5:1 / 3:3
    val sitOfensiva1: String?,        // 2v2 / 1v1
    val sitOfensiva2: String?,        // Exterior/Centro/Fuerte/Debil
    val lanzPerdCont: String?,      // LANZAMIENTO / PERDIDA / CONTINUIDAD
    val zonaLanz: String?,           // Z1, Z2...
    val golParadaFuera: String?,    // GOL / PARADA / FUERA
    val causaPerdida: String?        // infraccion, robo, mal pase...
)