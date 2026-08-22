import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Inicio from "./vistas/Inicio.jsx";
import Preparar from "./vistas/Preparar.jsx";
import PartidosGuardados from "./vistas/PartidosGuardados.jsx";
import Estadisticas from "./vistas/Estadisticas.jsx";
import EstadisticasJugador from "./vistas/EstadisticasJugador.jsx";
import Directo from "./vistas/Directo.jsx";
import Jugadores from "./vistas/Jugadores.jsx";
import { useFlushColaGlobal } from "./estado/useFlushColaGlobal.js";

function App() {
  useFlushColaGlobal();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/equipos/:equipoId/jugadores" element={<Jugadores />} />
        <Route path="/equipos/:equipoId/partido/nuevo" element={<Preparar />} />
        <Route path="/equipos/:equipoId/partidos" element={<PartidosGuardados />} />
        <Route path="/partidos/:id/estadisticas" element={<Estadisticas />} />
        <Route path="/partidos/:id/estadisticas/jugador" element={<EstadisticasJugador />} />
        <Route path="/partidos/:id/estadisticas/jugador/:jugadorId" element={<EstadisticasJugador />} />
        <Route path="/partidos/:id/directo" element={<Directo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
