import React, { useState } from 'react';
import '../styles/Dashboard.css';

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

const initialEmployees = [
  { id: 1, name: 'Omar Khalil', email: 'omar@example.com', role: 'employee', status: 'Active' },
  { id: 2, name: 'Sara Nasser', email: 'sara@example.com', role: 'employee', status: 'Active' }
];

const AdminDashboard = () => {
  const [columns, setColumns] = useState(mockColumns);
  const [newColumnName, setNewColumnName] = useState('');

  const [employees, setEmployees] = useState(initialEmployees);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('employee');

  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (!columns.includes(trimmed)) {
      setColumns([...columns, trimmed]);
    }
    setNewColumnName('');
  };

  const handleRemoveColumn = (col) => {
    if (columns.length <= 3) return; // avoid deleting everything
    setColumns(columns.filter((c) => c !== col));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!empName || !empEmail) return;

    const nextId = employees.length ? employees[employees.length - 1].id + 1 : 1;

    const newEmp = {
      id: nextId,
      name: empName,
      email: empEmail,
      role: empRole,
      status: 'Pending',
    };

    setEmployees([...employees, newEmp]);
    setEmpName('');
    setEmpEmail('');
    setEmpRole('employee');

    alert('Employee added (frontend demo). Later this will send a secure invite from the backend.');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Admin dashboard</h2>
          <p className="dashboard-tagline">
            Overview of inventory health and quick access to configuration & team access.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-ghost">+ Add new product</button>
          <button className="btn-ghost">Export CSV</button>
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

      {/* New products + inventory table */}
      <section className="dashboard-grid">
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

        <div className="card">
          <div
            style={{
              marginBottom: '0.6rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ fontSize: '1rem' }}>Inventory manager table</h3>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
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

          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.4rem'
            }}
          >
            Click a column name to remove it (demo only).
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

          <div
            style={{
              marginTop: '0.6rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            Later, this table will be fully synced with your Node backend and database. Admins will
            define custom columns that are stored in the DB and applied per organization.
          </div>
        </div>
      </section>

      {/* Team / employees section */}
      <section className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginTop: 0 }}>Team access & employees</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Admins can add employees who will have controlled access to the inventory. In the real
          system this will be backed by secure APIs, hashed passwords, and role-based permissions.
        </p>

        <div className="dashboard-team-grid">
          {/* Employees list */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Existing employees</h4>
            <div className="table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>{emp.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add employee form */}
          <form onSubmit={handleAddEmployee} style={{ display: 'grid', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Add employee (demo)</h4>
            <div>
              <label className="input-label">Full name</label>
              <input
                className="input-field"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                className="input-field"
                type="email"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                placeholder="employee@example.com"
              />
            </div>
            <div>
              <label className="input-label">Role</label>
              <select
                className="input-field"
                value={empRole}
                onChange={(e) => setEmpRole(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">
              Add employee
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Later this will send a secure invite link or temporary password via the backend, and
              only the admin&apos;s authenticated token will be allowed to create users.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
