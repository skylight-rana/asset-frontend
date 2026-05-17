import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { createAsset, deleteAsset, getAssets } from "../../services/assetService";

import "./Assets.css";

const INITIAL_FORM_STATE = {
  name: "",
  type: "",
  serialNumber: "",
};

const ASSET_TYPES = [
  "Hardware",
  "Storage",
  "Accessory",
  "Software License",
];

function Assets() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return assets;

    return assets.filter((asset) => {
      const name = asset.name?.toLowerCase() || "";
      const type = asset.type?.toLowerCase() || "";
      const serialNumber = asset.serialNumber?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        type.includes(searchValue) ||
        serialNumber.includes(searchValue)
      );
    });
  }, [assets, search]);

  const loadAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data || []);
    } catch (error) {
      console.error("Failed to load assets", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      serialNumber: form.serialNumber.trim(),
    };

    if (!payload.name || !payload.type || !payload.serialNumber) {
      alert("Please fill all fields");
      return;
    }

    const isDuplicateSerialNumber = assets.some(
      (asset) =>
        asset.serialNumber?.toLowerCase() ===
        payload.serialNumber.toLowerCase()
    );

    if (isDuplicateSerialNumber) {
      alert("Serial number already exists");
      return;
    }

    try {
      await createAsset(payload);
      setForm(INITIAL_FORM_STATE);
      loadAssets();
    } catch (error) {
      console.error("Failed to add asset", error);
      alert("Failed to add asset");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this asset?");

    if (!confirmDelete) return;

    try {
      await deleteAsset(id);
      loadAssets();
    } catch (error) {
      console.error("Failed to delete asset", error);
      alert("Delete failed");
    }
  };

  const scrollToAddForm = () => {
    document.getElementById("add-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <DashboardLayout role="Admin" title="Assets">
      <div className="page-header">
        <h1>Asset Management</h1>

        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={scrollToAddForm}>
            <i className="fas fa-plus" />
            Add Asset
          </button>
        </div>
      </div>

      <div className="filter-bar filter-bar-spaced">
        <div className="header-search wide">
          <i className="fas fa-search" />

          <input
            type="text"
            placeholder="Search by name, type, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card asset-list-card">
        <div className="section-title">
          <i className="fas fa-box text-muted" />
          <span>All Assets</span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-box-open" />
            <p>
              {search
                ? "No assets match your search."
                : "No assets yet."}
            </p>
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
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="td-mono">{asset.id}</td>

                    <td className="asset-name">{asset.name}</td>

                    <td>
                      <span className="badge badge-blue">
                        {asset.type}
                      </span>
                    </td>

                    <td className="td-mono">{asset.serialNumber}</td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <i className="fas fa-trash-can" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              type="text"
              name="name"
              placeholder="e.g. Dell XPS 15"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type *</label>

            <select
              className="form-control"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="">Select type...</option>

              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Serial Number *</label>

            <input
              className="form-control"
              type="text"
              name="serialNumber"
              placeholder="e.g. SN-001"
              value={form.serialNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions-right">
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <i className="fas fa-plus" />
            Add Asset
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Assets;