package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.databinding.ActivityHojaBinding
import abad.pilar.san_agustin_analytics.databinding.BloqueEstadisticaBinding
import abad.pilar.san_agustin_analytics.databinding.BloqueFiltrosBinding
import abad.pilar.san_agustin_analytics.modelos.Estadisticas
import android.os.Bundle
import android.widget.CheckBox
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity


class HojaActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_ID = "extra_id"
        const val EXTRA_EQUIPO = "extra_equipo"
        const val EXTRA_RIVAL = "extra_rival"
    }
    enum class ContextoHoja { ATAQUE, DEFENSA, NADA }
    enum class TipoFiltro { POSICIONAL, CONTRAATAQUE, CONTRAGOL, OLEADA_1, OLEADA_2, OLEADA_3,
        DOS_VS_DOS, UNO_VS_UNO, FORMACION_60, FORMACION_51, FORMACION_33, EXTERIOR, CENTRO, FUERTE, DEBIL,
        ZONA_6M, ZONA_7M, ZONA_9M, EXTREMO, PIVOTE }

    private lateinit var binding: ActivityHojaBinding
    private lateinit var atFiltrosBinding: BloqueFiltrosBinding
    private lateinit var defFiltrosBinding: BloqueFiltrosBinding
    private lateinit var atEstadisticasBinding: BloqueEstadisticaBinding
    private lateinit var defEstadisticasBinding: BloqueEstadisticaBinding
    private val viewModel: HojaViewModel by viewModels()
    private var partidoId: Int = -1
    private var checkboxAtaque: CheckBox? = null
    private var checkboxDefensa: CheckBox? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHojaBinding.inflate(layoutInflater)
        setContentView(binding.root)
        // bindings de los sublayouts
        atFiltrosBinding = binding.filtrosAtaque!!
        defFiltrosBinding = binding.filtrosDefensa!!
        atEstadisticasBinding = BloqueEstadisticaBinding.inflate(layoutInflater)
        defEstadisticasBinding = BloqueEstadisticaBinding.inflate(layoutInflater)

        // Obtener el ID, equipo y rival del partido desde el Intent
        partidoId = intent.getIntExtra(EXTRA_ID, -1)
        val equipo = intent.getStringExtra(EXTRA_EQUIPO)
        val rival = intent.getStringExtra(EXTRA_RIVAL)

        if (partidoId == -1) {
            finish()
            return
        }
        binding.txtPartidoHoja?.text = "${equipo} vs ${rival}"

        // Configurar observadores
        setupObservers()

        // Configurar listeners de los checkboxes
        setupFiltros(ContextoHoja.ATAQUE, atFiltrosBinding)
        setupFiltros(ContextoHoja.DEFENSA, defFiltrosBinding)

        // Cargar estadísticas iniciales (sin filtros)
        viewModel.cargarEstadisticas(partidoId, ContextoHoja.ATAQUE)
        viewModel.cargarEstadisticas(partidoId, ContextoHoja.DEFENSA)

        // Volver a estadísticas
        binding.flechaVolver2?.setOnClickListener {
            finish()
        }
    }

    private fun setupObservers() {
        // Observar cambios en las estadísticas
        viewModel.estadisticasAtaque.observe(this) {
            atActualizarUI(it)
        }

        viewModel.estadisticasDefensa.observe(this) {
            defActualizarUI(it)
        }

        // Observar cambios en los filtros
        viewModel.filtroAtaque.observe(this) { filtro ->
            // Recargar estadísticas con el nuevo filtro
            cargarConFiltro(ContextoHoja.ATAQUE, filtro)
        }
        viewModel.filtroDefensa.observe(this) { filtro ->
            // Recargar estadísticas con el nuevo filtro
            cargarConFiltro(ContextoHoja.DEFENSA, filtro)
        }
    }

    private fun atActualizarUI(stats: Estadisticas) {
        // Actualizar TextViews con las estadísticas
        binding.statsAtaque?.filaAcciones?.tvTitulo?.text = "Acciones"
        binding.statsAtaque?.filaAcciones?.tvNumero?.text = stats.acciones.toString()
        binding.statsAtaque?.filaAcciones?.tvPorcentaje?.text = ("${stats.pctAcciones}%")

        binding.statsAtaque?.filaLanzamientos?.tvTitulo?.text = "Lanzamientos"
        binding.statsAtaque?.filaLanzamientos?.tvNumero?.text = stats.lanzamientos.toString()
        binding.statsAtaque?.filaLanzamientos?.tvPorcentaje?.text = ("${stats.pctLanzamientos}%")

        binding.statsAtaque?.filaGoles?.tvTitulo?.text = "Goles"
        binding.statsAtaque?.filaGoles?.tvNumero?.text = stats.goles.toString()
        binding.statsAtaque?.filaGoles?.tvPorcentaje?.text = ("${stats.pctGoles}%")

        binding.statsAtaque?.filaParadas?.tvTitulo?.text = "Paradas"
        binding.statsAtaque?.filaParadas?.tvNumero?.text = stats.paradas.toString()
        binding.statsAtaque?.filaParadas?.tvPorcentaje?.text = ("${stats.pctParadas}%")

        binding.statsAtaque?.filaFueras?.tvTitulo?.text = "Fueras"
        binding.statsAtaque?.filaFueras?.tvNumero?.text = stats.fueras.toString()
        binding.statsAtaque?.filaFueras?.tvPorcentaje?.text = ("${stats.pctFueras}%")

        binding.statsAtaque?.filaPerdidas?.tvTitulo?.text = "Perdidas"
        binding.statsAtaque?.filaPerdidas?.tvNumero?.text = stats.perdidas.toString()
        binding.statsAtaque?.filaPerdidas?.tvPorcentaje?.text = ("${stats.pctPerdidas}%")

        binding.statsAtaque?.filaInfracciones?.tvTitulo?.text = "Infracciones"
        binding.statsAtaque?.filaInfracciones?.tvNumero?.text = stats.infracciones.toString()
        binding.statsAtaque?.filaInfracciones?.tvPorcentaje?.text = ("${stats.pctInfracciones}%")

        binding.statsAtaque?.filaRobos?.tvTitulo?.text = "Robos"
        binding.statsAtaque?.filaRobos?.tvNumero?.text = stats.robos.toString()
        binding.statsAtaque?.filaRobos?.tvPorcentaje?.text = ("${stats.pctRobos}%")

        binding.statsAtaque?.filaBandas?.tvTitulo?.text = "Bandas"
        binding.statsAtaque?.filaBandas?.tvNumero?.text = stats.malPases.toString()
        binding.statsAtaque?.filaBandas?.tvPorcentaje?.text = ("${stats.pctMalPases}%")

        binding.statsAtaque?.filaContinuidades?.tvTitulo?.text = "Continuidades"
        binding.statsAtaque?.filaContinuidades?.tvNumero?.text = stats.continuidades.toString()
        binding.statsAtaque?.filaContinuidades?.tvPorcentaje?.text = ("${stats.pctContinuidades}%")
    }
    private fun defActualizarUI(stats: Estadisticas) {
        // Actualizar TextViews con las estadísticas
        binding.statsDefensa?.filaAcciones?.tvTitulo?.text = "Acciones"
        binding.statsDefensa?.filaAcciones?.tvNumero?.text = stats.acciones.toString()
        binding.statsDefensa?.filaAcciones?.tvPorcentaje?.text = ("${stats.pctAcciones}%")

        binding.statsDefensa?.filaLanzamientos?.tvTitulo?.text = "Lanzamientos"
        binding.statsDefensa?.filaLanzamientos?.tvNumero?.text = stats.lanzamientos.toString()
        binding.statsDefensa?.filaLanzamientos?.tvPorcentaje?.text = ("${stats.pctLanzamientos}%")

        binding.statsDefensa?.filaGoles?.tvTitulo?.text = "Goles"
        binding.statsDefensa?.filaGoles?.tvNumero?.text = stats.goles.toString()
        binding.statsDefensa?.filaGoles?.tvPorcentaje?.text = ("${stats.pctGoles}%")

        binding.statsDefensa?.filaParadas?.tvTitulo?.text = "Paradas"
        binding.statsDefensa?.filaParadas?.tvNumero?.text = stats.paradas.toString()
        binding.statsDefensa?.filaParadas?.tvPorcentaje?.text = ("${stats.pctParadas}%")

        binding.statsDefensa?.filaFueras?.tvTitulo?.text = "Fueras"
        binding.statsDefensa?.filaFueras?.tvNumero?.text = stats.fueras.toString()
        binding.statsDefensa?.filaFueras?.tvPorcentaje?.text = ("${stats.pctFueras}%")

        binding.statsDefensa?.filaPerdidas?.tvTitulo?.text = "Perdidas"
        binding.statsDefensa?.filaPerdidas?.tvNumero?.text = stats.perdidas.toString()
        binding.statsDefensa?.filaPerdidas?.tvPorcentaje?.text = ("${stats.pctPerdidas}%")

        binding.statsDefensa?.filaInfracciones?.tvTitulo?.text = "Infracciones"
        binding.statsDefensa?.filaInfracciones?.tvNumero?.text = stats.infracciones.toString()
        binding.statsDefensa?.filaInfracciones?.tvPorcentaje?.text = ("${stats.pctInfracciones}%")

        binding.statsDefensa?.filaRobos?.tvTitulo?.text = "Robos"
        binding.statsDefensa?.filaRobos?.tvNumero?.text = stats.robos.toString()
        binding.statsDefensa?.filaRobos?.tvPorcentaje?.text = ("${stats.pctRobos}%")

        binding.statsDefensa?.filaBandas?.tvTitulo?.text = "Bandas"
        binding.statsDefensa?.filaBandas?.tvNumero?.text = stats.malPases.toString()
        binding.statsDefensa?.filaBandas?.tvPorcentaje?.text = ("${stats.pctMalPases}%")

        binding.statsDefensa?.filaContinuidades?.tvTitulo?.text = "Continuidades"
        binding.statsDefensa?.filaContinuidades?.tvNumero?.text = stats.continuidades.toString()
        binding.statsDefensa?.filaContinuidades?.tvPorcentaje?.text = ("${stats.pctContinuidades}%")
    }

    private fun setupFiltros(contexto: ContextoHoja, filtrosBinding: BloqueFiltrosBinding) {
        val allChecks = mapOf(
            filtrosBinding.chkPosicional to TipoFiltro.POSICIONAL,
            filtrosBinding.chkContraataque to TipoFiltro.CONTRAATAQUE,
            filtrosBinding.chkContragol to TipoFiltro.CONTRAGOL,

            filtrosBinding.chk1ol to TipoFiltro.OLEADA_1,
            filtrosBinding.chk2ol to TipoFiltro.OLEADA_2,
            filtrosBinding.chk3ol to TipoFiltro.OLEADA_3,

            filtrosBinding.chk2v2 to TipoFiltro.DOS_VS_DOS,
            filtrosBinding.chk1v1 to TipoFiltro.UNO_VS_UNO,

            filtrosBinding.chk60 to TipoFiltro.FORMACION_60,
            filtrosBinding.chk51 to TipoFiltro.FORMACION_51,
            filtrosBinding.chk33 to TipoFiltro.FORMACION_33,

            filtrosBinding.chk2v2Ext to TipoFiltro.EXTERIOR,
            filtrosBinding.chk2v2Centro to TipoFiltro.CENTRO,
            filtrosBinding.chk1v1Fuerte to TipoFiltro.FUERTE,
            filtrosBinding.chk1v1Debil to TipoFiltro.DEBIL,

            filtrosBinding.chk6m to TipoFiltro.ZONA_6M,
            filtrosBinding.chk7m to TipoFiltro.ZONA_7M,
            filtrosBinding.chk9m to TipoFiltro.ZONA_9M,
            filtrosBinding.chkExt to TipoFiltro.EXTREMO,
            filtrosBinding.chkPiv to TipoFiltro.PIVOTE
        )

        when (contexto) {
            ContextoHoja.ATAQUE -> allChecks.forEach { (checkbox, filtro) ->
                checkbox.setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        checkboxAtaque?.isChecked = false
                        checkboxAtaque = checkbox
                        cargarConFiltro(contexto, filtro)
                        viewModel.setFiltro(filtro, contexto)
                    } else if (checkboxAtaque == checkbox) {
                        checkboxAtaque = null
                        viewModel.setFiltro(null, contexto)
                        cargarConFiltro(contexto, null)
                    }
                }
            }
            ContextoHoja.DEFENSA -> allChecks.forEach { (checkbox, filtro) ->
                checkbox.setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        checkboxDefensa?.isChecked = false
                        checkboxDefensa = checkbox
                        cargarConFiltro(contexto, filtro)
                        viewModel.setFiltro(filtro, contexto)
                    } else if (checkboxDefensa == checkbox) {
                        checkboxDefensa = null
                        viewModel.setFiltro(null, contexto)
                        cargarConFiltro(contexto, null)
                    }
                }
            }

            ContextoHoja.NADA -> null
        }
    }


    private fun cargarConFiltro(contexto: ContextoHoja, filtro: TipoFiltro?) {
        val params = mapearFiltro(filtro)
        viewModel.cargarEstadisticas(
            partidoId = partidoId,
            ataqueDefensa = when (contexto) {
                ContextoHoja.ATAQUE -> "ATAQUE"
                ContextoHoja.DEFENSA -> "DEFENSA"
                ContextoHoja.NADA -> null
            },
            tipoAtaque = params.tipoAtaque,
            tipoContra = params.tipoContra,
            formacion = params.formacion,
            sitOfensiva1 = params.sitOfensiva1,
            sitOfensiva2 = params.sitOfensiva2,
            zonaLanzamiento = params.zonaLanz,
            contexto = contexto // ⬅️ importante
        )
    }

    private fun mapearFiltro(filtro: TipoFiltro?): FiltroParams {
        return when (filtro) {
            TipoFiltro.POSICIONAL -> FiltroParams(tipoAtaque = "POSICIONAL")
            TipoFiltro.CONTRAATAQUE -> FiltroParams(tipoAtaque = "CONTRAATAQUE")
            TipoFiltro.CONTRAGOL -> FiltroParams(tipoAtaque = "CONTRAGOL")
            TipoFiltro.OLEADA_1 -> FiltroParams(tipoContra = "OLEADA_1")
            TipoFiltro.OLEADA_2 -> FiltroParams(tipoContra = "OLEADA_2")
            TipoFiltro.OLEADA_3 -> FiltroParams(tipoContra = "OLEADA_3")
            TipoFiltro.DOS_VS_DOS -> FiltroParams(sitOfensiva1 = "DOS_VS_DOS")
            TipoFiltro.UNO_VS_UNO -> FiltroParams(sitOfensiva1 = "UNO_VS_UNO")
            TipoFiltro.FORMACION_60 -> FiltroParams(formacion = "SEISCERO")
            TipoFiltro.FORMACION_51 -> FiltroParams(formacion = "CINCOUNO")
            TipoFiltro.FORMACION_33 -> FiltroParams(formacion = "TRESTRES")
            TipoFiltro.EXTERIOR -> FiltroParams(sitOfensiva2 = "EXTERIOR")
            TipoFiltro.CENTRO -> FiltroParams(sitOfensiva2 = "CENTRO")
            TipoFiltro.FUERTE -> FiltroParams(sitOfensiva2 = "FUERTE")
            TipoFiltro.DEBIL -> FiltroParams(sitOfensiva2 = "DEBIL")
            TipoFiltro.ZONA_6M -> FiltroParams(zonaLanz = "SEIS")
            TipoFiltro.ZONA_7M -> FiltroParams(zonaLanz = "SIETE")
            TipoFiltro.ZONA_9M -> FiltroParams(zonaLanz = "NUEVE")
            TipoFiltro.EXTREMO -> FiltroParams(zonaLanz = "EXTREMO")
            TipoFiltro.PIVOTE -> FiltroParams(zonaLanz = "PIVOTE")
            null -> FiltroParams()
        }
    }

    data class FiltroParams(
        val ataqueDefensa: String? = null,
        val tipoAtaque: String? = null,
        val tipoContra: String? = null,
        val formacion: String? = null,
        val sitOfensiva1: String? = null,
        val sitOfensiva2: String? = null,
        val zonaLanz: String? = null
    )
}

