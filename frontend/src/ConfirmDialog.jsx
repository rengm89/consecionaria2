import React from "react";

export default function ConfirmDialog({
  styles,
  isOpen,
  action,
  busy,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div
      style={styles.modalOverlay}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        if (busy) return;
        onClose();
      }}
    >
      <div style={styles.modalCard} role="dialog" aria-modal="true" aria-label="Confirmar accion">
        <h4 style={styles.modalTitle}>{action === "delete" ? "Confirmar eliminacion" : "Confirmar edicion"}</h4>
        <p style={styles.modalText}>
          {action === "delete"
            ? "Estas por eliminar este vehiculo. Esta accion no se puede deshacer."
            : "Estas por guardar los cambios del vehiculo. Deseas continuar?"}
        </p>
        <div style={styles.modalActions}>
          <button className="ui-button" style={{ ...styles.button, ...styles.secondaryButton }} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            className="ui-button"
            style={{
              ...styles.button,
              ...(action === "delete" ? styles.dangerButton : styles.primaryButton)
            }}
            onClick={onConfirm}
            disabled={busy}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
