# 🖥️ Asset Management System (Frontend)

A React-based frontend application for managing assets, assignments, and support tickets.
This system provides separate dashboards for **Admin** and **Employee** roles.

---

## 🚀 Features

### 👨‍💼 Admin

* Manage assets (Add, Update, Delete)
* Assign assets to employees
* Update ticket status
* Upload asset-related documents

### 👩‍💻 Employee

* View assigned assets
* Raise support tickets
* Track ticket status

---

## 🛠️ Tech Stack

* React.js
* React Router
* Axios
* CSS (Custom UI)

---

## 📁 Project Structure

```
src/
 ├── components/
 │    ├── Navbar/
 │    └── EmployeeNavbar/
 ├── pages/
 │    ├── Admin/
 │    ├── Employee/
 │    ├── Assets/
 │    ├── AssignAsset/
 │    ├── Tickets/
 │    ├── Upload/
 │    └── UpdateTicket/
 ├── services/
 │    ├── assetService.js
 │    ├── assignmentService.js
 │    ├── ticketService.js
 │    └── adminService.js
 ├── utils/
 │    ├── auth.js
 │    └── ProtectedRoute.js
 └── App.jsx
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/asset-management-frontend.git
cd asset-management-frontend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Start the application

```
npm start
```

App will run on:

```
http://localhost:3000
```

---

## 🔐 Authentication & Roles

* **Admin**

  * Full access to assets, assignments, ticket updates, and uploads

* **Employee**

  * Can raise and track tickets
  * Limited access via role-based routing

---

## 🔗 API Configuration

Update backend API URL inside service files:

Example:

```js
const API = "https://localhost:7117/api";
```

---

## 📸 Screens

* Admin Dashboard
* Asset Management
* Asset Assignment
* Ticket Management
* Upload Documents
* Employee Dashboard

---

## 📌 Future Improvements

* Search & filters
* Pagination
* Better error handling
* Notifications (Toast)
* Role-based UI enhancements

---

## 👨‍💻 Author

Developed by **Your Name**

---

## 📄 License

This project is for learning/demo purposes.
