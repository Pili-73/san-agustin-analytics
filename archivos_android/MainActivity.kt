package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.databinding.ActivityMainBinding
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest

class MainActivity : AppCompatActivity() {
    lateinit var binding: ActivityMainBinding
    private val supabase = createSupabaseClient(
        supabaseUrl = "https://geleeswyzhvnpszzuyeg.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGVlc3d5emh2bnBzenp1eWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzcyMTQsImV4cCI6MjA4MzExMzIxNH0.bTH-GirH3Pj2h5CzLNPvpzUT8Eww3AfIRhIN6As4pi8"
    ) {
        install(Postgrest)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        with(binding) {
            btnPartido.setOnClickListener {
                val intent = Intent(this@MainActivity, PartidoFormActivity::class.java)
                startActivity(intent)
            }

            btnEstadisticas.setOnClickListener {
                val intent = Intent(this@MainActivity, PartidosActivity::class.java)
                startActivity(intent)
            }

            btnAnadirEquipo.setOnClickListener {
                Toast.makeText(this@MainActivity,
                    "Función no disponible en este momento",  Toast.LENGTH_SHORT).show()
            }
            btnEditarEquipo.setOnClickListener {
                Toast.makeText(this@MainActivity, "Función no disponible en este momento",  Toast.LENGTH_SHORT).show()
            }
        }
    }
}