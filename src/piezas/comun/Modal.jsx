// Modal genérico: fondo oscuro + tarjeta, se cierra al hacer click fuera.
export default function Modal({ title, onClose, children, className = "" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
