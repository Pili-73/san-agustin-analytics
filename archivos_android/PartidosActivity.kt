package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.adapters.EquipoAdapter
import abad.pilar.san_agustin_analytics.adapters.PartidoAdapter
import abad.pilar.san_agustin_analytics.adapters.PartidoListener
import abad.pilar.san_agustin_analytics.databinding.ActivityPartidosBinding
import abad.pilar.san_agustin_analytics.modelos.Partido
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.InternalSerializationApi
import kotlinx.serialization.json.Json


class PartidosActivity : AppCompatActivity(), PartidoListener {
    private lateinit var binding: ActivityPartidosBinding
    private lateinit var adapter: PartidoAdapter
    private lateinit var equipoAdapter: EquipoAdapter
    @OptIn(InternalSerializationApi::class)
    private val lista = ArrayList<Partido>()

    @OptIn(InternalSerializationApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPartidosBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = PartidoAdapter(lista, this)

        equipoAdapter = EquipoAdapter(
            this,
            listOf("Todos los equipos") + EquiposProvider.equipos
        )

        with(binding) {
            spFiltroEquipos?.adapter = equipoAdapter
            spFiltroEquipos?.setSelection(0)
            spFiltroEquipos?.onItemSelectedListener =
                object : AdapterView.OnItemSelectedListener {
                    override fun onItemSelected(
                        parent: AdapterView<*>?,
                        view: View?,
                        position: Int,
                        id: Long
                    ) {
                        val seleccionado = parent?.getItemAtPosition(position) as String

                        if (seleccionado == "Todos los equipos") {
                            cargarPartidos(null)
                        } else {
                            cargarPartidos(seleccionado)
                        }
                    }

                    override fun onNothingSelected(parent: AdapterView<*>) {}
                }


            recyclerPartidos.apply {
                this?.layoutManager = LinearLayoutManager(this@PartidosActivity)
                recyclerPartidos?.adapter = adapter
            }

            flechaVolver3?.setOnClickListener {
                finish()
            }
            cargarPartidos(null)
        }
    }

    @OptIn(InternalSerializationApi::class)
    private fun cargarPartidos(equipo: String?) {
        lifecycleScope.launch {
            try {
                val partidos = withContext(Dispatchers.IO) {
                    val response = if (equipo != null) {
                        // Si hay equipo, filtrar
                        SupabaseHelper.client
                            .from("Partido")
                            .select {
                                filter {
                                    eq("equipo", equipo)
                                }
                                order("fecha", Order.DESCENDING)
                            }
                    } else {
                        // Si no hay equipo, traer todos
                        SupabaseHelper.client
                            .from("Partido")
                            .select {
                                order("fecha", Order.DESCENDING)
                            }
                    }

                    val json = Json { ignoreUnknownKeys = true }
                    json.decodeFromString<List<Partido>>(response.data)
                }

                lista.clear()
                lista.addAll(partidos)
                adapter.notifyDataSetChanged()

            } catch (e: Exception) {
                Log.e("PARTIDOS", "Error: ${e.message}", e)
            }
        }
    }


    @OptIn(InternalSerializationApi::class)
    override fun onPartidoClick(partido: Partido, posicion: Int) {
        val intent = Intent(this, HojaActivity::class.java)
        intent.putExtra(HojaActivity.EXTRA_ID, partido.id)
        intent.putExtra(HojaActivity.EXTRA_EQUIPO, partido.equipo)
        intent.putExtra(HojaActivity.EXTRA_RIVAL, partido.rival)
        startActivity(intent)
    }
}
