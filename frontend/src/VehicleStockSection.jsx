import React from "react";
import VehicleCard from "./VehicleCard.jsx";

export default function VehicleStockSection({
  styles,
  hasSearched,
  vehiculos,
  currentPage,
  totalPages,
  totalItems,
  editId,
  editData,
  setEditId,
  setEditData,
  onSave,
  onDelete,
  savingId,
  deletingId,
  loadingSearch,
  onPrevPage,
  onNextPage,
  createButtonStyle,
  neutralButtonStyle
}) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>Unidades en Stock</h3>

      {!hasSearched ? (
        <div style={styles.emptyState}>Ejecuta una busqueda para ver resultados.</div>
      ) : vehiculos.length === 0 ? (
        <div style={styles.emptyState}>No hay vehiculos para mostrar.</div>
      ) : (
        <>
          <div style={styles.paginationMeta}>
            <span>
              Mostrando pagina {currentPage} de {totalPages}
            </span>
            <span>Total: {totalItems}</span>
          </div>

          <div style={styles.grid}>
            {vehiculos.map((v) => (
              <VehicleCard
                key={v._id}
                vehiculo={v}
                editId={editId}
                editData={editData}
                setEditId={setEditId}
                setEditData={setEditData}
                onSave={onSave}
                onDelete={onDelete}
                loading={savingId === v._id || deletingId === v._id}
                isSaving={savingId === v._id}
                isDeleting={deletingId === v._id}
              />
            ))}
          </div>

          <div style={styles.paginationControls}>
            <button className="ui-button" onClick={onPrevPage} style={neutralButtonStyle} disabled={loadingSearch || currentPage <= 1}>
              Anterior
            </button>
            <button className="ui-button" onClick={onNextPage} style={createButtonStyle} disabled={loadingSearch || currentPage >= totalPages}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
