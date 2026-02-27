import React from "react";

export default function VehicleCreateSection({
  styles,
  marcasDisponibles,
  modelosDisponibles,
  marca,
  modelo,
  precio,
  kilometros,
  createErrors,
  onMarcaChange,
  onModeloChange,
  onPrecioChange,
  onKilometrosChange,
  onCreate,
  loadingCreate,
  createButtonStyle,
  renderFieldError
}) {
  return (
    <div style={{ ...styles.sectionCard, ...styles.sectionCardWideGap }}>
      <h3 style={styles.sectionTitle}>Ingresar Nueva Unidad</h3>

      <div style={styles.formGrid}>
        <div>
          {marcasDisponibles.length > 0 ? (
            <select className="ui-input" style={styles.input} value={marca} onChange={onMarcaChange}>
              <option value="">Selecciona marca</option>
              {marcasDisponibles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <input className="ui-input" style={styles.input} placeholder="Marca" value={marca} onChange={onMarcaChange} />
          )}
          {renderFieldError(createErrors.marca)}
        </div>

        <div>
          <select
            className="ui-input"
            style={styles.input}
            value={modelo}
            onChange={onModeloChange}
            disabled={!marca || modelosDisponibles.length === 0}
          >
            <option value="">{marca ? "Selecciona modelo" : "Selecciona marca primero"}</option>
            {modelosDisponibles.map((md) => (
              <option key={md} value={md}>
                {md}
              </option>
            ))}
          </select>
          {renderFieldError(createErrors.modelo)}
        </div>

        <div>
          <input
            className="ui-input"
            style={styles.input}
            type="number"
            min="0"
            placeholder="Precio"
            value={precio}
            onChange={onPrecioChange}
          />
          {renderFieldError(createErrors.precio)}
        </div>

        <div>
          <input
            className="ui-input"
            style={styles.input}
            type="number"
            min="0"
            placeholder="Kilometros"
            value={kilometros}
            onChange={onKilometrosChange}
          />
          {renderFieldError(createErrors.kilometros)}
        </div>
      </div>

      <div style={styles.actionsRow}>
        <button className="ui-button" onClick={onCreate} style={createButtonStyle} disabled={loadingCreate}>
          {loadingCreate ? "Procesando..." : "Crear"}
        </button>
      </div>
    </div>
  );
}
