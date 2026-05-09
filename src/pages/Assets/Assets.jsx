import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

import {
  getAssets,
  createAsset,
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

  // LOAD ASSETS
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

  // ADD ASSET
  const handleSubmit = async () => {

    if (!form.name || !form.type || !form.serialNumber) {
      alert("Please fill all fields");
      return;
    }

    try {

      await createAsset(form);

      setForm({
        name: "",
        type: "",
        serialNumber: ""
      });

      loadAssets();

    } catch (err) {
      console.error(err);
      alert("Failed to add asset");
    }
  };

  // DELETE
  const handleDelete = async (id) => {

    if (window.confirm("Delete this asset?")) {

      try {
        await deleteAsset(id);
        loadAssets();
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }

    }
  };

  // SEARCH FILTER
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

        <h3>Add Asset</h3>

        <div className="form-group">

          <input
            placeholder="Asset Name"
            value={form.name}
            onChange={e =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <select
            value={form.type}
            onChange={e =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="Hardware">Hardware</option>
            <option value="Storage">Storage</option>
            <option value="Accessory">Accessory</option>
            <option value="Software License">
              Software License
            </option>
          </select>

          <input
            placeholder="Serial Number"
            value={form.serialNumber}
            onChange={e =>
              setForm({
                ...form,
                serialNumber: e.target.value
              })
            }
          />

        </div>

        <div className="btn-group">
          <button
            className="btn primary"
            onClick={handleSubmit}
          >
            Add Asset
          </button>
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
                    <span
                      className={`status ${
                        a.status === "Available"
                          ? "available"
                          : "assigned"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td>
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