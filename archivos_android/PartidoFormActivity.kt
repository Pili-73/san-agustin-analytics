package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.adapters.EquipoAdapter
import abad.pilar.san_agustin_analytics.databinding.ActivityPartidoFormBinding
import abad.pilar.san_agustin_analytics.modelos.Partido
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.InternalSerializationApi
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale


class PartidoFormActivity : AppCompatActivity() {
    companion object {
        // Para destruir la activity de PartidoForm al cerrar
        var instance: PartidoFormActivity? = null
    }
    lateinit var binding: ActivityPartidoFormBinding
    val calendar = Calendar.getInstance()

    @OptIn(InternalSerializationApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = this
        enableEdgeToEdge()
        binding = ActivityPartidoFormBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        // Coger array de equipos para el spinner
        val equipos = listOf("Selecciona un equipo") + EquiposProvider.equipos
        val adapter = EquipoAdapter(this, equipos)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        with(binding) {
        spEquipoAgustinos?.adapter = adapter
        spEquipoAgustinos?.setSelection(0)
        spEquipoAgustinos?.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    if (position == 0) return
                }

                override fun onNothingSelected(parent: AdapterView<*>) {}
            }

            val dateFormat = SimpleDateFormat("yyyy/MM/dd", Locale.getDefault())
            formFecha.setText(dateFormat.format(calendar.time))
            formFecha.setOnClickListener {
                DatePickerDialog(
                    this@PartidoFormActivity,
                    { _, year, month, day ->
                        calendar.set(year, month, day)
                        formFecha.setText(dateFormat.format(calendar.time))
                    },
                    calendar.get(Calendar.YEAR),
                    calendar.get(Calendar.MONTH),
                    calendar.get(Calendar.DAY_OF_MONTH)
                ).show()
            }
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            formHora.setText(timeFormat.format(calendar.time))
            formHora.setOnClickListener {
                TimePickerDialog(
                    this@PartidoFormActivity,
                    { _, hora, mins ->
                        calendar.set(Calendar.HOUR_OF_DAY, hora)
                        calendar.set(Calendar.MINUTE, mins)
                        formHora.setText(timeFormat.format(calendar.time))
                    },
                    calendar.get(Calendar.HOUR_OF_DAY),
                    calendar.get(Calendar.MINUTE),
                    true
                ).show()
            }

            // En tu Activity
            btnIniciarPartido.setOnClickListener {
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val partido = Partido(
                            equipo = spEquipoAgustinos?.selectedItem as String,
                            rival = formRival.text.toString(),
                            campo = formCampo.text.toString(),
                            fecha = formFecha.text.toString(),
                            hora = formHora.text.toString()
                        )

                        val created = insertarPartido(partido)

                        withContext(Dispatchers.Main) {
                            if (created != null && created.id != null) {
                                Log.d("MainActivity", "Partido creado con ID: ${created.id}")
                                abrirEstadisticas(created.id, partido.equipo, partido.rival)
                            } else {
                                Log.e("MainActivity", "No se creó el partido o no se devolvió ID")
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("MainActivity", "Error creando partido", e)
                    }
                }
            }

            flechaVolver?.setOnClickListener {
                finish()
            }
        }
    }

    private fun abrirEstadisticas(partidoId: Int, equipo: String, rival: String) {
        val intent = Intent(this, EstadisticasActivity::class.java)
        intent.putExtra(HojaActivity.EXTRA_ID, partidoId)
        intent.putExtra(HojaActivity.EXTRA_EQUIPO, equipo)
        intent.putExtra(HojaActivity.EXTRA_RIVAL, rival)
        startActivity(intent)
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

}