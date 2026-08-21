package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.HojaActivity
import abad.pilar.san_agustin_analytics.data.AccionRepository
import abad.pilar.san_agustin_analytics.modelos.Accion
import abad.pilar.san_agustin_analytics.modelos.Estadisticas
import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import kotlin.Int

// Guarda filtro, carga stats y recalcula stats
class HojaViewModel : ViewModel() {

    val repository = AccionRepository()
    val filtroAtaque = MutableLiveData<HojaActivity.TipoFiltro?>(null)
    val filtroDefensa = MutableLiveData<HojaActivity.TipoFiltro?>(null)
    val estadisticasAtaque = MutableLiveData<Estadisticas>()
    val estadisticasDefensa = MutableLiveData<Estadisticas>()
    private var totalGeneralAcciones: Int = 0
    // Cambiar filtro cuando pulso un checkbox
    fun setFiltro(filtro: HojaActivity.TipoFiltro?, contexto: HojaActivity.ContextoHoja) {
        when (contexto) {
            HojaActivity.ContextoHoja.ATAQUE -> filtroAtaque.value = filtro
            HojaActivity.ContextoHoja.DEFENSA -> filtroDefensa.value = filtro
            HojaActivity.ContextoHoja.NADA -> null
        }
    }

    // Carga stats, siempre las carga desde aquí
    fun cargarEstadisticas(
        partidoId: Int,
        contexto: HojaActivity.ContextoHoja,
        ataqueDefensa: String? = null,
        tipoAtaque: String? = null,
        tipoContra: String? = null,
        formacion: String? = null,
        sitOfensiva1: String? = null,
        sitOfensiva2: String? = null,
        zonaLanzamiento: String? = null
    ) {
        viewModelScope.launch {
            Log.d("HojaViewModel", "Cargando estadísticas con filtros")
            val acciones = repository.getAccionesByPartido(
                partidoId = partidoId,
                ataqueDefensa = ataqueDefensa,
                tipoAtaque = tipoAtaque,
                tipoContra = tipoContra,
                formacion = formacion,
                sitOfensiva1 = sitOfensiva1,
                sitOfensiva2 = sitOfensiva2,
                zonaLanzamiento = zonaLanzamiento
            )
            val filtro = when (contexto) {
                HojaActivity.ContextoHoja.ATAQUE -> filtroAtaque.value
                HojaActivity.ContextoHoja.DEFENSA -> filtroDefensa.value
                HojaActivity.ContextoHoja.NADA -> null
            }

            Log.d("HojaViewModel", "Acciones filtradas: ${acciones.size}")
            when (contexto) {
                HojaActivity.ContextoHoja.ATAQUE -> estadisticasAtaque.postValue(calcularEstadisticas(acciones, filtro))
                HojaActivity.ContextoHoja.DEFENSA -> estadisticasDefensa.postValue(calcularEstadisticas(acciones, filtro))
                HojaActivity.ContextoHoja.NADA -> null
            }

        }
    }

