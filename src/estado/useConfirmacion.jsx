import { useCallback, useRef, useState } from "react";
import Modal from "../piezas/comun/Modal";

// Sustituto de window.confirm con el modal propio de la app. confirmar(msg)
// devuelve una promesa que resuelve a true/false según el botón pulsado;
// dialogo hay que renderizarlo una vez en el JSX de quien use el hook.
// Los saltos de línea ("\n\n" para avisos extra) se preservan con
// white-space: pre-line en vez de partir el mensaje en varios <p>.
export function useConfirmacion() {
  const [mensaje, setMensaje] = useState(null);
  const resolverRef = useRef(null);

  const confirmar = useCallback((texto) => {
    setMensaje(texto);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const responder = (valor) => {
    setMensaje(null);
    resolverRef.current?.(valor);
    resolverRef.current = null;
  };

  const dialogo = mensaje != null && (
    <Modal onClose={() => responder(false)}>
      <p className="confirmacion__mensaje">{mensaje}</p>
      <div className="modal-botones">
        <button type="button" onClick={() => responder(false)}>Cancelar</button>
        <button type="button" className="btn-primario" onClick={() => responder(true)}>Aceptar</button>
      </div>
    </Modal>
  );

  return { confirmar, dialogo };
}
