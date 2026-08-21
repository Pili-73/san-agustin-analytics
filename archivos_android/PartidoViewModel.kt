package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.modelos.Accion
import android.os.SystemClock
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class PartidoViewModel : ViewModel() {

    // Marcador
    data class Marcador(
        val golesAgustinos: Int,
        val golesRival: Int
    )
    val marcador = MutableLiveData<Marcador>(
        Marcador(0, 0)
    )

    // Cronómetro
    var startTime: Long = 0L
    var elapsedTime: Long = 0L
    var running: Boolean = false

    // Variables toggles
    var modoActual: EstadisticasActivity.Modo = EstadisticasActivity.Modo.NADA
    var tipoAtaque: EstadisticasActivity.TipoAtaque = EstadisticasActivity.TipoAtaque.NADA
    var tipoDefensa: EstadisticasActivity.TipoDefensa = EstadisticasActivity.TipoDefensa.NADA
    var atTipoContra: EstadisticasActivity.AtTipoContra = EstadisticasActivity.AtTipoContra.NADA
    var defTipoContra: EstadisticasActivity.DefTipoContra = EstadisticasActivity.DefTipoContra.NADA
    var atFormacion: EstadisticasActivity.AtFormacion = EstadisticasActivity.AtFormacion.NADA
    var defFormacion: EstadisticasActivity.DefFormacion = EstadisticasActivity.DefFormacion.NADA
    var atSituacionOfensiva: EstadisticasActivity.AtSituacionOfensiva? = EstadisticasActivity.AtSituacionOfensiva.NADA
    var defSituacionOfensiva: EstadisticasActivity.DefSituacionOfensiva? = EstadisticasActivity.DefSituacionOfensiva.NADA
    var atSitOf2: EstadisticasActivity.AtSitOf2 = EstadisticasActivity.AtSitOf2.NADA
    var defSitOf2: EstadisticasActivity.DefSitOf2 = EstadisticasActivity.DefSitOf2.NADA
    var finalizacion: EstadisticasActivity.Finalizacion? = EstadisticasActivity.Finalizacion.NADA
    var zonaLanzamiento: EstadisticasActivity.ZonaLanzamiento? = EstadisticasActivity.ZonaLanzamiento.NADA
    var resultadoLanzamiento: EstadisticasActivity.ResultadoLanzamiento? = EstadisticasActivity.ResultadoLanzamiento.NADA
    var causaPerdida: EstadisticasActivity.CausaPerdida? = EstadisticasActivity.CausaPerdida.NADA

    fun resetAccion() {
        modoActual = EstadisticasActivity.Modo.NADA
        tipoAtaque = EstadisticasActivity.TipoAtaque.NADA
        atTipoContra = EstadisticasActivity.AtTipoContra.NADA
        defTipoContra = EstadisticasActivity.DefTipoContra.NADA
        atFormacion = EstadisticasActivity.AtFormacion.NADA
        defFormacion = EstadisticasActivity.DefFormacion.NADA
        atSituacionOfensiva = EstadisticasActivity.AtSituacionOfensiva.NADA
        defSituacionOfensiva = EstadisticasActivity.DefSituacionOfensiva.NADA
        atSitOf2 = EstadisticasActivity.AtSitOf2.NADA
        defSitOf2 = EstadisticasActivity.DefSitOf2.NADA
        finalizacion = EstadisticasActivity.Finalizacion.NADA
        zonaLanzamiento = EstadisticasActivity.ZonaLanzamiento.NADA
        resultadoLanzamiento = EstadisticasActivity.ResultadoLanzamiento.NADA
        causaPerdida = EstadisticasActivity.CausaPerdida.NADA
    }

    fun actualizarMarcador(accion: Accion) {
        val actual = marcador.value ?: Marcador(0, 0)

        val nuevo = if (accion.ataqueDefensa == "ATAQUE") {
            actual.copy(golesAgustinos = actual.golesAgustinos + 1)
        } else if (accion.ataqueDefensa == "DEFENSA") {
            actual.copy(golesRival = actual.golesRival + 1)
        } else {
            actual.copy(golesAgustinos = actual.golesAgustinos)
            actual.copy(golesRival = actual.golesRival)
        }

        marcador.postValue(nuevo)
    }

    fun setTiempoManual(minutos: Int, segundos: Int) {
        elapsedTime = ((minutos * 60) + segundos) * 1000L
        startTime = SystemClock.elapsedRealtime() - elapsedTime
    }

}