    private fun calcularEstadisticas(listaAcciones: List<Accion>, filtro: HojaActivity.TipoFiltro?): Estadisticas {
        val lanzamientos = listaAcciones.count { it.lanzPerdCont == "LANZAMIENTO" }
        val goles = listaAcciones.count { it.golParadaFuera == "GOL" }
        val paradas = listaAcciones.count { it.golParadaFuera == "PARADA" }
        val fueras = listaAcciones.count { it.golParadaFuera == "FUERA" }
        val perdidas = listaAcciones.count { it.lanzPerdCont == "PERDIDA" }
        val infracciones = listaAcciones.count { it.causaPerdida == "INFRACCION" }
        val robos = listaAcciones.count { it.causaPerdida == "ROBO" }
        val malPases = listaAcciones.count { it.causaPerdida == "MAL_PASE" }
        val continuidades = listaAcciones.count { it.lanzPerdCont == "CONTINUIDAD" }

        totalGeneralAcciones = listaAcciones.size

        // numerador para los porcentajes
        val numAcciones = when (filtro) {
            HojaActivity.TipoFiltro.POSICIONAL -> listaAcciones.count { it.posContra == "POSICIONAL" }
            HojaActivity.TipoFiltro.CONTRAATAQUE -> listaAcciones.count { it.posContra == "CONTRAATAQUE" }
            HojaActivity.TipoFiltro.CONTRAGOL -> listaAcciones.count { it.posContra == "CONTRAGOL" }

            HojaActivity.TipoFiltro.OLEADA_1 -> listaAcciones.count { it.tipoContra == "OLEADA_1" }
            HojaActivity.TipoFiltro.OLEADA_2 -> listaAcciones.count { it.tipoContra == "OLEADA_2" }
            HojaActivity.TipoFiltro.OLEADA_3 -> listaAcciones.count { it.tipoContra == "OLEADA_3" }

            HojaActivity.TipoFiltro.FORMACION_60 -> listaAcciones.count { it.formacion == "SEISCERO" }
            HojaActivity.TipoFiltro.FORMACION_51 -> listaAcciones.count { it.formacion == "CINCOUNO" }
            HojaActivity.TipoFiltro.FORMACION_33 -> listaAcciones.count { it.formacion == "TRESTRES" }
            HojaActivity.TipoFiltro.UNO_VS_UNO -> listaAcciones.count { it.sitOfensiva1 == "UNO_VS_UNO" }
            HojaActivity.TipoFiltro.DOS_VS_DOS -> listaAcciones.count { it.sitOfensiva1 == "DOS_VS_DOS" }

            HojaActivity.TipoFiltro.EXTERIOR -> listaAcciones.count { it.sitOfensiva2 == "EXTERIOR" }
            HojaActivity.TipoFiltro.CENTRO -> listaAcciones.count { it.sitOfensiva2 == "CENTRO" }
            HojaActivity.TipoFiltro.FUERTE -> listaAcciones.count { it.sitOfensiva2 == "FUERTE" }
            HojaActivity.TipoFiltro.DEBIL -> listaAcciones.count { it.sitOfensiva2 == "DEBIL" }

            HojaActivity.TipoFiltro.ZONA_6M -> listaAcciones.count { it.zonaLanz == "SEIS" }
            HojaActivity.TipoFiltro.ZONA_7M -> listaAcciones.count { it.zonaLanz == "SIETE" }
            HojaActivity.TipoFiltro.ZONA_9M -> listaAcciones.count { it.zonaLanz == "NUEVE" }
            HojaActivity.TipoFiltro.EXTREMO -> listaAcciones.count { it.zonaLanz == "EXTREMO" }
            HojaActivity.TipoFiltro.PIVOTE -> listaAcciones.count { it.zonaLanz == "PIVOTE" }

            null -> totalGeneralAcciones
        }
        // denominador de porcentaje para cada estadistica
        val baseAcciones = when (filtro) {
            // porcentaje respecto a TODAS las acciones
            HojaActivity.TipoFiltro.POSICIONAL,
            HojaActivity.TipoFiltro.CONTRAATAQUE,
            HojaActivity.TipoFiltro.CONTRAGOL -> totalGeneralAcciones

            // porcentaje respecto al contraataque
            HojaActivity.TipoFiltro.OLEADA_1,
            HojaActivity.TipoFiltro.OLEADA_2,
            HojaActivity.TipoFiltro.OLEADA_3 ->
                listaAcciones.count { it.posContra == "CONTRAATAQUE" }

            // porcentaje respecto al posicional
            HojaActivity.TipoFiltro.FORMACION_60,
            HojaActivity.TipoFiltro.FORMACION_51,
            HojaActivity.TipoFiltro.FORMACION_33,
            HojaActivity.TipoFiltro.UNO_VS_UNO,
            HojaActivity.TipoFiltro.DOS_VS_DOS,->
                listaAcciones.count { it.posContra == "POSICIONAL" }

            // porcentaje respecto al 2v2
            HojaActivity.TipoFiltro.EXTERIOR,
            HojaActivity.TipoFiltro.CENTRO ->
                listaAcciones.count { it.sitOfensiva1 == "DOS_VS_DOS" }

            // porcentaje respecto al 1v1
            HojaActivity.TipoFiltro.FUERTE,
            HojaActivity.TipoFiltro.DEBIL ->
                listaAcciones.count { it.sitOfensiva1 == "UNO_VS_UNO" }

            // porcentaje respecto al lanzamiento
            HojaActivity.TipoFiltro.ZONA_6M,
            HojaActivity.TipoFiltro.ZONA_7M,
            HojaActivity.TipoFiltro.ZONA_9M,
            HojaActivity.TipoFiltro.EXTREMO,
            HojaActivity.TipoFiltro.PIVOTE -> {
                listaAcciones.count { it.lanzPerdCont == "LANZAMIENTO" }
            }
            null -> totalGeneralAcciones
        }

        return Estadisticas(
            acciones = numAcciones,
            pctAcciones = porcentaje(numAcciones, baseAcciones),
            lanzamientos = lanzamientos,
            pctLanzamientos = porcentaje(lanzamientos, baseAcciones),
            goles = goles,
            pctGoles = porcentaje(goles, lanzamientos),
            paradas = listaAcciones.count { it.golParadaFuera == "PARADA" },
            pctParadas = porcentaje(paradas, lanzamientos),
            fueras = listaAcciones.count { it.golParadaFuera == "FUERA" },
            pctFueras = porcentaje(fueras, lanzamientos),
            perdidas = perdidas,
            pctPerdidas = porcentaje(perdidas, baseAcciones),
            infracciones = listaAcciones.count { it.causaPerdida == "INFRACCION" },
            pctInfracciones = porcentaje(infracciones, perdidas),
            robos = listaAcciones.count { it.causaPerdida == "ROBO" },
            pctRobos = porcentaje(robos, perdidas),
            malPases = listaAcciones.count { it.causaPerdida == "MAL_PASE" },
            pctMalPases = porcentaje(malPases, perdidas),
            continuidades = continuidades,
            pctContinuidades = porcentaje(continuidades, baseAcciones)
        )
    }

    private fun porcentaje(parte: Int, total: Int): Int {
        if (total == 0) return 0
        return (parte * 100) / total
    }
}
