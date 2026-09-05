import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEquipo } from "../datos/equipos";
import { guardarSeleccionEquipo } from "../datos/opcionesAccion";
import { useOpcionesAccion } from "../estado/useOpcionesAccion";
import { useCargaAsync } from "../estado/useCargaAsync";
import BotonVolver from "../piezas/comun/BotonVolver";
import EstadoCarga from "../piezas/comun/EstadoCarga";
import "../estilos/Configuracion.css";

const LIMITE_POR_CONTEXTO = 10;
const TITULOS_CONTEXTO = { ATQ: "Ataque", DEF: "Defensa" };

export default function Configuracion() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const idEquipo = Number(equipoId);

  const [equipo, setEquipo] = useState(null);
  useCargaAsync(() => obtenerEquipo(idEquipo), {
    deps: [idEquipo],
    onExito: setEquipo,
    mensajeError: "No se pudo cargar el equipo.",
  });

  const { cargando, error, catalogo, seleccionIds } = useOpcionesAccion(idEquipo);

  // La selección editable se inicializa una sola vez, en cuanto llega la
  // primera carga; a partir de ahí la controla el usuario, no las recargas
  // del hook (que no vuelven a dispararse solas mientras no cambie idEquipo).
  const [seleccion, setSeleccion] = useState(new Set());
  const [inicializada, setInicializada] = useState(false);
  useEffect(() => {
    if (!cargando && !inicializada) {
      setSeleccion(new Set(seleccionIds));
      setInicializada(true);
    }
  }, [cargando, inicializada, seleccionIds]);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [guardadoOk, setGuardadoOk] = useState(false);

  const contarActivas = (set, contexto) =>
    catalogo.filter((opcion) => opcion.contexto === contexto && set.has(opcion.id)).length;

  const alternar = (opcion) => {
    setGuardadoOk(false);
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(opcion.id)) {
        nueva.delete(opcion.id);
      } else {
        if (contarActivas(actual, opcion.contexto) >= LIMITE_POR_CONTEXTO) return actual;
        nueva.add(opcion.id);
      }
      return nueva;
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setErrorGuardado("");
    try {
      await guardarSeleccionEquipo(idEquipo, [...seleccion]);
      setGuardadoOk(true);
    } catch (err) {
      console.error("Error guardando la configuración", err);
      setErrorGuardado("No se pudo guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="configuracion">
      <header className="configuracion__cabecera">
        <BotonVolver onClick={() => navigate(-1)} />
        <h1 className="configuracion__titulo">{equipo?.nombre || "Equipo"} · Configuración</h1>
      </header>

      <EstadoCarga cargando={cargando} error={error} mensajeCargando="Cargando configuración…">
        <p className="configuracion__ayuda">
          Elige qué datos de ataque y defensa quieres ver en Directo y en la hoja de estadísticas
          de este equipo (máximo {LIMITE_POR_CONTEXTO} por lado).
        </p>

        <div className="configuracion__columnas">
          {["ATQ", "DEF"].map((contexto) => {
            const opciones = catalogo
              .filter((opcion) => opcion.contexto === contexto)
              .sort((a, b) => a.orden - b.orden);
            const activas = contarActivas(seleccion, contexto);

            return (
              <section className="configuracion__columna" key={contexto}>
                <h2>
                  {TITULOS_CONTEXTO[contexto]}
                  <span className="configuracion__contador">{activas}/{LIMITE_POR_CONTEXTO}</span>
                </h2>
                <ul className="configuracion__lista">
                  {opciones.map((opcion) => {
                    const activa = seleccion.has(opcion.id);
                    return (
                      <li key={opcion.id}>
                        <label className={`configuracion__opcion ${activa ? "is-activa" : ""}`}>
                          <input
                            type="checkbox"
                            checked={activa}
                            disabled={!activa && activas >= LIMITE_POR_CONTEXTO}
                            onChange={() => alternar(opcion)}
                          />
                          <span className={`indicador-color indicador-color--${opcion.color}`} aria-hidden="true" />
                          {opcion.titulo}
                        </label>
                      </li>
                    );
                  })}
                  {opciones.length === 0 && <li className="configuracion__vacia">Sin opciones en el catálogo.</li>}
                </ul>
              </section>
            );
          })}
        </div>

        {errorGuardado && <p className="texto-error">{errorGuardado}</p>}
        {guardadoOk && <p className="configuracion__ok">Configuración guardada.</p>}
        <div className="configuracion__acciones">
          <button type="button" className="btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </EstadoCarga>
    </main>
  );
}
