import React from 'react';

const InventoryPage = ({ user }) => {
  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Inventory</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Signed in as <strong>{user?.name}</strong> ({user?.role})
        </p>
        <p>
          This is a placeholder for the inventory screen. Later we will connect this to your
          Node backend so:
        </p>
        <ul>
          <li>Each user/organization has their own inventory data.</li>
          <li>Employees can view and update quantities (e.g. via barcode scanner).</li>
          <li>Admins can manage structure, columns and settings.</li>
        </ul>
      </section>
    </div>
  );
};

export default InventoryPage;
