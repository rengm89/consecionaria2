import React from "react";

export default function VehicleSearchSection({
  styles,
  marcasDisponibles,
  marcaBuscar,
  precioMin,
  precioMax,
  sortBy,
  sortOrder,
  searchErrors,
  onMarcaBuscarChange,
  onPrecioMinChange,
  onPrecioMaxChange,
  onSortByChange,
  onSortOrderChange,
  onSearch,
  loadingSearch,
  createButtonStyle,
  renderFieldError
}) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>Consultar Stock</h3>

      <div style={styles.formGrid}>
        <div>
          <select className="ui-input" style={styles.input} value={marcaBuscar} onChange={onMarcaBuscarChange}>
            <option value="Todas">Todas</option>
            {marcasDisponibles.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            className="ui-input"
            style={styles.input}
            type="text"
            inputMode="decimal"
            placeholder="Precio minimo"
            value={precioMin}
            onChange={onPrecioMinChange}
          />
          {renderFieldError(searchErrors.precioMin)}
        </div>

        <div>
          <input
            className="ui-input"
            style={styles.input}
            type="text"
            inputMode="decimal"
            placeholder="Precio maximo"
            value={precioMax}
            onChange={onPrecioMaxChange}
          />
          {renderFieldError(searchErrors.precioMax)}
        </div>

        <div>
          <select className="ui-input" style={styles.input} value={sortBy} onChange={onSortByChange}>
            <option value="createdAt">Mas recientes</option>
            <option value="precio">Precio</option>
            <option value="kilometros">Kilometros</option>
            <option value="marca">Marca</option>
            <option value="modelo">Modelo</option>
          </select>
        </div>

        <div>
          <select className="ui-input" style={styles.input} value={sortOrder} onChange={onSortOrderChange}>
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      <div style={styles.actionsRow}>
        <button className="ui-button" onClick={onSearch} style={createButtonStyle} disabled={loadingSearch}>
          {loadingSearch ? "Buscando..." : "Buscar"}
        </button>
      </div>
    </div>
  );
}
