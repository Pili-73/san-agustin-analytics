// Icono de una acción, igual en Directo y en la línea del tiempo: una
// exclusión de 2 min lleva el gesto de 2 dedos (sea la nuestra, en
// Sanciones, o la del rival, que se anota en el desplegable de ataque), el
// resto de sanciones una tarjeta de su color, y lo demás un círculo de color.
export default function IndicadorAccion({ codigo, fin, color }) {
  if (fin === "2MIN") {
    return <span className="icono-2min" aria-hidden="true">✌️</span>;
  }
  if (codigo === "SAN") {
    return <span className={`icono-tarjeta icono-tarjeta--${color}`} aria-hidden="true" />;
  }
  return <span className={`indicador-color indicador-color--${color}`} aria-hidden="true" />;
}
