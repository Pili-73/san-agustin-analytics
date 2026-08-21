// Envuelve cualquier control (input, select...) con la misma etiqueta y espaciado.
// Uso: <Campo label="Equipo rival"><input ... /></Campo>
export default function Campo({ label, children }) {
  return (
    <label className="campo">
      <span>{label}</span>
      {children}
    </label>
  );
}
