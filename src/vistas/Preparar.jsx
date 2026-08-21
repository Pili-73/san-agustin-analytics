import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearPartido } from "../datos/partidos";
import { obtenerEquipo } from "../datos/equipos";
import { useCargaAsync } from "../estado/useCargaAsync";
import { fechaDeHoy, horaActual } from "../utils/tiempo";
import Campo from "../piezas/comun/Campo";
import BotonVolver from "../piezas/comun/BotonVolver";
import "../estilos/Preparar.css";

export default function Preparar() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [rival, setRival] = useState("");
  const [campo, setCampo] = useState("");
  const [fecha, setFecha] = useState(fechaDeHoy());
  const [hora, setHora] = useState(horaActual());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const { error: errorCarga } = useCargaAsync(() => obtenerEquipo(equipoId), {
    deps: [equipoId],
    onExito: setEquipo,
    mensajeError: "No se pudo cargar el equipo.",
  });

  const formularioValido = equipo != null && rival.trim() !== "";

  const handleIniciarPartido = async () => {
    if (!formularioValido || enviando) return;

    setEnviando(true);
    setError(null);
    const payload = {
      id_equipo: Number(equipoId),
      rival: rival.trim(),
      fecha,
      hora,
      ...(campo.trim() ? { campo: campo.trim() } : {}),
    };

    try {
      const creado = await crearPartido(payload);
      if (creado?.id != null) {
        navigate(`/partidos/${creado.id}/directo`, {
          state: { equipo: equipo.nombre, rival: payload.rival },
        });
      } else {
        setError("No se pudo crear el partido: no se recibió ID.");
      }
    } catch (err) {
      console.error("Error creando partido", err);
      setError("No se pudo crear el partido. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="preparar-partido">
      <header className="preparar-partido__header">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1>Datos del partido</h1>
      </header>

      <form className="preparar-partido__form tarjeta-formulario" onSubmit={(event) => {
        event.preventDefault();
        handleIniciarPartido();
      }}>
        <Campo label="Equipo Agustinos">
          <input type="text" value={equipo?.nombre || "Cargando equipo…"} readOnly />
        </Campo>
        <Campo label="Equipo rival">
          <input type="text" value={rival} onChange={(event) => setRival(event.target.value)} placeholder="Nombre del equipo rival" />
        </Campo>
        <Campo label="Campo (opcional)">
          <input type="text" value={campo} onChange={(event) => setCampo(event.target.value)} placeholder="Lugar del partido" />
        </Campo>
        <div className="campo-fila">
          <Campo label="Fecha">
            <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          </Campo>
          <Campo label="Hora">
            <input type="time" value={hora} onChange={(event) => setHora(event.target.value)} />
          </Campo>
        </div>
        {(error || errorCarga) && <p className="texto-error">{error || errorCarga}</p>}
        <button type="submit" className="preparar-partido__iniciar" disabled={!formularioValido || enviando}>
          {enviando ? "Creando partido…" : "Iniciar partido"}
        </button>
      </form>
    </div>
  );
}
