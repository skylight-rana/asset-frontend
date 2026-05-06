import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset
} from "../../services/assetService";

import "./Assets.css";

function Assets() {

  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "",
    serialNumber: ""
  });

  const [editId, setEditId] = useState(null);

  const loadAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data);
    } catch (err) {
      console.error("Error loading assets", err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSubmit = async () => {

    if (!form.name || !form.type || !form.serialNumber) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        await updateAsset(editId, form);
        setEditId(null);
      } else {
        await createAsset(form);
      }

      setForm({ name: "", type: "", serialNumber: "" });
      loadAssets();

    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (asset) => {
    setForm({
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber
    });
    setEditId(asset.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this asset?")) {
      await deleteAsset(id);
      loadAssets();
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: "", type: "", serialNumber: "" });
  };

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assets-container">

      {/* HEADER */}
      <div className="header">
        <h2>Asset Management</h2>
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* SEARCH */}
      <div className="card">
        <input
          className="search-box"
          placeholder="Search assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* FORM */}
      <div className="card">
        <h3>{editId ? "Edit Asset" : "Add Asset"}</h3>

        <div className="form-group">
          <input
            placeholder="Asset Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option>Laptop</option>
            <option>Monitor</option>
            <option>Keyboard</option>
            <option>Mouse</option>
            <option>Mobile</option>
            <option>Printer</option>
            <option>Software License</option>
          </select>

          <input
            placeholder="Serial Number"
            value={form.serialNumber}
            onChange={e =>
              setForm({ ...form, serialNumber: e.target.value })
            }
          />
        </div>

        <div className="btn-group">
          <button className="btn primary" onClick={handleSubmit}>
            {editId ? "Update" : "Add"}
          </button>

          {editId && (
            <button className="btn cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="card">

        <h3>All Assets ({filteredAssets.length})</h3>

        {filteredAssets.length === 0 ? (
          <p className="empty">No assets found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Serial</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.type}</td>
                  <td>{a.serialNumber}</td>

                  <td>
                    <span className={`status ${a.status === "Available" ? "available" : "assigned"}`}>
                      {a.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn small edit"
                      onClick={() => handleEdit(a)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn small delete"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}

export default Assets;