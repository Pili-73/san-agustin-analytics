export default function BotonVolver({ onClick, label = "Volver" }) {
  return (
    <button type="button" className="btn-volver" onClick={onClick} aria-label={label}>
      <img src="/flecha.png" alt="" className="btn-volver__icono" />
    </button>
  );
}
