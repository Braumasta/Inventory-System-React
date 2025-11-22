import React, { useState } from "react";
import "../styles/Inventory.css"; // optional; will still look OK with global styles if file doesn't exist

const initialColumns = ["SKU", "Name", "Category", "Quantity", "Location"];

const initialRows = [
  {
    SKU: "SKU-001",
    Name: "USB-C Cable",
    Category: "Accessories",
    Quantity: 120,
    Location: "Aisle 1",
  },
  {
    SKU: "SKU-002",
    Name: "Wireless Mouse",
    Category: "Peripherals",
    Quantity: 45,
    Location: "Aisle 2",
  },
  {
    SKU: "SKU-003",
    Name: "Laptop Stand",
    Category: "Accessories",
    Quantity: 30,
    Location: "Aisle 3",
  },
];

const InventoryPage = ({ user }) => {
  const isAdmin = user?.role === "admin";
  const displayName = user?.name || "User";

  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(initialRows);
  const [newColumnName, setNewColumnName] = useState("");

  const handleCellChange = (rowIndex, columnKey, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = {
        ...next[rowIndex],
        [columnKey]: columnKey === "Quantity" ? Number(value) || 0 : value,
      };
      return next;
    });
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (columns.includes(trimmed)) {
      setNewColumnName("");
      return;
    }

    setColumns((prev) => [...prev, trimmed]);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        [trimmed]: "",
      }))
    );
    setNewColumnName("");
  };

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1 className="inventory-title">Inventory</h1>
        <p className="inventory-subtitle">
          Welcome, <strong>{displayName}</strong>. You are signed in as{" "}
          <strong>{isAdmin ? "Admin" : "Employee"}</strong>.
        </p>
        <p className="inventory-subtitle">
          {isAdmin
            ? "You can edit all fields, add columns, and manage the structure of this table."
            : "You can only update quantities (typically driven by barcode scans when a sale or stock movement happens)."}
        </p>
      </header>

      <section className="card inventory-card">
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => {
                    const value = row[col] ?? "";
                    const isQuantity = col === "Quantity";

                    // Quantity is always editable (admin + employee)
                    if (isQuantity) {
                      return (
                        <td key={col}>
                          <input
                            type="number"
                            className="inventory-input"
                            value={value}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                col,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      );
                    }

                    // Other fields: editable only for admin
                    if (isAdmin) {
                      return (
                        <td key={col}>
                          <input
                            type="text"
                            className="inventory-input"
                            value={value}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                col,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      );
                    }

                    // Employee: read-only
                    return <td key={col}>{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <form className="inventory-add-column" onSubmit={handleAddColumn}>
            <label className="form-label" htmlFor="new-column-name">
              Add new column
            </label>
            <div className="inventory-add-column-row">
              <input
                id="new-column-name"
                type="text"
                className="form-input"
                placeholder="e.g. Supplier, Batch, Expiry date"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Add
              </button>
            </div>
            <p className="inventory-note">
              Note: This is currently stored in the UI only. Later, you&apos;ll
              persist these columns and their values in your Node.js backend and
              database.
            </p>
          </form>
        )}
      </section>
    </div>
  );
};

export default InventoryPage;
