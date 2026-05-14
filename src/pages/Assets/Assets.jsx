import { useEffect, useState } from "react";
import { getAssets, createAsset, deleteAsset } from "../../services/assetService";
import DashboardLayout from "../../layouts/DashboardLayout";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", type: "", serialNumber: "" });

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try { const res = await getAssets(); setAssets(res.data); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.type.trim() || !form.serialNumber.trim()) {
      alert("Please fill all fields"); return;
    }
    if (assets.some(a => a.serialNumber.toLowerCase() === form.serialNumber.toLowerCase())) {
      alert("Serial number already exists"); return;
    }
    try {
      await createAsset({ name: form.name.trim(), type: form.type.trim(), serialNumber: form.serialNumber.trim() });
      setForm({ name: "", type: "", serialNumber: "" });
      loadAssets();
    } catch { alert("Failed to add asset"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try { await deleteAsset(id); loadAssets(); }
    catch { alert("Delete failed"); }
  };

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    a.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="Admin" title="Assets">
      {/* page content */}
      <div className="content">
        <div className="page-header">
          <h1>Asset Management</h1>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => document.getElementById('add-form').scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-plus" /> Add Asset
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="header-search wide">
            <i className="fas fa-search" />
            <input
              placeholder="Search by name, type, or serial…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">
            <i className="fas fa-box text-muted" />
            <span>All Assets</span>
            {/* <span className="badge badge-gray">{filtered.length}</span> */}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open" />
              <p>{search ? "No assets match your search." : "No assets yet."}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Serial Number</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td className="td-mono">{a.id}</td>
                      <td style={{ fontWeight: 500 }}>{a.name}</td>
                      <td><span className="badge badge-blue">{a.type}</span></td>
                      <td className="td-mono">{a.serialNumber}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>
                          <i className="fas fa-trash-can" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add form */}
        <div className="card" id="add-form">
          <div className="section-title">
            <i className="fas fa-plus-circle text-muted" />
            <span>Add New Asset</span>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Asset Name *</label>
              <input
                className="form-control"
                placeholder="e.g. Dell XPS 15"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-control"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Select type…</option>
                <option value="Hardware">Hardware</option>
                <option value="Storage">Storage</option>
                <option value="Accessory">Accessory</option>
                <option value="Software License">Software License</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number *</label>
              <input
                className="form-control"
                placeholder="e.g. SN-001"
                value={form.serialNumber}
                onChange={e => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <i className="fas fa-plus" /> Add Asset
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Assets;