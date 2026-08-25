import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEquipo } from "../datos/equipos";
import {
  activarJugador,
  actualizarJugador,
  crearJugador,
  desactivarJugador,
  eliminarJugador,
  listarJugadoresEquipo,
} from "../datos/jugadores";
import { useCargaAsync } from "../estado/useCargaAsync";
import { useConfirmacion } from "../estado/useConfirmacion";
import BotonVolver from "../piezas/comun/BotonVolver";
import Modal from "../piezas/comun/Modal";
import Toast from "../piezas/comun/Toast";
import Campo from "../piezas/comun/Campo";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import "../estilos/Jugadores.css";

const POSICIONES = [
  "Portero",
  "Lateral izquierdo",
  "Central",
  "Lateral derecho",
  "Extremo izquierdo",
  "Extremo derecho",
  "Pivote",
];

const JUGADOR_VACIO = { nombre: "", apellido: "", dorsal: "", posicion: POSICIONES[0] };

export default function Jugadores() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);

  const [editando, setEditando] = useState(null); // null = cerrado, {} = alta, jugador = edición
  const [form, setForm] = useState(JUGADOR_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [procesando, setProcesando] = useState(null); // id del jugador en curso (borrar/reactivar)
  const [errorBorrado, setErrorBorrado] = useState("");
  const [aviso, setAviso] = useState(null);
  const { confirmar, dialogo: dialogoConfirmacion } = useConfirmacion();

  const { cargando, error } = useCargaAsync(
    () => Promise.all([obtenerEquipo(equipoId), listarJugadoresEquipo(equipoId, { incluirInactivos: true })]),
    {
      deps: [equipoId],
      onExito: ([equipoCargado, jugadoresCargados]) => {
        setEquipo(equipoCargado);
        setJugadores(jugadoresCargados);
      },
      mensajeError: "No se pudo cargar la plantilla.",
    }
  );

  const abrirAlta = () => {
    setForm(JUGADOR_VACIO);
    setErrorForm("");
    setEditando({});
  };

  const abrirEdicion = (jugador) => {
    setForm({
      nombre: jugador.nombre || "",
      apellido: jugador.apellido || "",
      dorsal: jugador.dorsal ?? "",
      posicion: jugador.posicion || POSICIONES[0],
    });
    setErrorForm("");
    setEditando(jugador);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setEditando(null);
  };

  const formularioValido = form.nombre.trim() !== "" && form.apellido.trim() !== "" && form.dorsal !== "";

  // Sustituye un jugador de la lista por su versión actualizada (tras editar,
  // dar de baja o reactivar), sin tocar el resto de la plantilla ni recargar.
  const reemplazarJugador = (actualizado) => {
    setJugadores((actuales) => actuales.map((actual) => (actual.id === actualizado.id ? actualizado : actual)));
  };

  const guardarJugador = async (event) => {
    event.preventDefault();
    if (!formularioValido || guardando) return;

    setGuardando(true);
    setErrorForm("");
    try {
      if (editando?.id) {
        const actualizado = await actualizarJugador(editando.id, form);
        setJugadores((actuales) =>
          actuales
            .map((jugador) => (jugador.id === actualizado.id ? { ...jugador, ...actualizado } : jugador))
            .sort((a, b) => a.dorsal - b.dorsal)
        );
      } else {
        const creado = await crearJugador({ ...form, id_equipo: equipoId });
        setJugadores((actuales) => [...actuales, creado].sort((a, b) => a.dorsal - b.dorsal));
      }
      setEditando(null);
    } catch (err) {
      console.error("Error guardando jugador", err);
      setErrorForm("No se pudo guardar el jugador.");
    } finally {
      setGuardando(false);
    }
  };

  const borrarJugador = async (jugador) => {
    if (procesando) return;
    if (!(await confirmar(`¿Eliminar a ${jugador.nombre} ${jugador.apellido}?`))) return;

    setProcesando(jugador.id);
    setErrorBorrado("");
    try {
      await eliminarJugador(jugador.id);
      setJugadores((actuales) => actuales.filter((actual) => actual.id !== jugador.id));
    } catch (err) {
      if (err?.code === "23503") {
        // Tiene acciones registradas: no se puede borrar, se da de baja en su lugar.
        try {
          const actualizado = await desactivarJugador(jugador.id);
          reemplazarJugador(actualizado);
          setAviso(`${jugador.nombre} tiene partidos registrados: se ha dado de baja en vez de eliminarlo.`);
        } catch (errBaja) {
          console.error("Error dando de baja al jugador", errBaja);
          setErrorBorrado("No se pudo eliminar ni dar de baja al jugador.");
        }
      } else {
        console.error("Error eliminando jugador", err);
        setErrorBorrado("No se pudo eliminar el jugador.");
      }
    } finally {
      setProcesando(null);
    }
  };

  const reactivarJugador = async (jugador) => {
    if (procesando) return;
    setProcesando(jugador.id);
    setErrorBorrado("");
    try {
      const actualizado = await activarJugador(jugador.id);
      reemplazarJugador(actualizado);
    } catch (err) {
      console.error("Error reactivando jugador", err);
      setErrorBorrado("No se pudo reactivar el jugador.");
    } finally {
      setProcesando(null);
    }
  };

  return (
    <main className="vista-jugadores">
      <Toast mensaje={aviso} onDismiss={() => setAviso(null)} />
      <header className="vista-jugadores__cabecera">
        <BotonVolver onClick={() => navigate(-1)} />
        <div>
          <h1>{equipo?.nombre || "Jugadores"}</h1>
          <p>Plantilla del equipo</p>
        </div>
        <button type="button" className="btn-anadir-jugador" onClick={abrirAlta}>
          + Añadir jugador
        </button>
      </header>

      <EstadoCarga cargando={cargando} error={error} mensajeCargando="Cargando plantilla…">
        {errorBorrado && <p className="texto-error">{errorBorrado}</p>}
        <ul className="lista-jugadores">
          {jugadores.map((jugador) => (
            <li key={jugador.id} className={jugador.activo === false ? "lista-jugadores__baja" : ""}>
              <strong>{jugador.dorsal}</strong>
              <span>
                {jugador.nombre} {jugador.apellido}
              </span>
              <small>
                {jugador.posicion}
                {jugador.activo === false && <em className="etiqueta-baja">BAJA</em>}
              </small>
              <div className="lista-jugadores__acciones">
                <button type="button" onClick={() => abrirEdicion(jugador)} aria-label="Editar jugador">
                  ✎
                </button>
                {jugador.activo === false ? (
                  <button
                    type="button"
                    className="btn-reactivar"
                    onClick={() => reactivarJugador(jugador)}
                    disabled={procesando === jugador.id}
                    aria-label="Reactivar jugador"
                  >
                    {procesando === jugador.id ? "…" : "↺"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-eliminar"
                    onClick={() => borrarJugador(jugador)}
                    disabled={procesando === jugador.id}
                    aria-label="Eliminar jugador"
                  >
                    {procesando === jugador.id ? "…" : "🗑"}
                  </button>
                )}
              </div>
            </li>
          ))}
          {jugadores.length === 0 && (
            <li className="lista-jugadores__vacia">No hay jugadores en la plantilla.</li>
          )}
        </ul>
      </EstadoCarga>

      {editando && (
        <Modal title={editando.id ? "Editar jugador" : "Añadir jugador"} onClose={cerrarModal}>
          <form className="form-jugador" onSubmit={guardarJugador}>
            <Campo label="Nombre">
              <input
                value={form.nombre}
                onChange={(event) => setForm((actual) => ({ ...actual, nombre: event.target.value }))}
                autoFocus
              />
            </Campo>
            <Campo label="Apellidos">
              <input
                value={form.apellido}
                onChange={(event) => setForm((actual) => ({ ...actual, apellido: event.target.value }))}
              />
            </Campo>
            <div className="form-jugador__fila">
              <Campo label="Dorsal">
                <input
                  type="number"
                  min="0"
                  value={form.dorsal}
                  onChange={(event) => setForm((actual) => ({ ...actual, dorsal: event.target.value }))}
                />
              </Campo>
              <Campo label="Posición">
                <select
                  value={form.posicion}
                  onChange={(event) => setForm((actual) => ({ ...actual, posicion: event.target.value }))}
                >
                  {POSICIONES.map((posicion) => (
                    <option key={posicion} value={posicion}>
                      {posicion}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
            {errorForm && <p className="texto-error">{errorForm}</p>}
            <div className="modal-botones">
              <button type="button" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </button>
              <button className="btn-primario" type="submit" disabled={!formularioValido || guardando}>
                {guardando ? "Guardando…" : editando.id ? "Guardar cambios" : "Añadir jugador"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialogoConfirmacion}
    </main>
  );
}
