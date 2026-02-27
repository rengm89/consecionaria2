import React from "react";

import * as styles from "./VehicleCard.styles.js";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("es-AR");

export default function VehicleCard({
  vehiculo,
  editId,
  editData,
  setEditId,
  setEditData,
  onSave,
  onDelete,
  loading,
  isSaving,
  isDeleting
}) {
  const isEditing = editId === vehiculo._id;

  return (
    <div
      style={{
        ...styles.card,
        ...(isEditing ? styles.cardEditing : null)
      }}
    >
      {!isEditing && (
        <button
          style={styles.deleteIconButton}
          onClick={() => onDelete(vehiculo._id)}
          disabled={loading}
          aria-label={isDeleting ? "Eliminando vehículo" : "Eliminar vehículo"}
          title={isDeleting ? "Eliminando..." : "Eliminar"}
        >
          {isDeleting ? "..." : "×"}
        </button>
      )}

      <div style={styles.header}>
        <span style={styles.title}>{vehiculo.marca}</span>
        <span style={styles.subtitle}>{vehiculo.modelo}</span>
      </div>

      {isEditing ? (
        <>
          <div style={styles.row}>
            <span style={styles.label}>Precio</span>
            <input
              className="ui-input"
              type="number"
              min="0"
              style={styles.input}
              placeholder="Precio"
              value={editData.precio}
              onChange={(e) =>
                setEditData({ ...editData, precio: e.target.value })
              }
            />
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Kilómetros</span>
            <input
              className="ui-input"
              type="number"
              min="0"
              style={styles.input}
              placeholder="Kilómetros"
              value={editData.kilometros}
              onChange={(e) =>
                setEditData({ ...editData, kilometros: e.target.value })
              }
            />
          </div>

          <div style={styles.actions}>
            <button
              className="ui-button"
              style={{ ...styles.button, ...styles.saveButton }}
              onClick={() => onSave(vehiculo._id)}
              disabled={loading}
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>

            <button
              className="ui-button"
              style={{ ...styles.button, ...styles.cancelButton }}
              onClick={() => setEditId(null)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={styles.row}>
            <span style={styles.label}>Precio</span>
            <span style={styles.value}>{currencyFormatter.format(vehiculo.precio)}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Kilómetros</span>
            <span style={styles.value}>{numberFormatter.format(vehiculo.kilometros)} km</span>
          </div>

          <div style={styles.actions}>
            <button
              className="ui-button"
              style={{ ...styles.button, ...styles.editButton }}
              onClick={() => {
                setEditId(vehiculo._id);
                setEditData({
                  precio: vehiculo.precio,
                  kilometros: vehiculo.kilometros
                });
              }}
              disabled={loading}
            >
              Editar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
