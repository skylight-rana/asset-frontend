import { useEffect, useState } from "react";
import EmployeeNavbar from "../../components/EmployeeNavbar/EmployeeNavbar";

import "./EmployeeDashboard.css";

function EmployeeDashboard() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);
  }, []);

  return (
    <div className="container">   {/* ✅ SAME AS ADMIN */}

      {/* HEADER */}
      <div className="header">

        <div>
          <h2>Employee Dashboard</h2>

          {user && (
            <p className="welcome-text">
              Welcome, <b>{user.username}</b>
            </p>
          )}
        </div>

      </div>

      {/* NAVBAR */}
      <EmployeeNavbar />

      {/* SIMPLE CARD */}
      <div className="card">
        <h3>Welcome</h3>
        <p>
          Use the navigation above to raise and track your tickets.
        </p>
      </div>

    </div>
  );
}

export default EmployeeDashboard;