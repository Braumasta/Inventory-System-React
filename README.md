# InventorySphere – Admin & Employee Inventory Management System

InventorySphere is a modern React-based inventory management dashboard designed for organizations to track stock, employees, user access, analytics, and real‑time scan activity.  
The system includes an Admin Dashboard, Employee Inventory Access, Dynamic UI Components, and Support for Theming (Light/Dark Mode).

---

## 🚀 Features

### 🔐 User Roles
- **Admin**
  - Full access to inventory
  - Can add new inventory columns
  - Can manage user access (add users by unique ID)
  - Can view analytics, live scan feed, active employees, and newly added items
- **Employee**
  - Restricted to scanning barcodes and updating item quantities
  - Limited inventory view

---

## 📦 Admin Dashboard

The Admin Dashboard includes:

### **1. Live Scan Feed**
Real-time placeholder logs showing:
- Scanned items  
- Quantity updates  
- Processed orders  

### **2. Inventory Preview**
Compact table showing:
- SKU  
- Item name  
- Location  
- Quantity  
- Stock status  

Includes a button to navigate to full inventory workspace.

### **3. Active Employees**
Shows:
- Online/Offline status
- Role (Admin/Employee)
- Clean placeholder UI integrating with site theme

### **4. Added in the Last 7 Days**
Displays newly added items with:
- Name  
- SKU  
- Time added  

### **5. Analytics Overview**
Includes:
- Total SKUs  
- Low-stock count  
- Daily processed items  
- Mini bar chart placeholders  

### **6. User Access Management**
Admins can:
- Add new users by unique ID  
- Assign roles (Admin/Employee)  
- View pending access requests  

---

## 🧩 Technologies Used

- **React.js**
- **React Router**
- **CSS3 with custom theme system**
- **Dark & Light UI support**
- **Modular component-based architecture**

---

## 📁 Folder Structure

```
src/
│
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── AdminDashboard.jsx
│   ├── Inventory.jsx
│   └── ...
│
├── styles/
│   ├── index.css
│   ├── Footer.css
│   ├── AdminDashboard.css
│   └── ...
│
├── App.js
├── index.js
└── ...
```

---

## 🌙 Theming

This project supports **light and dark modes** using CSS variables:

```css
:root {
  --bg: #f5f5f7;
  --text: #111827;
}
[data-theme="dark"] {
  --bg: #020617;
  --text: #e5e7eb;
}
```

---

## 🔧 Installation & Setup

1. Clone repository  
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm start
```

---

## 📌 Future Enhancements

- Full backend integration  
- Real database-driven authentication  
- Real barcode scanning API  
- Inventory forecasting analytics  
- Multi-organization support  

---

## 📝 License
This is a university project and is free for educational use.

---

## 👤 Author
Mohammed Zaytoun  
InventorySphere Project  
2025
