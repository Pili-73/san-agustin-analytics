import { useState } from "react";
import { Link } from "react-router-dom";
import { crearEquipo, listarEquipos } from "../datos/equipos";
import { useCargaAsync } from "../estado/useCargaAsync";
import Modal from "../piezas/comun/Modal";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import "../estilos/Inicio.css";

export default function Inicio() {
  const [equipos, setEquipos] = useState([]);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nombre, setNombre] = useState("");
  const [temporada, setTemporada] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  const { cargando, error } = useCargaAsync(listarEquipos, {
    onExito: setEquipos,
    mensajeError: "No se pudieron cargar los equipos.",
  });

  const cerrarAlta = () => {
    if (guardando) return;
    setMostrarAlta(false);
    setNombre("");
    setTemporada("");
  };

  const guardarEquipo = async (event) => {
    event.preventDefault();
    if (!nombre.trim() || guardando) return;

    setGuardando(true);
    setErrorGuardado("");
    try {
      await crearEquipo({ nombre, temporada });
      // Se vuelve a pedir la lista entera (en vez de solo añadir el nuevo al
      // estado local) para que la caché offline de "equipos" quede al día;
      // si no, se queda con la lista de antes de crear este equipo hasta la
      // próxima carga con red que tenga éxito.
      setEquipos(await listarEquipos());
      setMostrarAlta(false);
      setNombre("");
      setTemporada("");
    } catch (err) {
      console.error("Error creando equipo", err);
      setErrorGuardado("No se pudo crear el equipo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="inicio">
      <h1>SAN AGUSTIN ANALYTICS</h1>

      <section className="equipos" aria-label="Equipos">
        <EstadoCarga cargando={cargando} error={error} mensajeCargando="Cargando equipos…">
          <div className="equipos__carrusel">
            {equipos.map((equipo) => (
              <article className="tarjeta-equipo" key={equipo.id}>
                <div>
                  <h2>{equipo.nombre}</h2>
                  {equipo.temporada && <p>{equipo.temporada}</p>}
                </div>
                <div className="tarjeta-equipo__acciones">
                  <Link to={`/equipos/${equipo.id}/jugadores`}>Jugadores</Link>
                  <Link to={`/equipos/${equipo.id}/partido/nuevo`}>Iniciar partido</Link>
                  <Link to={`/equipos/${equipo.id}/partidos`}>Ver partidos</Link>
                  <Link to={`/equipos/${equipo.id}/estadisticas`}>Estadísticas de temporada</Link>
                </div>
              </article>
            ))}

            <button className="tarjeta-equipo tarjeta-equipo--alta" type="button" onClick={() => setMostrarAlta(true)}>
              <span aria-hidden="true">+</span>
              Añadir equipo
            </button>
          </div>
        </EstadoCarga>
      </section>

      {mostrarAlta && (
        <Modal title="Añadir equipo" onClose={cerrarAlta}>
          <form className="form-equipo" onSubmit={guardarEquipo}>
            <label>
              Nombre
              <input value={nombre} onChange={(event) => setNombre(event.target.value)} autoFocus />
            </label>
            <label>
              Temporada <span>(opcional)</span>
              <input value={temporada} onChange={(event) => setTemporada(event.target.value)} placeholder="2026/2027" />
            </label>
            {errorGuardado && <p className="texto-error">{errorGuardado}</p>}
            <div className="modal-botones">
              <button type="button" onClick={cerrarAlta} disabled={guardando}>Cancelar</button>
              <button className="btn-primario" type="submit" disabled={!nombre.trim() || guardando}>
                {guardando ? "Guardando…" : "Crear equipo"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
