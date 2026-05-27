import { useEffect, useMemo, useState } from "react";

import {
  AssetForm,
  AssetTable,
  PageHeader,
  SearchBox,
} from "../../components";
import { INITIAL_ASSET_FORM } from "../../constants";
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleToggleStatusFilter = () => {
    setShowStatusFilter((prev) => !prev);
  };

  const handleStatusFilterInputChange = (e) => {
    handleStatusFilterChange(e.target.value);
  };

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

  return (
    <DashboardLayout role="Admin" title="Assets">
      <PageHeader title="Asset Management" />

      <div className="filter-bar filter-bar-spaced">
        <SearchBox
          wide
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, type, serial, status, or employee..."
        />
      </div>

      <AssetTable
        assets={filteredAssets}
        search={search}
        statusFilters={statusFilters}
        showStatusFilter={showStatusFilter}
        onStatusFilterToggle={handleToggleStatusFilter}
        onStatusFilterChange={handleStatusFilterInputChange}
        onDelete={handleDelete}
        getAssetAssignment={getAssetAssignment}
        getAssetStatus={getAssetStatus}
        getEmployeeName={getEmployeeName}
      />

      <AssetForm
        form={form}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}

export default Assets;
