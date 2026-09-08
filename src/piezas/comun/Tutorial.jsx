import { useRef, useState } from "react";
import Modal from "./Modal";
import "../../estilos/Tutorial.css";

// Cada paso es una imagen (o montaje de varias) de la propia app con lo
// importante rodeado, más un texto corto. "pendiente: true" muestra un
// hueco en vez de una imagen rota mientras no exista esa captura todavía.
const PASOS = [
  {
    titulo: "Crea tu equipo y su plantilla",
    texto: "Desde \"Añadir equipo\" en el inicio, dale nombre y temporada. Luego entra en \"Jugadores\" del equipo para ir dando de alta a cada jugador con su nombre, dorsal y posición.",
    imagen: "/tutorial/paso1-montaje.png",
  },
  {
    titulo: "Zona de lanzamiento y de portería (opcionales)",
    texto: "En Directo puedes marcar por dónde se lanzó y a qué parte de la portería fue, para ver luego los mapas de eficacia. Si no marcas ninguna, también se puede anotar Gol, Parada o Fuera.",
    imagen: "/tutorial/paso2-montaje.png",
  },
  {
    titulo: "Ataque, defensa y sanciones",
    texto: "Selecciona a un jugador de la plantilla y pulsa una opción de Ataque, Defensa o Sanciones: la acción quedará anotada a su nombre. Si no seleccionas a ningún jugador, también se puede anotar y cuenta igualmente en la hoja general.",
    imagen: "/tutorial/paso3-montaje.png",
  },
  {
    titulo: "Hoja de estadísticas general y por jugador",
    texto: "Cada partido tiene una hoja de estadísticas general y otra por jugador. Pulsa una fila como \"Posicional\" o un tipo de defensa para desplegar el detalle de esas jugadas.",
    imagen: "/tutorial/paso4-montaje.png",
  },
  {
    titulo: "Configura tus opciones de ataque y defensa",
    texto: "En Configuración eliges qué opciones de ataque y defensa se usan en Directo y en las estadísticas de tu equipo. ¿Falta alguna que necesitas? Pídesela a Pilar y te la añadirá al catálogo.",
    imagen: "/tutorial/paso5-montaje.png",
  },
];

export default function Tutorial({ onClose }) {
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso];
  const inicioToqueRef = useRef(null);

  const irA = (indice) => setPaso(Math.max(0, Math.min(PASOS.length - 1, indice)));
  const anterior = () => irA(paso - 1);
  const siguiente = () => irA(paso + 1);

  // Deslizar con el dedo (móvil/tablet) también cambia de paso.
  const onTouchStart = (event) => {
    inicioToqueRef.current = event.touches[0].clientX;
  };
  const onTouchEnd = (event) => {
    if (inicioToqueRef.current == null) return;
    const delta = event.changedTouches[0].clientX - inicioToqueRef.current;
    inicioToqueRef.current = null;
    if (delta > 50) anterior();
    else if (delta < -50) siguiente();
  };

  return (
    <Modal title="Tutorial" onClose={onClose} className="modal--tutorial">
      <div className="tutorial">
        <div className="tutorial__slide" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="tutorial__imagen-envoltorio">
            {actual.imagen
              ? <img src={actual.imagen} alt={actual.titulo} className="tutorial__imagen" />
              : <div className="tutorial__pendiente">Captura pendiente</div>}
          </div>
          <h3>{actual.titulo}</h3>
          <p>{actual.texto}</p>
        </div>

        <div className="tutorial__nav">
          <button type="button" className="tutorial__flecha" onClick={anterior} disabled={paso === 0} aria-label="Paso anterior">
            ‹
          </button>
          <div className="tutorial__puntos">
            {PASOS.map((_, indice) => (
              <button
                key={indice}
                type="button"
                className={`tutorial__punto ${indice === paso ? "is-activo" : ""}`}
                onClick={() => irA(indice)}
                aria-label={`Ir al paso ${indice + 1} de ${PASOS.length}`}
                aria-current={indice === paso}
              />
            ))}
          </div>
          <button type="button" className="tutorial__flecha" onClick={siguiente} disabled={paso === PASOS.length - 1} aria-label="Paso siguiente">
            ›
          </button>
        </div>
      </div>
    </Modal>
  );
}
