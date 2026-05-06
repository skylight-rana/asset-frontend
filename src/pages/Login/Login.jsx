import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/account/login", data);

      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }

    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Main Heading */}
        <h1 className="main-heading">Welcome to Asset Management</h1>
        <p className="sub-heading">
          Manage assets, track tickets, and streamline IT operations
        </p>

        {/* Error Message */}
        {error && <p className="error">{error}</p>}

        {/* Username */}
        <input 
          type="text"
          placeholder="Username"
          value={data.username}
          onChange={e => setData({...data, username: e.target.value})} />

        {/* Password */}
        <div className="password-wrapper">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={data.password}
            onChange={e => setData({...data, password: e.target.value})}
           />

          <span
            className="toggle"
            onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* Button */}
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;