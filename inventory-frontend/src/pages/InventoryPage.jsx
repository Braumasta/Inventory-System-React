import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";
import { fetchItems, createItem, updateItem, deleteItem } from "../api";

const initialColumns = [
  "Image",
  "SKU",
  "Name",
  "Category",
  "Quantity",
  "Location",
  "Price",
];

const initialRows = [
  {
    SKU: "SKU-001",
    Name: "USB-C Cable",
    Category: "Accessories",
    Quantity: 120,
    Location: "Aisle 1",
    Price: 12.5,
    Image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=320&q=60",
  },
  {
    SKU: "SKU-002",
    Name: "Wireless Mouse",
    Category: "Peripherals",
    Quantity: 45,
    Location: "Aisle 2",
    Price: 29.9,
    Image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=320&q=60",
  },
  {
    SKU: "SKU-003",
    Name: "Laptop Stand",
    Category: "Accessories",
    Quantity: 30,
    Location: "Aisle 3",
    Price: 54.0,
    Image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=320&q=60",
  },
];

const taxRate = 0.08;
const STORE_LIST_KEY = "inventory-store-list";
const SELECTED_STORE_KEY = "inventory-selected-store";

const mapApiItemToRow = (item) => ({
  Id: item.id,
  SKU: item.sku || "",
  Name: item.name || "",
  Category: item.category || "",
  Quantity: Number(item.quantity) || 0,
  Location: item.location || "",
  Price: Number(item.price) || 0,
  Image: item.imageUrl || "",
});

const mapRowToApiPayload = (row) => ({
  sku: row.SKU || null,
  name: row.Name || "",
  category: row.Category || null,
  quantity: Number(row.Quantity) || 0,
  location: row.Location || null,
  price: Number(row.Price) || 0,
  imageUrl: row.Image || null,
});

const makeDefaultStore = (id, name) => ({
  id,
  name,
  columns: initialColumns,
  columnNotes: {},
  rows: initialRows,
  logEntries: [],
  historyEntries: [],
});

