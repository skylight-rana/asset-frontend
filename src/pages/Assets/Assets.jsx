import { useEffect, useMemo, useState } from "react";

import { ASSET_TYPES, INITIAL_ASSET_FORM } from "../../constants";
import { DashboardLayout } from "../../layouts";
import {
  createAsset,
  deleteAsset,
  getAssets,
  getAssignments,
  getEmployees,
} from "../../services";
import {
  findActiveAssignmentByAsset,
  getAssetStatus,
  getEmployeeDisplayName,
} from "../../utils";

import "./Assets.css";

const INITIAL_FILTERS = {
  Assigned: true,
  Available: true,
};

function Assets() {
  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_ASSET_FORM);
  const [errors, setErrors] = useState({});
  const [statusFilters, setStatusFilters] = useState(INITIAL_FILTERS);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const [assetRes, assignmentRes, employeeRes] = await Promise.all([
        getAssets(),
        getAssignments(),
        getEmployees(),
      ]);

      setAssets(assetRes.data || []);
      setAssignments(assignmentRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error("Failed to load assets", error);
    }
  };

  const getAssetAssignment = (assetId) => {
    return findActiveAssignmentByAsset(assignments, assetId);
  };

  const getEmployeeName = (employeeId) => {
    return getEmployeeDisplayName(employeeId, employees);
  };

  const filteredAssets = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const assignment = getAssetAssignment(asset.id);
      const status = getAssetStatus(assignment);
            const employeeName = assignment
        ? getEmployeeName(assignment.employeeId).toLowerCase()
        : "";

      if (!statusFilters[status]) return false;
      if (!searchValue) return true;

      const name = asset.name?.toLowerCase() || "";
      const type = asset.type?.toLowerCase() || "";
      const serialNumber = asset.serialNumber?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        type.includes(searchValue) ||
        serialNumber.includes(searchValue) ||
        status.toLowerCase().includes(searchValue) ||
        employeeName.includes(searchValue)
      );
    });
  }, [assets, assignments, employees, search, statusFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      form: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      serialNumber: form.serialNumber.trim(),
    };

    if (!payload.name) nextErrors.name = "Asset name is required.";
    if (!payload.type) nextErrors.type = "Asset type is required.";
        if (!payload.serialNumber) {
      nextErrors.serialNumber = "Serial number is required.";
    }

    const isDuplicateSerialNumber = assets.some(
      (asset) =>
        asset.serialNumber?.toLowerCase() ===
        payload.serialNumber.toLowerCase()
    );

    if (payload.serialNumber && isDuplicateSerialNumber) {
      nextErrors.serialNumber = "Serial number already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      serialNumber: form.serialNumber.trim(),
    };

    try {
      await createAsset(payload);
      setForm(INITIAL_ASSET_FORM);
      setErrors({});
      loadAssets();
    } catch (error) {
      console.error("Failed to add asset", error);
      setErrors({ form: "Failed to add asset. Please check the details." });
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
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
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
      </div>

      <div className="filter-bar filter-bar-spaced">
        <div className="header-search wide">
          <i className="fas fa-search" />

          <input
            type="text"
            placeholder="Search by name, type, serial, status, or employee..."
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
                : "No assets found for selected filters."}
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
                  <th className="status-filter-header">
                    <button
                      type="button"
                      className="status-filter-button"
                      onClick={() => setShowStatusFilter((prev) => !prev)}
                    >
                      Status <i className="fas fa-filter" />
                    </button>

                    {showStatusFilter && (
                      <div className="status-filter-overlay">
                        {Object.keys(INITIAL_FILTERS).map((status) => (
                          <label key={status} className="filter-check-row">
                            <input
                              type="checkbox"
                              checked={statusFilters[status]}
                              onChange={() => handleStatusFilterChange(status)}
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    )}
                  </th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => {
                  const assignment = getAssetAssignment(asset.id);
                  const status = getAssetStatus(assignment);
                  const isAssigned = status === "Assigned";

                  return (
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
                        <span className={`badge ${isAssigned ? "badge-warn" : "badge-green"}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        {isAssigned ? (
                          <span className="employee-name">
                            {getEmployeeName(assignment.employeeId)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

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
                  );
                })}
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

        {errors.form && <div className="form-error-banner">{errors.form}</div>}

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Asset Name *</label>

            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              type="text"
              name="name"
              placeholder="e.g. Dell XPS 15"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Type *</label>

            <select
              className={`form-control ${errors.type ? "is-invalid" : ""}`}
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
            {errors.type && <p className="field-error">{errors.type}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Serial Number *</label>

            <input
              className={`form-control ${errors.serialNumber ? "is-invalid" : ""}`}
              type="text"
              name="serialNumber"
              placeholder="e.g. SN-001"
              value={form.serialNumber}
              onChange={handleChange}
            />
            {errors.serialNumber && <p className="field-error">{errors.serialNumber}</p>}
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
