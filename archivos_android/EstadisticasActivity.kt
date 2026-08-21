package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.databinding.ActivityEstadisticasBinding
import abad.pilar.san_agustin_analytics.modelos.Accion
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.String


class EstadisticasActivity : AppCompatActivity() {
    lateinit var binding: ActivityEstadisticasBinding
    // Rotación de pantalla
    private val viewModel: PartidoViewModel by viewModels()

    // Todas las variables de los toggles
    enum class Modo { NADA, ATAQUE, DEFENSA }
    enum class TipoAtaque { NADA, POSICIONAL, CONTRAATAQUE, CONTRAGOL }
    enum class TipoDefensa { NADA, POSICIONAL, CONTRAATAQUE, CONTRAGOL }
    enum class AtTipoContra { NADA, OLEADA_1, OLEADA_2, OLEADA_3 }
    enum class DefTipoContra { NADA, OLEADA_1, OLEADA_2, OLEADA_3 }
    enum class AtFormacion { NADA, SEISCERO, CINCOUNO, TRESTRES }
    enum class DefFormacion { NADA, SEISCERO, CINCOUNO, TRESTRES }
    enum class AtSituacionOfensiva { NADA, DOS_VS_DOS, UNO_VS_UNO }
    enum class DefSituacionOfensiva { NADA, DOS_VS_DOS, UNO_VS_UNO }
    enum class AtSitOf2 { NADA, CENTRO, EXTERIOR, FUERTE, DEBIL }
    enum class DefSitOf2 { NADA, CENTRO, EXTERIOR, FUERTE, DEBIL }
    enum class Finalizacion { NADA, LANZAMIENTO, PERDIDA, CONTINUIDAD }
    enum class ZonaLanzamiento { NADA, SEIS, SIETE, NUEVE, EXTREMO, PIVOTE }
    enum class ResultadoLanzamiento { NADA, GOL, PARADA, FUERA }
    enum class CausaPerdida { NADA, INFRACCION, ROBO, MAL_PASE }


