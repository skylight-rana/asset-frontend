import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [data,         setData]         = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/account/login", data);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate(res.data.role === "Admin" ? "/admin" : "/employee");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-shell">
        {/* Brand panel */}
        <div className="brand-panel">
          <div className="brand-mark">
            <i className="fas fa-boxes-stacked" />
          </div>
          <h1 className="brand-name">Asset<span>Manage</span></h1>
          <p className="brand-tagline">Enterprise Asset Management</p>

          <ul className="feature-list">
            <li><i className="fas fa-circle-check" /> Real-time asset tracking</li>
            <li><i className="fas fa-circle-check" /> IT ticket management</li>
            <li><i className="fas fa-circle-check" /> Role-based access control</li>
          </ul>
        </div>

        {/* Form panel */}
        <div className="form-panel">
          <div className="form-inner">
            <div className="form-header">
              <h2>Sign in</h2>
              <p>Access your workspace</p>
            </div>

            {error && (
              <div className="error-banner">
                <i className="fas fa-circle-exclamation" />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-row">
                <i className="fas fa-user input-icon" />
                <input
                  className="form-control has-icon"
                  type="text"
                  value={data.username}
                  placeholder="Enter username"
                  onChange={e => setData({ ...data, username: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-row">
                <i className="fas fa-lock input-icon" />
                <input
                  className="form-control has-icon"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  placeholder="Enter password"
                  onChange={e => setData({ ...data, password: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin" /> Authenticating…</>
              ) : (
                <>Sign in <i className="fas fa-arrow-right" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;