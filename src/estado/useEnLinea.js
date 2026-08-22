import { useEffect, useState } from "react";

// Estado de conexión del navegador, para avisar cuando una pantalla podría
// estar mostrando datos guardados en caché en vez de recién bajados.
export function useEnLinea() {
  const [enLinea, setEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    const marcarOnline = () => setEnLinea(true);
    const marcarOffline = () => setEnLinea(false);
    window.addEventListener("online", marcarOnline);
    window.addEventListener("offline", marcarOffline);
    return () => {
      window.removeEventListener("online", marcarOnline);
      window.removeEventListener("offline", marcarOffline);
    };
  }, []);

  return enLinea;
}
