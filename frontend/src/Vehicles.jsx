import React, { useEffect, useState } from "react";
import VehicleCreateSection from "./VehicleCreateSection.jsx";
import VehicleSearchSection from "./VehicleSearchSection.jsx";
import VehicleStockSection from "./VehicleStockSection.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import CatalogSection from "./CatalogSection.jsx";
import * as styles from "./Vehicles.styles.js";

const API = "http://localhost:3001/api";
const DEFAULT_PAGE_SIZE = 9;

const parsePriceInput = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const createEmptyCreateErrors = () => ({
  marca: "",
  modelo: "",
  precio: "",
  kilometros: ""
});

const createEmptySearchErrors = () => ({
  precioMin: "",
  precioMax: ""
});

export default function VehicleManager({ token }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [modelosDisponibles, setModelosDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precio, setPrecio] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [catalogMarca, setCatalogMarca] = useState("");
  const [catalogModelo, setCatalogModelo] = useState("");

  const [marcaBuscar, setMarcaBuscar] = useState("Todas");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ precio: "", kilometros: "" });

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    vehicleId: null
  });

  const [createErrors, setCreateErrors] = useState(createEmptyCreateErrors);
  const [searchErrors, setSearchErrors] = useState(createEmptySearchErrors);

  useEffect(() => {
    cargarMarcas();
  }, []);

  useEffect(() => {
    cargarModelosPorMarca(marca);
  }, [marca]);

  useEffect(() => {
    fetchVehiculos({ targetPage: 1 });
  }, []);

  useEffect(() => {
    if (!confirmDialog.open) return;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (savingId || deletingId) return;
      cerrarConfirmacion();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmDialog.open, savingId, deletingId]);

  const flashSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 2200);
  };

  const cargarMarcas = async () => {
    try {
      const res = await fetch(`${API}/catalogo/marcas`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar las marcas");
      const marcasCatalogo = Array.isArray(data) ? data : [];
      if (marcasCatalogo.length > 0) {
        setMarcasDisponibles(marcasCatalogo);
        return;
      }

      const fallbackRes = await fetch(`${API}/vehiculos/marcas`);
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok) throw new Error(fallbackData.error || "No se pudieron cargar las marcas");
      setMarcasDisponibles(Array.isArray(fallbackData) ? fallbackData : []);
    } catch (e) {
      setError(e.message);
    }
  };

  const cargarModelosPorMarca = async (marcaSeleccionada) => {
    if (!marcaSeleccionada) {
      setModelosDisponibles([]);
      setModelo("");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("marca", marcaSeleccionada);
      const res = await fetch(`${API}/catalogo/modelos?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los modelos");
      const modelosCatalogo = Array.isArray(data) ? data : [];
      if (modelosCatalogo.length > 0) {
        setModelosDisponibles(modelosCatalogo);
        setModelo("");
        return;
      }

      const fallbackRes = await fetch(`${API}/vehiculos/modelos?${params.toString()}`);
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok) throw new Error(fallbackData.error || "No se pudieron cargar los modelos");
      setModelosDisponibles(Array.isArray(fallbackData) ? fallbackData : []);
      setModelo("");
    } catch (e) {
      setModelosDisponibles([]);
      setModelo("");
      setError(e.message);
    }
  };

  const validateCreateForm = () => {
    const nextErrors = createEmptyCreateErrors();
    if (!marca.trim()) nextErrors.marca = "La marca es obligatoria.";
    if (!modelo.trim()) nextErrors.modelo = "El modelo es obligatorio.";

    const precioParsed = Number(precio);
    if (precio === "") {
      nextErrors.precio = "El precio es obligatorio.";
    } else if (Number.isNaN(precioParsed) || precioParsed < 0) {
      nextErrors.precio = "El precio debe ser un numero mayor o igual a 0.";
    }

    const kilometrosParsed = Number(kilometros);
    if (kilometros === "") {
      nextErrors.kilometros = "Los kilometros son obligatorios.";
    } else if (Number.isNaN(kilometrosParsed) || kilometrosParsed < 0) {
      nextErrors.kilometros = "Los kilometros deben ser un numero mayor o igual a 0.";
    }

    setCreateErrors(nextErrors);
    return { ok: Object.values(nextErrors).every((v) => !v), precioParsed, kilometrosParsed };
  };

  const validateSearchFilters = () => {
    const nextSearchErrors = createEmptySearchErrors();
    const min = parsePriceInput(precioMin);
    const max = parsePriceInput(precioMax);

    if (Number.isNaN(min)) nextSearchErrors.precioMin = "Ingresa un precio minimo valido.";
    if (Number.isNaN(max)) nextSearchErrors.precioMax = "Ingresa un precio maximo valido.";
    if (min !== null && min < 0) nextSearchErrors.precioMin = "El precio minimo debe ser >= 0.";
    if (max !== null && max < 0) nextSearchErrors.precioMax = "El precio maximo debe ser >= 0.";
    if (min !== null && max !== null && min > max) {
      nextSearchErrors.precioMin = "El minimo no puede ser mayor al maximo.";
      nextSearchErrors.precioMax = "El maximo no puede ser menor al minimo.";
    }

    setSearchErrors(nextSearchErrors);
    return { ok: !Object.values(nextSearchErrors).some(Boolean), min, max };
  };

  const fetchVehiculos = async ({ targetPage = 1, sortByOverride, sortOrderOverride } = {}) => {
    const validation = validateSearchFilters();
    if (!validation.ok) return;

    setError("");
    setLoadingSearch(true);

    try {
      const resolvedSortBy = sortByOverride || sortBy;
      const resolvedSortOrder = sortOrderOverride || sortOrder;
      const params = new URLSearchParams();
      if (marcaBuscar !== "Todas") params.append("marca", marcaBuscar);
      if (validation.min !== null) params.append("precioMin", String(validation.min));
      if (validation.max !== null) params.append("precioMax", String(validation.max));
      params.append("page", String(targetPage));
      params.append("limit", String(DEFAULT_PAGE_SIZE));
      params.append("sortBy", resolvedSortBy);
      params.append("sortOrder", resolvedSortOrder);

      const res = await fetch(`${API}/vehiculos?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo buscar");

      const items = Array.isArray(data.items) ? data.items : [];
      const pagination = data.pagination || {};
      setVehiculos(items);
      setCurrentPage(pagination.page || targetPage);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setHasSearched(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const crearVehiculo = async () => {
    setError("");
    const validation = validateCreateForm();
    if (!validation.ok) return;

    setLoadingCreate(true);
    try {
      const res = await fetch(`${API}/vehiculos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          marca: marca.trim(),
          modelo: modelo.trim(),
          precio: validation.precioParsed,
          kilometros: validation.kilometrosParsed
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear");
      setMarca("");
      setModelo("");
      setPrecio("");
      setKilometros("");
      setCreateErrors(createEmptyCreateErrors());
      flashSuccess("Vehiculo creado correctamente.");

      if (hasSearched) await fetchVehiculos({ targetPage: 1 });
      await cargarMarcas();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const agregarCatalogo = async () => {
    const marcaNueva = String(catalogMarca || "").trim();
    const modeloNuevo = String(catalogModelo || "").trim();

    if (!marcaNueva || !modeloNuevo) {
      setError("Completa marca y modelo para agregar al catalogo.");
      return;
    }

    setError("");
    setLoadingCatalog(true);
    try {
      const res = await fetch(`${API}/catalogo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ marca: marcaNueva, modelo: modeloNuevo })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo agregar al catalogo");

      setCatalogMarca("");
      setCatalogModelo("");
      flashSuccess("Marca/modelo agregados al catalogo.");
      await cargarMarcas();
      if (marca === marcaNueva) {
        await cargarModelosPorMarca(marcaNueva);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const eliminarVehiculo = async (id) => {
    setError("");
    setDeletingId(id);

    try {
      const res = await fetch(`${API}/vehiculos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");
      flashSuccess("Vehiculo eliminado.");

      if (hasSearched) {
        const fallbackPage = vehiculos.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        await fetchVehiculos({ targetPage: fallbackPage });
      } else {
        setVehiculos((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const guardarEdicion = async (id) => {
    setError("");
    const precioParsed = Number(editData.precio);
    const kilometrosParsed = Number(editData.kilometros);

    if (
      editData.precio === "" ||
      editData.kilometros === "" ||
      Number.isNaN(precioParsed) ||
      Number.isNaN(kilometrosParsed) ||
      precioParsed < 0 ||
      kilometrosParsed < 0
    ) {
      setError("Precio y kilometros deben ser numeros validos (>= 0).");
      return;
    }

    setSavingId(id);
    try {
      const res = await fetch(`${API}/vehiculos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ precio: precioParsed, kilometros: kilometrosParsed })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la edicion");

      setVehiculos((prev) => prev.map((v) => (v._id === id ? data : v)));
      setEditId(null);
      setEditData({ precio: "", kilometros: "" });
      flashSuccess("Cambios guardados.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const abrirConfirmacion = (action, vehicleId) => {
    setConfirmDialog({ open: true, action, vehicleId });
  };

  const cerrarConfirmacion = () => {
    setConfirmDialog({ open: false, action: null, vehicleId: null });
  };

  const solicitarEliminarVehiculo = (id) => abrirConfirmacion("delete", id);

  const solicitarGuardarEdicion = (id) => {
    const precioParsed = Number(editData.precio);
    const kilometrosParsed = Number(editData.kilometros);
    if (
      editData.precio === "" ||
      editData.kilometros === "" ||
      Number.isNaN(precioParsed) ||
      Number.isNaN(kilometrosParsed) ||
      precioParsed < 0 ||
      kilometrosParsed < 0
    ) {
      setError("Precio y kilometros deben ser numeros validos (>= 0).");
      return;
    }
    abrirConfirmacion("save", id);
  };

  const confirmarAccion = async () => {
    if (!confirmDialog.vehicleId) return;
    const { action, vehicleId } = confirmDialog;
    cerrarConfirmacion();
    if (action === "delete") await eliminarVehiculo(vehicleId);
    if (action === "save") await guardarEdicion(vehicleId);
  };

  const handleChangeSortBy = async (event) => {
    const nextSortBy = event.target.value;
    setSortBy(nextSortBy);
    if (!hasSearched) return;
    await fetchVehiculos({ targetPage: 1, sortByOverride: nextSortBy });
  };

  const handleChangeSortOrder = async (event) => {
    const nextSortOrder = event.target.value;
    setSortOrder(nextSortOrder);
    if (!hasSearched) return;
    await fetchVehiculos({ targetPage: 1, sortOrderOverride: nextSortOrder });
  };

  const renderFieldError = (message) => (message ? <div style={styles.fieldError}>{message}</div> : null);

  const createButtonStyle = {
    ...styles.button,
    ...styles.primaryButton,
    ...(loadingCreate ? styles.disabledButton : null)
  };

  const neutralButtonStyle = {
    ...styles.button,
    ...styles.secondaryButton,
    ...(loadingSearch ? styles.disabledButton : null)
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Gestión de Unidades</h2>
      {error && <p style={styles.statusError}>{error}</p>}
      {successMsg && <p style={styles.statusSuccess}>{successMsg}</p>}

      <VehicleCreateSection
        styles={styles}
        marcasDisponibles={marcasDisponibles}
        modelosDisponibles={modelosDisponibles}
        marca={marca}
        modelo={modelo}
        precio={precio}
        kilometros={kilometros}
        createErrors={createErrors}
        onMarcaChange={(event) => {
          setMarca(event.target.value);
          if (createErrors.marca) setCreateErrors((prev) => ({ ...prev, marca: "" }));
        }}
        onModeloChange={(event) => {
          setModelo(event.target.value);
          if (createErrors.modelo) setCreateErrors((prev) => ({ ...prev, modelo: "" }));
        }}
        onPrecioChange={(event) => {
          setPrecio(event.target.value);
          if (createErrors.precio) setCreateErrors((prev) => ({ ...prev, precio: "" }));
        }}
        onKilometrosChange={(event) => {
          setKilometros(event.target.value);
          if (createErrors.kilometros) setCreateErrors((prev) => ({ ...prev, kilometros: "" }));
        }}
        onCreate={crearVehiculo}
        loadingCreate={loadingCreate}
        createButtonStyle={createButtonStyle}
        renderFieldError={renderFieldError}
      />

      <VehicleSearchSection
        styles={styles}
        marcasDisponibles={marcasDisponibles}
        marcaBuscar={marcaBuscar}
        precioMin={precioMin}
        precioMax={precioMax}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchErrors={searchErrors}
        onMarcaBuscarChange={(event) => setMarcaBuscar(event.target.value)}
        onPrecioMinChange={(event) => {
          setPrecioMin(event.target.value);
          if (searchErrors.precioMin) setSearchErrors((prev) => ({ ...prev, precioMin: "" }));
        }}
        onPrecioMaxChange={(event) => {
          setPrecioMax(event.target.value);
          if (searchErrors.precioMax) setSearchErrors((prev) => ({ ...prev, precioMax: "" }));
        }}
        onSortByChange={handleChangeSortBy}
        onSortOrderChange={handleChangeSortOrder}
        onSearch={() => fetchVehiculos({ targetPage: 1 })}
        loadingSearch={loadingSearch}
        createButtonStyle={createButtonStyle}
        renderFieldError={renderFieldError}
      />

      <CatalogSection
        styles={styles}
        catalogMarca={catalogMarca}
        catalogModelo={catalogModelo}
        marcasDisponibles={marcasDisponibles}
        catalogLoading={loadingCatalog}
        onCatalogMarcaChange={(event) => setCatalogMarca(event.target.value)}
        onCatalogModeloChange={(event) => setCatalogModelo(event.target.value)}
        onAddCatalog={agregarCatalogo}
      />

      <VehicleStockSection
        styles={styles}
        hasSearched={hasSearched}
        vehiculos={vehiculos}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        editId={editId}
        editData={editData}
        setEditId={setEditId}
        setEditData={setEditData}
        onSave={solicitarGuardarEdicion}
        onDelete={solicitarEliminarVehiculo}
        savingId={savingId}
        deletingId={deletingId}
        loadingSearch={loadingSearch}
        onPrevPage={() => fetchVehiculos({ targetPage: currentPage - 1 })}
        onNextPage={() => fetchVehiculos({ targetPage: currentPage + 1 })}
        createButtonStyle={createButtonStyle}
        neutralButtonStyle={neutralButtonStyle}
      />

      <ConfirmDialog
        styles={styles}
        isOpen={confirmDialog.open}
        action={confirmDialog.action}
        busy={Boolean(savingId || deletingId)}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarAccion}
      />
    </div>
  );
}