    // Variables cronómetro
    private val handler = Handler(Looper.getMainLooper())
    private val timerRunnable = object : Runnable {
        override fun run() {
            if (viewModel.running) {
                val now = SystemClock.elapsedRealtime()
                val totalElapsed = viewModel.elapsedTime + (now - viewModel.startTime)
                updateTimer(totalElapsed)
                handler.postDelayed(this, 1000)
            }
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityEstadisticasBinding.inflate(layoutInflater)
        mostrarNinguno()
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Coger el idPartido para las acciones
        val partidoId = intent.getIntExtra(HojaActivity.EXTRA_ID, -1)
        val equipo = intent.getStringExtra(HojaActivity.EXTRA_EQUIPO)
        val rival = intent.getStringExtra(HojaActivity.EXTRA_RIVAL)

        // Si gira la pantalla se reconectará a los datos del ViewModel
        if (viewModel.running) {
            handler.post(timerRunnable)
            val now = SystemClock.elapsedRealtime()
            val totalElapsed = viewModel.elapsedTime + (now - viewModel.startTime)
            updateTimer(totalElapsed)
        } else {
            updateTimer(viewModel.elapsedTime)
        }

        // Sacar modos si giro la pantalla
        when (viewModel.modoActual) {
            Modo.ATAQUE -> mostrarAtaque()
            Modo.DEFENSA -> mostrarDefensa()
            Modo.NADA -> mostrarNinguno()
        }
        when (viewModel.tipoAtaque) {
            TipoAtaque.POSICIONAL -> {
                binding.toggleTipoAtaque?.check(R.id.btnAtPosicional)
                mostrarAtPosicional()
            }
            TipoAtaque.CONTRAATAQUE -> {
                binding.toggleTipoAtaque?.check(R.id.btnAtContraataque)
                mostrarAtContraataque()
            }
            else -> mostrarAtTipoNinguno()
        }
        when (viewModel.tipoDefensa) {
            TipoDefensa.POSICIONAL -> {
                binding.toggleTipoDefensa?.check(R.id.btnDefPosicional)
                mostrarDefPosicional()
            }
            TipoDefensa.CONTRAATAQUE -> {
                binding.toggleTipoDefensa?.check(R.id.btnRepliegue)
                mostrarDefContraataque()
            }
            else -> mostrarAtTipoNinguno()
        }
        when (viewModel.atSituacionOfensiva) {
            AtSituacionOfensiva.DOS_VS_DOS -> activarAt2v2()
            AtSituacionOfensiva.UNO_VS_UNO -> activarAt1v1()
            AtSituacionOfensiva.NADA -> desactivarTodo()
            null -> desactivarTodo()
        }
        when (viewModel.defSituacionOfensiva) {
            DefSituacionOfensiva.DOS_VS_DOS -> activarDef2v2()
            DefSituacionOfensiva.UNO_VS_UNO -> activarDef1v1()
            DefSituacionOfensiva.NADA -> desactivarTodo()
            null -> desactivarTodo()
        }
        when (viewModel.finalizacion) {
            Finalizacion.LANZAMIENTO -> mostrarLanzamiento()
            Finalizacion.PERDIDA -> mostrarPerdida()
            Finalizacion.CONTINUIDAD -> mostrarContinuidad()
            Finalizacion.NADA -> mostrarContinuidad()
            null -> mostrarContinuidad()
        }
        viewModel.marcador.observe(this) { marcador ->
            binding.golesAgustinos?.text = marcador.golesAgustinos.toString()
            binding.golesRival?.text = marcador.golesRival.toString()
        }


        with(binding) {
            // Poner nombre de Agustinos y del rival
            nombreAgustinos?.text = equipo
            nombreRival?.text = rival

            // Finalizar partido
            btnFin.setOnClickListener {
                AlertDialog.Builder(this@EstadisticasActivity)
                    .setTitle("Finalizar partido")
                    .setMessage("¿Estás seguro de acabar el partido?")
                    .setPositiveButton("Sí, finalizar partido") {_,_ ->
                        // Borrar la actividad PartidoForm
                        PartidoFormActivity.instance?.finish()
                        finish()
                    }
                    .setNegativeButton("Cancelar", null)
                    .show()
            }

            btnCambio.setOnClickListener {
                Toast.makeText(this@EstadisticasActivity,
                    "Función no disponible en este momento",  Toast.LENGTH_SHORT).show()
            }
            btnAmon.setOnClickListener {
                Toast.makeText(this@EstadisticasActivity,
                    "Función no disponible en este momento",  Toast.LENGTH_SHORT).show()
            }

            // Editar tiempo
            tvTimer.setOnClickListener {
                pauseTimer()
                mostrarDialogoEditarTiempo()
            }

            // Guardar acción y resetear botones
            btnGuardar.setOnClickListener {
                val accion = Accion(
                    idPartido = partidoId,
                    ataqueDefensa = viewModel.modoActual.name,

                    posContra = when (viewModel.modoActual) {
                        Modo.ATAQUE -> viewModel.tipoAtaque.name
                        Modo.DEFENSA -> viewModel.tipoDefensa.name
                        else -> null
                    },

                    tipoContra = when (viewModel.modoActual) {
                        Modo.ATAQUE -> viewModel.atTipoContra.name
                        Modo.DEFENSA -> viewModel.defTipoContra.name
                        else -> null
                    },

                    formacion = when (viewModel.modoActual) {
                        Modo.ATAQUE -> viewModel.atFormacion.name
                        Modo.DEFENSA -> viewModel.defFormacion.name
                        else -> null
                    },

                    sitOfensiva1 = when (viewModel.modoActual) {
                        Modo.ATAQUE -> viewModel.atSituacionOfensiva?.name
                        Modo.DEFENSA -> viewModel.defSituacionOfensiva?.name
                        else -> null
                    },

                    sitOfensiva2 = when (viewModel.modoActual) {
                        Modo.ATAQUE -> viewModel.atSitOf2.name
                        Modo.DEFENSA -> viewModel.defSitOf2.name
                        else -> null
                    },

                    lanzPerdCont = viewModel.finalizacion?.name,
                    zonaLanz = viewModel.zonaLanzamiento?.name,
                    golParadaFuera = viewModel.resultadoLanzamiento?.name,
                    causaPerdida = viewModel.causaPerdida?.name)
                // Guardar accion en supabase
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val created = insertarAccion(accion)

                        if (accion.golParadaFuera == "GOL") {
                            viewModel.actualizarMarcador(accion)
                        }
                        withContext(Dispatchers.Main) {
                            if (created != null && created.idAccion != null) {
                                Log.d("MainActivity", "Accion creada con ID: ${created.idAccion}")

                            } else {
                                Log.e("MainActivity", "No se creó la acción")
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("MainActivity", "Error creando accion", e)
                    }
                }
                // Resetear toggles
                viewModel.resetAccion()
                mostrarNinguno()
                desactivarTodo()
            }

            btnStats.setOnClickListener {
                val intent = Intent(this@EstadisticasActivity, HojaActivity::class.java)
                intent.putExtra(HojaActivity.EXTRA_ID, partidoId)
                intent.putExtra(HojaActivity.EXTRA_EQUIPO, equipo)
                intent.putExtra(HojaActivity.EXTRA_RIVAL, rival)
                startActivity(intent)
            }

            // Ataque/Defensa
            btnAtaque.setOnClickListener {
                viewModel.modoActual = Modo.ATAQUE
                mostrarAtaque()
            }
            btnDefensa.setOnClickListener {
                viewModel.modoActual = Modo.DEFENSA
                mostrarDefensa()
            }
            // Toggle de tipoAtaque
            toggleTipoAtaque?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAtPosicional -> {
                        viewModel.tipoAtaque = TipoAtaque.POSICIONAL
                        mostrarAtPosicional()
                    }
                    R.id.btnAtContraataque -> {
                        viewModel.tipoAtaque = TipoAtaque.CONTRAATAQUE
                        mostrarAtContraataque()
                    }
                    R.id.btnAtContragol -> {
                        viewModel.tipoAtaque = TipoAtaque.CONTRAGOL
                        mostrarAtTipoNinguno()
                    }
                }
            }
            // Toggle de tipoDefensa
            toggleTipoDefensa?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDefPosicional -> {
                        viewModel.tipoDefensa = TipoDefensa.POSICIONAL
                        mostrarDefPosicional()
                    }
                    R.id.btnRepliegue -> {
                        viewModel.tipoDefensa = TipoDefensa.CONTRAATAQUE
                        mostrarDefContraataque()
                    }
                    R.id.btnDefContragol -> {
                        viewModel.tipoDefensa = TipoDefensa.CONTRAGOL
                        mostrarDefTipoNinguno()
                    }
                }
            }
            // Toggle de atTipoContra
            toggleAtTipoContra?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAt1ol -> viewModel.atTipoContra = AtTipoContra.OLEADA_1
                    R.id.btnAt2ol -> viewModel.atTipoContra = AtTipoContra.OLEADA_2
                    R.id.btnAt3ol -> viewModel.atTipoContra = AtTipoContra.OLEADA_3
                }
            }
            // Toggle de defTipoContra
            toggleDefTipoContra?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDef1ol -> viewModel.defTipoContra = DefTipoContra.OLEADA_1
                    R.id.btnDef2ol -> viewModel.defTipoContra = DefTipoContra.OLEADA_2
                    R.id.btnDef3ol -> viewModel.defTipoContra = DefTipoContra.OLEADA_3
                }
            }
            // Toggle de atFormacion
            toggleAtFormacion?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAt60 -> viewModel.atFormacion = AtFormacion.SEISCERO
                    R.id.btnAt51 -> viewModel.atFormacion = AtFormacion.CINCOUNO
                    R.id.btnAt33 -> viewModel.atFormacion = AtFormacion.TRESTRES
                }
            }
            // Toggle de defFormacion
            toggleDefFormacion?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDef60 -> viewModel.defFormacion = DefFormacion.SEISCERO
                    R.id.btnDef51 -> viewModel.defFormacion = DefFormacion.CINCOUNO
                    R.id.btnDef33 -> viewModel.defFormacion = DefFormacion.TRESTRES
                }
            }
            // Toggle de situación ofensiva - ataque
            toggleAtSitOfensiva?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAt2v2 -> {
                        viewModel.atSituacionOfensiva = AtSituacionOfensiva.DOS_VS_DOS
                        activarAt2v2()
                    }
                    R.id.btnAt1v1 -> {
                        viewModel.atSituacionOfensiva = AtSituacionOfensiva.UNO_VS_UNO
                        activarAt1v1()
                    }
                }
            }
            // Toggle de situación ofensiva - defensa
            toggleDefSitOfensiva?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDef2v2 -> {
                        viewModel.defSituacionOfensiva = DefSituacionOfensiva.DOS_VS_DOS
                        activarDef2v2()
                    }
                    R.id.btnDef1v1 -> {
                        viewModel.defSituacionOfensiva = DefSituacionOfensiva.UNO_VS_UNO
                        activarDef1v1()
                    }
                }
            }
            // Toggle de zona 2v2 - ataque
            toggleSitAt2v2?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAtExterior -> viewModel.atSitOf2 = AtSitOf2.EXTERIOR
                    R.id.btnAtCentro -> viewModel.atSitOf2 = AtSitOf2.CENTRO
                }
            }
            // Toggle de zona 2v2 - defensa
            toggleSitDef2v2?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDefExterior -> viewModel.defSitOf2 = DefSitOf2.EXTERIOR
                    R.id.btnDefCentro -> viewModel.defSitOf2 = DefSitOf2.CENTRO
                }
            }
            // Toggle de lado 1v1 - ataque
            toggleSitAt1v1?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnAtFuerte -> viewModel.atSitOf2 = AtSitOf2.FUERTE
                    R.id.btnAtDébil -> viewModel.atSitOf2 = AtSitOf2.DEBIL
                }
            }
            // Toggle de lado 1v1 - defensa
            toggleSitDef1v1?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnDefFuerte -> viewModel.defSitOf2 = DefSitOf2.FUERTE
                    R.id.btnDefDebil -> viewModel.defSitOf2 = DefSitOf2.DEBIL
                }
            }
            // Toggle de tipoFinalizacion
            toggleFinalizacion?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnLanzamiento -> {
                        viewModel.finalizacion = Finalizacion.LANZAMIENTO
                        mostrarLanzamiento()
                    }
                    R.id.btnPerdida -> {
                        viewModel.finalizacion = Finalizacion.PERDIDA
                        mostrarPerdida()
                    }
                    R.id.btnContinuidad -> {
                        viewModel.finalizacion = Finalizacion.CONTINUIDAD
                        mostrarContinuidad()
                    }
                }
            }
            // Toggle de zonaLanzamiento
            toggleZona?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btn6m -> viewModel.zonaLanzamiento = ZonaLanzamiento.SEIS
                    R.id.btn7m -> viewModel.zonaLanzamiento = ZonaLanzamiento.SIETE
                    R.id.btn9m -> viewModel.zonaLanzamiento = ZonaLanzamiento.NUEVE
                    R.id.btnExt -> viewModel.zonaLanzamiento = ZonaLanzamiento.EXTREMO
                    R.id.btnPiv -> viewModel.zonaLanzamiento = ZonaLanzamiento.PIVOTE
                }
            }
            // Toggle de resultado
            toggleResultado?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnGol -> viewModel.resultadoLanzamiento = ResultadoLanzamiento.GOL
                    R.id.btnParada -> viewModel.resultadoLanzamiento = ResultadoLanzamiento.PARADA
                    R.id.btnFuera -> viewModel.resultadoLanzamiento = ResultadoLanzamiento.FUERA
                }
            }
            // Toggle de causaPerdida
            togglePerdida?.addOnButtonCheckedListener { _, checkedId, isChecked ->
                if (!isChecked) return@addOnButtonCheckedListener
                when (checkedId) {
                    R.id.btnInfraccion -> viewModel.causaPerdida = CausaPerdida.INFRACCION
                    R.id.btnRobo -> viewModel.causaPerdida = CausaPerdida.ROBO
                    R.id.btnBanda -> viewModel.causaPerdida = CausaPerdida.MAL_PASE
                }
            }

            // Cronómetro
            btnPlay.setOnClickListener {
                startTimer()
            }
            btnPause.setOnClickListener {
                pauseTimer()
            }
        }
    }

    // layouts generales ataque/defensa
    private fun mostrarAtaque() {
        viewModel.modoActual = Modo.ATAQUE
        viewModel.tipoAtaque = TipoAtaque.NADA
        binding.containerAtaque?.visibility = View.VISIBLE
        binding.containerDefensa?.visibility = View.GONE
        actualizarHeader(HojaActivity.ContextoHoja.ATAQUE)
    }
    private fun mostrarDefensa() {
        viewModel.modoActual = Modo.DEFENSA
        viewModel.tipoAtaque = TipoAtaque.NADA
        binding.containerAtaque?.visibility = View.GONE
        binding.containerDefensa?.visibility = View.VISIBLE
        actualizarHeader(HojaActivity.ContextoHoja.DEFENSA)
    }
    private fun mostrarNinguno() {
        binding.containerAtaque?.visibility = View.GONE
        binding.containerDefensa?.visibility = View.GONE
        actualizarHeader(HojaActivity.ContextoHoja.NADA)
    }

    // layouts de defensa
    private fun mostrarDefPosicional() {
        binding.containerDefPosicional?.visibility = View.VISIBLE
        binding.containerDefContraataque?.visibility = View.GONE
    }
    private fun mostrarDefContraataque() {
        binding.containerDefPosicional?.visibility = View.GONE
        binding.containerDefContraataque?.visibility = View.VISIBLE
    }
    private fun mostrarDefTipoNinguno() {
        binding.containerDefPosicional?.visibility = View.GONE
        binding.containerDefContraataque?.visibility = View.GONE
    }
    private fun activarDef2v2() {
        binding.toggleSitDef1v1?.clearChecked()
        binding.toggleSitDef2v2?.isEnabled = true
        binding.toggleSitDef1v1?.isEnabled = false
    }
    private fun activarDef1v1() {
        binding.toggleSitDef2v2?.clearChecked()
        binding.toggleSitDef1v1?.isEnabled = true
        binding.toggleSitDef2v2?.isEnabled = false
    }

    // layouts de ataque
    private fun mostrarAtPosicional() {
        binding.containerAtPosicional?.visibility = View.VISIBLE
        binding.containerAtContraataque?.visibility = View.GONE
    }
    private fun mostrarAtContraataque() {
        binding.containerAtPosicional?.visibility = View.GONE
        binding.containerAtContraataque?.visibility = View.VISIBLE
    }
    private fun mostrarAtTipoNinguno() {
        binding.containerAtPosicional?.visibility = View.GONE
        binding.containerAtContraataque?.visibility = View.GONE
    }
    private fun activarAt2v2() {
        binding.toggleSitAt1v1?.clearChecked()
        binding.toggleSitAt2v2?.isEnabled = true
        binding.toggleSitAt1v1?.isEnabled = false
    }
    private fun activarAt1v1() {
        binding.toggleSitAt2v2?.clearChecked()
        binding.toggleSitAt1v1?.isEnabled = true
        binding.toggleSitAt2v2?.isEnabled = false
    }

    // Finalización
    private fun mostrarLanzamiento() {
        binding.containerLanzamiento?.visibility = View.VISIBLE
        binding.containerPerdida?.visibility = View.GONE
    }

    private fun mostrarPerdida() {
        binding.containerLanzamiento?.visibility = View.GONE
        binding.containerPerdida?.visibility = View.VISIBLE
    }
    private fun mostrarContinuidad() {
        binding.containerLanzamiento?.visibility = View.GONE
        binding.containerPerdida?.visibility = View.GONE
    }

    private fun desactivarTodo() {
        binding.toggleSitAt1v1?.clearChecked()
        binding.toggleSitAt2v2?.clearChecked()
        binding.toggleSitDef1v1?.clearChecked()
        binding.toggleSitDef2v2?.clearChecked()
        binding.toggleAtSitOfensiva?.clearChecked()
        binding.toggleDefSitOfensiva?.clearChecked()
        binding.toggleTipoAtaque?.clearChecked()
        binding.toggleTipoDefensa?.clearChecked()
        binding.toggleAtTipoContra?.clearChecked()
        binding.toggleDefTipoContra?.clearChecked()
        binding.toggleFinalizacion?.clearChecked()
        binding.toggleZona?.clearChecked()
        binding.toggleResultado?.clearChecked()
        binding.togglePerdida?.clearChecked()

        binding.toggleSitAt2v2?.isEnabled = false
        binding.toggleSitAt1v1?.isEnabled = false
        binding.toggleSitDef2v2?.isEnabled = false
        binding.toggleSitDef1v1?.isEnabled = false

        mostrarNinguno()
        mostrarDefTipoNinguno()
        mostrarAtTipoNinguno()
        mostrarContinuidad()
    }

    // Cambiar el color del encabezado si ataca o defiende
    private fun actualizarHeader(contexto: HojaActivity.ContextoHoja) {
        val color = when (contexto) {
            HojaActivity.ContextoHoja.ATAQUE -> R.color.header_ataque
            HojaActivity.ContextoHoja.DEFENSA -> R.color.header_defensa
            HojaActivity.ContextoHoja.NADA -> R.color.header_neutral
        }
        binding.headerHoja?.setBackgroundColor(
            ContextCompat.getColor(this, color)
        )
    }

    // Funciones cronómetro
    private fun startTimer() {
        if (viewModel.running) return

        viewModel.startTime = SystemClock.elapsedRealtime()
        viewModel.running = true
        handler.post(timerRunnable)
    }
    private fun pauseTimer() {
        if (!viewModel.running) return
        viewModel.elapsedTime += (SystemClock.elapsedRealtime() - viewModel.startTime)
        viewModel.running = false
        handler.removeCallbacks(timerRunnable) // Detener runnable
    }
    private fun updateTimer(elapsedMillis: Long) {
        val totalSeconds = elapsedMillis / 1000
        val minutes = totalSeconds / 60
        val seconds = totalSeconds % 60
        binding.tvTimer.text = String.format("%02d:%02d", minutes, seconds)
    }
    private fun mostrarDialogoEditarTiempo() {
        val view = layoutInflater.inflate(R.layout.dialog_editar_tiempo, null)
        val etMin = view.findViewById<EditText>(R.id.etMinutos)
        val etSeg = view.findViewById<EditText>(R.id.etSegundos)

        val totalSeconds = viewModel.elapsedTime / 1000
        val minutos = (totalSeconds / 60).toInt()
        val segundos = (totalSeconds % 60).toInt()

        etMin.setText(minutos.toString())
        etSeg.setText(segundos.toString())

        AlertDialog.Builder(this)
            .setTitle("Editar tiempo")
            .setView(view)
            .setPositiveButton("Aceptar") { _, _ ->
                val min = etMin.text.toString().toIntOrNull() ?: 0
                val seg = etSeg.text.toString().toIntOrNull() ?: 0
                viewModel.setTiempoManual(min, seg)
                updateTimer(viewModel.elapsedTime)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    // Limpiar cuando se destruye
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(timerRunnable)
    }


}