import React, { useState } from 'react';

const mockNewProducts = [
  { name: 'Wireless Mouse Pro', daysAgo: 1, sku: 'WM-9021' },
  { name: 'USB-C Hub 7-in-1', daysAgo: 3, sku: 'HUB-071C' },
  { name: 'Thermal Label Roll', daysAgo: 5, sku: 'LBL-THRML' }
];

const mockColumns = ['SKU', 'Name', 'Category', 'Quantity', 'Min Stock'];
const mockRows = [
  {
    SKU: 'SKU-1001',
    Name: 'HDMI Cable 2m',
    Category: 'Cables',
    Quantity: 84,
    'Min Stock': 20
  },
  {
    SKU: 'SKU-1002',
    Name: 'Barcode Scanner',
    Category: 'Devices',
    Quantity: 15,
    'Min Stock': 5
  },
  {
    SKU: 'SKU-1003',
    Name: 'POS Thermal Printer',
    Category: 'Devices',
    Quantity: 7,
    'Min Stock': 3
  }
];

const AdminDashboard = () => {
  const [columns, setColumns] = useState(mockColumns);
  const [newColumnName, setNewColumnName] = useState('');

  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (!columns.includes(trimmed)) {
      setColumns([...columns, trimmed]);
    }
    setNewColumnName('');
  };

  const handleRemoveColumn = (col) => {
    if (columns.length <= 3) return; // just to avoid empty tables
    setColumns(columns.filter((c) => c !== col));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Admin dashboard</h2>
          <p className="dashboard-tagline">
            Overview of inventory health and quick access to configurable tables.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-ghost">
            + Add new product
          </button>
          <button className="btn-ghost">
            Export CSV
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-grid">
        <div className="card">
          <div className="stats-label">Total products in inventory</div>
          <div className="stats-value">2,340</div>
          <div className="stats-pill">All orgs · example data</div>
        </div>

        <div className="card">
          <div className="stats-label">Low stock items</div>
          <div className="stats-value">18</div>
          <div className="stats-pill">Auto notifications enabled</div>
        </div>

        <div className="card">
          <div className="stats-label">New products (last 7 days)</div>
          <div className="stats-value">{mockNewProducts.length}</div>
          <div className="stats-pill">Synced to all dashboards</div>
        </div>
      </section>

      {/* New products + table */}
      <section className="dashboard-grid">
        {/* New products list */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>
            Newly added (last 7 days)
          </h3>
          <ul className="new-products-list">
            {mockNewProducts.map((item) => (
              <li key={item.sku} className="new-product-item">
                <div className="new-product-name">{item.name}</div>
                <div className="new-product-meta">
                  {item.daysAgo} day{item.daysAgo !== 1 && 's'} ago · {item.sku}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Inventory table */}
        <div className="card">
          <div style={{ marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Inventory manager table</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Admin-configurable columns (frontend demo)
            </span>
          </div>

          <div className="table-controls">
            <input
              type="text"
              placeholder="New column name (e.g. Supplier)"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAddColumn}>
              Add column
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Click a column name to remove it (for demo only).
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleRemoveColumn(col)}
                      style={{ cursor: 'pointer' }}
                      title="Click to remove column (demo)"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRows.map((row) => (
                  <tr key={row.SKU}>
                    {columns.map((col) => (
                      <td key={col}>
                        {row[col] !== undefined ? row[col] : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Later, this table will be fully synced with your Node backend and database. Admins will define
            custom columns that are stored in the DB and applied per organization.
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
