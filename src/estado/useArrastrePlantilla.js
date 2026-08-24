import { useState } from "react";

// Arrastre con pointer events (ratón y táctil) para reordenar/mover ids entre
// dos listas — en Directo, "en el campo" y "banquillo". No usa la API nativa
// de drag-and-drop porque no funciona bien en dispositivos táctiles.
// onCambioLista(id, tipo): opcional, se llama solo cuando el jugador cruza
// de lista de verdad (no al reordenar dentro de la misma), con tipo "IN" si
// entra a campo o "OUT" si sale a banquillo — para registrar minutos jugados.
export function useArrastrePlantilla({ campo, banquillo, setCampo, setBanquillo, onCambioLista }) {
  const [arrastre, setArrastre] = useState(null); // { id, origen }
  const [zonaSobrevolada, setZonaSobrevolada] = useState(null); // { lista, targetId, before }

  const listaActual = (lista) => (lista === "campo" ? campo : banquillo);
  const setListaActual = (lista) => (lista === "campo" ? setCampo : setBanquillo);

  const empezarArrastre = (event, id, origen) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setArrastre({ id, origen });
  };

  const seguirArrastre = (event) => {
    if (!arrastre) return;
    const elemento = document.elementFromPoint(event.clientX, event.clientY);
    const zonaEl = elemento?.closest("[data-lista]");
    if (!zonaEl) return;
    const lista = zonaEl.dataset.lista;
    const filaEl = elemento?.closest("[data-jugador-fila]");
    if (filaEl && zonaEl.contains(filaEl)) {
      const rect = filaEl.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      setZonaSobrevolada({ lista, targetId: Number(filaEl.dataset.jugadorFila), before });
    } else {
      setZonaSobrevolada({ lista, targetId: null, before: false });
    }
  };

  const soltarArrastre = () => {
    if (arrastre && zonaSobrevolada) {
      const origenArr = [...listaActual(arrastre.origen)];
      const idxOrigen = origenArr.indexOf(arrastre.id);
      if (idxOrigen !== -1) {
        origenArr.splice(idxOrigen, 1);
        const destinoLista = zonaSobrevolada.lista;
        const destinoArr = destinoLista === arrastre.origen ? origenArr : [...listaActual(destinoLista)];
        let indice;
        if (zonaSobrevolada.targetId == null) {
          indice = destinoArr.length;
        } else {
          indice = destinoArr.indexOf(zonaSobrevolada.targetId);
          if (indice === -1) indice = destinoArr.length;
          else if (!zonaSobrevolada.before) indice += 1;
        }
        destinoArr.splice(indice, 0, arrastre.id);

        if (destinoLista === arrastre.origen) {
          setListaActual(arrastre.origen)(destinoArr);
        } else {
          setListaActual(arrastre.origen)(origenArr);
          setListaActual(destinoLista)(destinoArr);
          onCambioLista?.(arrastre.id, destinoLista === "campo" ? "IN" : "OUT");
        }
      }
    }
    setArrastre(null);
    setZonaSobrevolada(null);
  };

  return { arrastre, zonaSobrevolada, empezarArrastre, seguirArrastre, soltarArrastre };
}
