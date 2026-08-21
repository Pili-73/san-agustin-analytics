package abad.pilar.san_agustin_analytics

import abad.pilar.san_agustin_analytics.modelos.Accion
import abad.pilar.san_agustin_analytics.modelos.Partido
import android.util.Log
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.serializer.KotlinXSerializer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.InternalSerializationApi
import kotlinx.serialization.json.Json

object SupabaseHelper {
    val json = Json {
        ignoreUnknownKeys = true
    }
    val client = createSupabaseClient(
        supabaseUrl = "https://geleeswyzhvnpszzuyeg.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGVlc3d5emh2bnBzenp1eWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzcyMTQsImV4cCI6MjA4MzExMzIxNH0.bTH-GirH3Pj2h5CzLNPvpzUT8Eww3AfIRhIN6As4pi8"
    ) {
        install(Postgrest) {
            serializer = KotlinXSerializer(json)
        }
    }
}

@OptIn(InternalSerializationApi::class)
suspend fun insertarPartido(partido: Partido): Partido? = withContext(Dispatchers.IO) {
    try {
        val result = SupabaseHelper.client
            .from("Partido")
            .insert(partido)

        Log.d("SupabaseInsert", "Response data: ${result.data}")

        // Si la respuesta está vacía, aún se insertó correctamente
        if (result.data.isBlank() || result.data == "null") {
            Log.d("SupabaseInsert", "Inserción exitosa pero sin datos devueltos")

            // Hacer un select para obtener el último partido insertado
            val ultimoPartido = SupabaseHelper.client
                .from("Partido")
                .select()

            Log.d("SupabaseInsert", "Select data: ${ultimoPartido.data}")

            val json = Json { ignoreUnknownKeys = true }
            val partidos = json.decodeFromString<List<Partido>>(ultimoPartido.data)
            val created = partidos.maxByOrNull { it.id ?: 0 }

            Log.d("SupabaseInsert", "Último partido: ID=${created?.id}")
            return@withContext created
        }
        val json = Json { ignoreUnknownKeys = true }
        val partidos = json.decodeFromString<List<Partido>>(result.data)
        val created = partidos.firstOrNull()
        Log.d("SupabaseInsert", "Partido insertado: ID=${created?.id}")
        return@withContext created

    } catch (e: Exception) {
        Log.e("SupabaseInsert", "Error al insertar partido", e)
        return@withContext null
    }
}

@OptIn(InternalSerializationApi::class)
suspend fun insertarAccion(accion: Accion): Accion? = withContext(Dispatchers.IO) {
    try {
        // 1. Insertar la acción
        SupabaseHelper.client
            .from("Accion")
            .insert(accion)

        Log.d("SupabaseInsert", "Accion insertada correctamente")

        // 2. Hacer select para obtener todas las acciones
        val response = SupabaseHelper.client
            .from("Accion")
            .select()

        // 3. Parsear y obtener la última insertada (mayor ID)
        val json = Json { ignoreUnknownKeys = true }
        val acciones = json.decodeFromString<List<Accion>>(response.data)
        val ultimaAccion = acciones.maxByOrNull { it.idAccion ?: 0 }

        Log.d("SupabaseInsert", "Última accion insertada: ID=${ultimaAccion?.idAccion}")
        return@withContext ultimaAccion

    } catch (e: Exception) {
        Log.e("SupabaseInsert", "Error al insertar accion: ${e.message}", e)
        return@withContext null
    }
}