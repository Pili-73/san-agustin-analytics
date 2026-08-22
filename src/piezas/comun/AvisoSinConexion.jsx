import { useEnLinea } from "../../estado/useEnLinea";

// Aviso discreto para pantallas que pueden estar mostrando datos guardados
// en caché (sin red) en vez de recién bajados de Supabase.
export default function AvisoSinConexion() {
  const enLinea = useEnLinea();
  if (enLinea) return null;

  return (
    <p className="aviso-sin-conexion">
      📡 Sin conexión — mostrando los últimos datos guardados
    </p>
  );
}