const loadStoreData = (storeId) => {
  try {
    const raw = localStorage.getItem(`inventory-store-${storeId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    // ignore
  }
  return null;
};

const saveStoreData = (storeId, data) => {
  try {
    localStorage.setItem(`inventory-store-${storeId}`, JSON.stringify(data));
  } catch (err) {
    // ignore
  }
};

const InventoryPage = ({ user }) => {
  // TEMP: allow employees to act as admin for testing; revert when RBAC is restored.
  const isAdmin = user?.role === "admin" || user?.role === "employee";
  const displayName = user?.name || "User";

  const [storeList, setStoreList] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState("");

  const [columns, setColumns] = useState(initialColumns);
  const [columnNotes, setColumnNotes] = useState({});
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnNote, setNewColumnNote] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("search");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceCeiling, setPriceCeiling] = useState(100);
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualQuantity, setManualQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [logEntries, setLogEntries] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newProductSku, setNewProductSku] = useState("");
  const [dirty, setDirty] = useState(false);

  const refreshItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setRows(data.map(mapApiItemToRow));
      setDirty(false);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex, columnKey, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = {
        ...next[rowIndex],
        [columnKey]:
          columnKey === "Quantity" || columnKey === "Price"
            ? Number(value) || 0
            : value,
      };
      return next;
    });
    setDirty(true);
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (columns.includes(trimmed)) {
      setNewColumnName("");
      setNewColumnNote("");
      return;
    }

    setColumns((prev) => [...prev, trimmed]);
    setColumnNotes((prev) => ({ ...prev, [trimmed]: newColumnNote.trim() }));
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        [trimmed]: "",
      }))
    );
    addHistoryEntry("Add column", { column: trimmed, note: newColumnNote.trim() });
    setDirty(true);
    setNewColumnName("");
    setNewColumnNote("");
  };

  useEffect(() => {
    // Load stores list and selected store
    let list = [];
    try {
      const rawList = localStorage.getItem(STORE_LIST_KEY);
      if (rawList) list = JSON.parse(rawList);
    } catch (err) {
      list = [];
    }

    if (!list.length) {
      const defaultId = `store-${Date.now()}`;
      const defaultStore = makeDefaultStore(defaultId, "Main store");
      list = [{ id: defaultId, name: "Main store" }];
      saveStoreData(defaultId, defaultStore);
      localStorage.setItem(STORE_LIST_KEY, JSON.stringify(list));
      localStorage.setItem(SELECTED_STORE_KEY, defaultId);
    }

    const storedSelected =
      localStorage.getItem(SELECTED_STORE_KEY) || list[0].id;

    setStoreList(list);
    setCurrentStoreId(storedSelected);

    // Load selected store data
    const storeData = loadStoreData(storedSelected) || makeDefaultStore(storedSelected, "Main store");
    setColumns(storeData.columns || initialColumns);
    setColumnNotes(storeData.columnNotes || {});
    setRows(storeData.rows || initialRows);
    setLogEntries(storeData.logEntries || []);
    setHistoryEntries(storeData.historyEntries || []);

    // Fetch from API
    refreshItems();
  }, []);

  useEffect(() => {
    if (storeList.length) {
      localStorage.setItem(STORE_LIST_KEY, JSON.stringify(storeList));
    }
  }, [storeList]);

  const addHistoryEntry = (action, payload = {}) => {
    const entry = {
      id: `INV-${Date.now().toString().slice(-8)}`,
      timestamp: new Date().toISOString(),
      action,
      ...payload,
    };
    setHistoryEntries((prev) => [...prev, entry]);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const normalizedSearch = search.toLowerCase();
      if (filterType === "category") {
        return (
          categoryFilter === "all" ||
          (row.Category || "").toLowerCase() === categoryFilter.toLowerCase()
        );
      }
      if (filterType === "location") {
        return (
          locationFilter === "all" ||
          (row.Location || "").toLowerCase() === locationFilter.toLowerCase()
        );
      }
      if (filterType === "price") {
        return Number(row.Price || 0) <= priceCeiling;
      }
      return Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [rows, search, filterType, categoryFilter, locationFilter, priceCeiling]);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.Category || ""))).filter(Boolean),
    [rows]
  );
  const locations = useMemo(
    () => Array.from(new Set(rows.map((r) => r.Location || ""))).filter(Boolean),
    [rows]
  );

  const upsertCartItem = (sku, qty = 1) => {
    const normalized = sku.trim();
    if (!normalized || qty <= 0) return;
    const product = rows.find(
      (item) => (item.SKU || "").toLowerCase() === normalized.toLowerCase()
    );
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.SKU.toLowerCase() === normalized.toLowerCase()
      );
      if (existing) {
        return prev.map((item) =>
          item.SKU.toLowerCase() === normalized.toLowerCase()
            ? { ...item, Quantity: item.Quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          SKU: product.SKU,
          Name: product.Name,
          Price: Number(product.Price) || 0,
          Quantity: qty,
        },
      ];
    });
    setManualBarcode("");
    setManualQuantity(1);
  };

  const handleConfirmPurchase = () => {
    if (cartItems.length === 0) return;
    const purchaseId = `PUR-${Date.now().toString().slice(-8)}`;

    // Update stock quantities
    setRows((prev) =>
      prev.map((row) => {
        const cartItem = cartItems.find(
          (ci) => ci.SKU.toLowerCase() === (row.SKU || "").toLowerCase()
        );
        if (!cartItem) return row;
        const nextQty = Math.max(0, Number(row.Quantity) - cartItem.Quantity);
        return { ...row, Quantity: nextQty };
      })
    );

    // Build totals + log
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.Price || 0) * item.Quantity,
      0
    );
    const discountAmount = Math.min(
      subtotal,
      (subtotal * discountPercent) / 100
    );
    const taxed = Math.max(0, subtotal - discountAmount);
    const tax = taxed * taxRate;
    const total = taxed + tax;

    const timestamp = new Date().toISOString();
    setLogEntries((prev) => [
      ...prev,
      {
        id: purchaseId,
        timestamp,
        items: cartItems,
        subtotal,
        discountPercent,
        discountAmount,
        tax,
        total,
      },
    ]);

    setCartItems([]);
    setDiscountPercent(0);
  };

  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.Price || 0) * item.Quantity,
      0
    );
    const discountAmount = Math.min(
      subtotal,
      (subtotal * discountPercent) / 100
    );
    const taxed = Math.max(0, subtotal - discountAmount);
    const tax = taxed * taxRate;
    const total = taxed + tax;
    return { subtotal, discountAmount, tax, total };
  }, [cartItems, discountPercent]);

  const downloadCsvHref = useMemo(() => {
    if (!logEntries.length) return "";
    const rowsCsv = logEntries.flatMap((entry) => {
      return entry.items.map((item) => ({
        timestamp: entry.timestamp,
        sku: item.SKU,
        name: item.Name,
        quantity: item.Quantity,
        price: item.Price,
        subtotal: entry.subtotal,
        discountPercent: entry.discountPercent,
        discountAmount: entry.discountAmount,
        tax: entry.tax,
        total: entry.total,
      }));
    });

    const headers = [
      "timestamp",
      "sku",
      "name",
      "quantity",
      "price",
      "subtotal",
      "discountPercent",
      "discountAmount",
      "tax",
      "total",
    ];
    const csv = [
      headers.join(","),
      ...rowsCsv.map((row) =>
        headers
          .map((key) => {
            const value = row[key];
            if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? "";
          })
          .join(",")
      ),
    ].join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [logEntries]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const sku = newProductSku.trim();
    if (!sku) return;
    try {
      await createItem({
        sku,
        name: sku,
        quantity: 0,
        price: 0,
        category: "",
        location: "",
        imageUrl: "",
      });
      addHistoryEntry("Add product", { sku });
      setNewProductSku("");
      await refreshItems();
    } catch (err) {
      window.alert(err.message || "Could not add product");
    }
  };

  const handleDeleteProduct = async (item) => {
    if (!item?.Id) return;
    try {
      await deleteItem(item.Id);
      addHistoryEntry("Delete product", { sku: item.SKU });
      await refreshItems();
    } catch (err) {
      window.alert(err.message || "Could not delete product");
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!dirty) {
      window.alert("No new changes to save.");
      setShowSaveModal(false);
      return;
    }
    try {
      for (const row of rows) {
        if (row.Id) {
          await updateItem(row.Id, mapRowToApiPayload(row));
        } else {
          await createItem(mapRowToApiPayload(row));
        }
      }
      addHistoryEntry("Save changes", { count: rows.length });
      await refreshItems();
    } catch (err) {
      window.alert(err.message || "Could not save changes");
    } finally {
      setShowSaveModal(false);
      setDirty(false);
    }
  };

  const handleImageFile = (rowIndex, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        handleCellChange(rowIndex, "Image", result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStoreChange = (id) => {
    setCurrentStoreId(id);
    localStorage.setItem(SELECTED_STORE_KEY, id);
    const data = loadStoreData(id) || makeDefaultStore(id, "New store");
    setColumns(data.columns || initialColumns);
    setColumnNotes(data.columnNotes || {});
    setRows(data.rows || initialRows);
    setLogEntries(data.logEntries || []);
    setHistoryEntries(data.historyEntries || []);
    setDirty(false);
  };

  const handleAddStore = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = (formData.get("store-name") || "").toString().trim();
    if (!name) return;
    const id = `store-${Date.now()}`;
    const updatedList = [...storeList, { id, name }];
    setStoreList(updatedList);
    localStorage.setItem(STORE_LIST_KEY, JSON.stringify(updatedList));
    const newData = makeDefaultStore(id, name);
    saveStoreData(id, newData);
    handleStoreChange(id);
    e.target.reset();
  };

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="inventory-kicker">
            {isAdmin ? "Admin workspace" : "Employee workspace"}
          </p>
          <h1 className="inventory-title">Inventory</h1>
          <p className="inventory-subtitle">
            Welcome, <strong>{displayName}</strong>. You are signed in as{" "}
            <strong>{isAdmin ? "Admin" : "Employee"}</strong>.
          </p>
          <p className="inventory-subtitle">
            {isAdmin
              ? "Adjust structure, add context columns, and filter through stock."
              : "Scan or enter barcodes, update quantities, and review cart before confirming purchases."}
          </p>
          <div className="store-row">
            <div className="store-select">
              <label className="form-label" htmlFor="store-select">Store</label>
              <select
                id="store-select"
                className="form-input"
                value={currentStoreId}
                onChange={(e) => handleStoreChange(e.target.value)}
              >
                {storeList.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <form className="store-add-form" onSubmit={handleAddStore}>
                <label className="form-label" htmlFor="store-name">
                  Add store
                </label>
                <div className="store-add-row">
                  <input
                    id="store-name"
                    name="store-name"
                    className="form-input"
                    placeholder="e.g. Uptown Branch"
                  />
                  <button type="submit" className="btn-primary">
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="inventory-header-actions">
          <Link to="/purchase-history" className="btn-ghost inventory-history-link">
            Purchase history
          </Link>
          <Link to="/inventory-history" className="btn-ghost inventory-history-link">
            Inventory history
          </Link>
        </div>
      </header>

      {error && <div className="alert error">Failed to load items: {error}</div>}
      {loading && <div className="alert info">Loading items...</div>}

      <section className="inventory-shell card">
        <div className="inventory-toolbar">
          <div className="inventory-search">
            <label className="form-label" htmlFor="search">Search</label>
            <input
              id="search"
              className="form-input"
              placeholder="Search by SKU, name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={filterType !== "search"}
            />
          </div>
          <div className="inventory-filter-type">
            <label className="form-label" htmlFor="filter-type">Filter type</label>
            <select
              id="filter-type"
              className="form-input"
              value={filterType}
              onChange={(e) => {
                const next = e.target.value;
                setFilterType(next);
                setSearch("");
                setCategoryFilter("all");
                setLocationFilter("all");
              }}
            >
              <option value="search">Search</option>
              <option value="category">Category</option>
              <option value="location">Location</option>
              <option value="price">Price (&lt;=)</option>
            </select>
          </div>
          <div className="inventory-filters">
            {filterType === "category" && (
              <div>
                <label className="form-label" htmlFor="category-filter">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="form-input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {filterType === "location" && (
              <div>
                <label className="form-label" htmlFor="location-filter">
                  Location
                </label>
                <select
                  id="location-filter"
                  className="form-input"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {filterType === "price" && (
              <div className="price-filter">
                <label className="form-label" htmlFor="price-filter">
                  Price ceiling (${priceCeiling})
                </label>
                <input
                  id="price-filter"
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  value={priceCeiling}
                  onChange={(e) => setPriceCeiling(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          {(filterType !== "search" ||
            search ||
            filterType === "price") && (
            <div className="active-filter">
              <span>Active filter: </span>
              <span className="chip chip-active">
                {filterType === "search" && (search || "Search")}
                {filterType === "category" && `Category: ${categoryFilter}`}
                {filterType === "location" && `Location: ${locationFilter}`}
                {filterType === "price" && `Price <= $${priceCeiling}`}
                <button
                  className="chip-close"
                  onClick={() => {
                    setFilterType("search");
                    setSearch("");
                    setCategoryFilter("all");
                    setLocationFilter("all");
                  }}
                  aria-label="Clear filter"
                >
                  ×
                </button>
              </span>
            </div>
          )}
          {isAdmin && (
            <form className="inventory-add-column" onSubmit={handleAddColumn}>
              <div className="inventory-add-column-row">
                <div className="inventory-add-column-field">
                  <label className="form-label" htmlFor="new-column-name">
                    Add column
                  </label>
                  <input
                    id="new-column-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Supplier, Batch, Expiry date"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                </div>
                <div className="inventory-add-column-field">
                  <label className="form-label" htmlFor="new-column-note">
                    Context (optional)
                  </label>
                  <input
                    id="new-column-note"
                    type="text"
                    className="form-input"
                    placeholder="How this column should be used"
                    value={newColumnNote}
                    onChange={(e) => setNewColumnNote(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </div>
              <p className="inventory-note">
                Stored in the UI only for now; persist to your backend later.
              </p>
            </form>
          )}
        </div>

        <div className="inventory-grid single-column">
          <section className="inventory-card glass-card">
            <div className="inventory-card-header">
              <div>
                <h3>Inventory table</h3>
                <p className="inventory-card-subtitle">
                  Edit quantities inline. Admins can edit all fields; employees are
                  limited to quantities.
                </p>
              </div>
            </div>
            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>
                        <div className="th-stack">
                          <span>{col}</span>
                          {columnNotes[col] && (
                            <small className="th-note">{columnNotes[col]}</small>
                          )}
                        </div>
                      </th>
                    ))}
                    {isAdmin && <th className="actions-header">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col) => {
                        const value = row[col] ?? "";
                        const isQuantity = col === "Quantity";
                        const isPrice = col === "Price";
                        const isImage = col === "Image";

                        if (isImage) {
                          return (
                            <td key={col} data-label={col}>
                              {value ? (
                                <label className="thumb-upload-button">
                                  <img
                                    src={value}
                                    alt={row.Name || "Product image"}
                                    className="inventory-thumb"
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageFile(
                                        rowIndex,
                                        e.target.files?.[0] || null
                                      )
                                    }
                                    style={{ display: "none" }}
                                  />
                                </label>
                              ) : (
                                <label className="inventory-thumb placeholder upload-thumb">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageFile(rowIndex, e.target.files?.[0] || null)
                                    }
                                    style={{ display: "none" }}
                                  />
                                  <span className="upload-hint">Upload</span>
                                </label>
                              )}
                            </td>
                          );
                        }

                        if (isQuantity || isPrice || isAdmin) {
                          return (
                            <td key={col} data-label={col}>
                              <input
                                type={isQuantity || isPrice ? "number" : "text"}
                                className="inventory-input"
                                value={value}
                                onChange={(e) =>
                                  handleCellChange(rowIndex, col, e.target.value)
                                }
                                min={isQuantity ? 0 : undefined}
                                step={isPrice ? "0.01" : undefined}
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={col} data-label={col}>
                            {isPrice ? `$${Number(value || 0).toFixed(2)}` : value}
                          </td>
                        );
                      })}
                      {isAdmin && (
                        <td className="actions-cell" data-label="Actions">
                          <button
                            type="button"
                            className="inline-remove"
                            onClick={() => setShowDeleteModal({ Id: row.Id, SKU: row.SKU })}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isAdmin && (
              <div className="inventory-actions-row save-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowSaveModal(true)}
                >
                  Save changes
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="inventory-grid actions-grid">
          <section className="inventory-card glass-card desktop-only">
            <div className="inventory-card-header">
              <div>
                <h3>Barcode & manual entry</h3>
                <p className="inventory-card-subtitle">
                  Scan with a reader or type a barcode/SKU. Add it to the cart and
                  adjust quantity before confirming.
                </p>
              </div>
            </div>
            <div className="inventory-actions">
              <div className="inventory-input-row">
                <label className="form-label" htmlFor="manual-barcode">
                  Barcode / SKU
                </label>
                <input
                  id="manual-barcode"
                  className="form-input"
                  placeholder="e.g. SKU-002"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                />
              </div>
              <div className="inventory-input-row">
                <label className="form-label" htmlFor="manual-qty">
                  Quantity to add
                </label>
                <input
                  id="manual-qty"
                  className="form-input"
                  type="number"
                  min="1"
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(Number(e.target.value) || 1)}
                />
              </div>
              <div className="inventory-actions-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => upsertCartItem(manualBarcode, manualQuantity)}
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setManualBarcode("");
                    setManualQuantity(1);
                  }}
                >
                  Clear
                </button>
              </div>
              <p className="inventory-note">
                Employees: use manual entry if a barcode reader isn&apos;t available.
                Admins: use this to simulate pick/pack flows.
              </p>
            </div>
          </section>

          <section className="inventory-card glass-card desktop-only">
            <div className="inventory-card-header">
              <div>
                <h3>Cart & totals</h3>
                <p className="inventory-card-subtitle">
                  Review items before posting. Confirm purchase decrements stock and logs to CSV-friendly history.
                </p>
              </div>
            </div>
            <div className="cart-list">
              {cartItems.length === 0 && (
                <div className="cart-empty">Cart is empty.</div>
              )}
              {cartItems.map((item) => (
                <div key={item.SKU} className="cart-item">
                  <div className="cart-item-main">
                    <div className="cart-item-name">
                      {item.Name} <span className="cart-item-sku">({item.SKU})</span>
                    </div>
                    <div className="cart-item-price">
                      ${Number(item.Price || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="cart-item-controls cart-actions-row">
                    <div className="cart-qty inline">
                      <label className="form-label" htmlFor={`qty-${item.SKU}`}>
                        Qty
                      </label>
                      <div className="cart-qty-row">
                        <input
                          id={`qty-${item.SKU}`}
                          type="number"
                          min="1"
                          className="form-input"
                          value={item.Quantity}
                          onChange={(e) =>
                            setCartItems((prev) =>
                              prev.map((row) =>
                                row.SKU === item.SKU
                                  ? {
                                      ...row,
                                      Quantity: Math.max(1, Number(e.target.value) || 1),
                                    }
                                  : row
                              )
                            )
                          }
                        />
                        <button
                          className="inline-remove"
                          onClick={() =>
                            setCartItems((prev) =>
                              prev.filter((row) => row.SKU !== item.SKU)
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-row">
                <span>Subtotal</span>
                <strong>${cartTotals.subtotal.toFixed(2)}</strong>
              </div>
              <div className="cart-row">
                <span>Discount</span>
                <div className="discount-control">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    value={discountPercent}
                    onChange={(e) =>
                      setDiscountPercent(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                  />
                  <span>%</span>
                </div>
                <strong>-${cartTotals.discountAmount.toFixed(2)}</strong>
              </div>
              <div className="cart-row">
                <span>Tax ({Math.round(taxRate * 100)}%)</span>
                <strong>${cartTotals.tax.toFixed(2)}</strong>
              </div>
              <div className="cart-row total">
                <span>Total</span>
                <strong>${cartTotals.total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="cart-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={handleConfirmPurchase}
                disabled={cartItems.length === 0}
              >
                Confirm purchase & update stock
              </button>
              <button
                className="btn-ghost"
                type="button"
                disabled={!downloadCsvHref}
                onClick={() => {
                  if (downloadCsvHref) {
                    const link = document.createElement("a");
                    link.href = downloadCsvHref;
                    link.download = "inventory-log.csv";
                    link.click();
                  }
                }}
              >
                Download log (CSV)
              </button>
            </div>
          </section>
        </div>

        {isAdmin && (
          <section className="inventory-card glass-card add-product-card">
            <div className="inventory-card-header">
              <div>
                <h3>Add product</h3>
                <p className="inventory-card-subtitle">
                  Add a SKU to start tracking it. Fill remaining fields and images later.
                </p>
              </div>
            </div>
            <form className="inventory-add-product" onSubmit={handleAddProduct}>
              <input
                className="form-input"
                placeholder="SKU (e.g. SKU-010)"
                value={newProductSku}
                onChange={(e) => setNewProductSku(e.target.value)}
              />
              <button className="btn-primary" type="submit">
                Add product
              </button>
            </form>
          </section>
        )}

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h4>Delete product</h4>
              <p>Are you sure you want to remove {showDeleteModal.SKU} from inventory?</p>
              <div className="modal-actions">
                <button
                  className="btn-ghost"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary danger"
                  onClick={() => handleDeleteProduct(showDeleteModal)}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h4>Save changes</h4>
              <p>Confirm saving current inventory edits?</p>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setShowSaveModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveChanges}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default InventoryPage;
