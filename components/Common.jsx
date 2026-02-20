// ============================================================
// TOAST COMPONENT
// ============================================================
export const Toast = ({ toast }) => (
  <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
    <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
    {toast.msg}
  </div>
);

// ============================================================
// MODAL
// ============================================================
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
