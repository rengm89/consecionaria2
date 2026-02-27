import React from "react";

export default function CatalogSection({
  styles,
  catalogMarca,
  catalogModelo,
  marcasDisponibles,
  catalogLoading,
  onCatalogMarcaChange,
  onCatalogModeloChange,
  onAddCatalog
}) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>Catalogo de Marcas y Modelos</h3>

      <div style={styles.formGrid}>
        <div>
          <select className="ui-input" style={styles.input} value={catalogMarca} onChange={onCatalogMarcaChange}>
            <option value="">Selecciona marca existente</option>
            {marcasDisponibles.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            className="ui-input"
            style={{ ...styles.input, marginTop: 8 }}
            placeholder="O escribe una marca nueva"
            value={catalogMarca}
            onChange={onCatalogMarcaChange}
          />
        </div>

        <div>
          <input
            className="ui-input"
            style={styles.input}
            placeholder="Nuevo modelo"
            value={catalogModelo}
            onChange={onCatalogModeloChange}
          />
        </div>
      </div>

      <div style={styles.actionsRow}>
        <button className="ui-button" style={{ ...styles.button, ...styles.secondaryButton }} onClick={onAddCatalog} disabled={catalogLoading}>
          {catalogLoading ? "Guardando..." : "Agregar al catalogo"}
        </button>
      </div>
    </div>
  );
}
