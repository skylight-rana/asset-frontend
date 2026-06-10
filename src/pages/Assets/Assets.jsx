import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AssetForm,
  AssetTable,
  NotificationDialog,
  PageHeader,
  SearchBox,
} from "../../components";
import { INITIAL_ASSET_FORM, ROUTES } from "../../constants";
import { useNotification, usePagination } from "../../hooks";
import { DashboardLayout } from "../../layouts";
import {
  createAsset,
  deleteAsset,
  getAssets,
  getAssignments,
  getDocumentsByAsset,
  getEmployees,
  returnAsset,
  uploadDocument,
} from "../../services";
import {
  buildAssetPayload,
  filterAssets,
  findActiveAssignmentByAsset,
  getApiErrorMessage,
  getAssetStatus,
  getEmployeeDisplayName,
  INITIAL_ASSET_STATUS_FILTERS,
  validateAssetForm,
} from "../../utils";

import "./Assets.css";

function Assets() {
  const navigate = useNavigate();
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documentsByAsset, setDocumentsByAsset] = useState({});
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_ASSET_FORM);
  const [errors, setErrors] = useState({});
  const [statusFilters, setStatusFilters] = useState(INITIAL_ASSET_STATUS_FILTERS);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [uploadingAssetId, setUploadingAssetId] = useState(null);

  const filteredAssets = useMemo(
    () =>
      filterAssets({
        assets,
        assignments,
        employees,
        search,
        statusFilters,
      }),
    [assets, assignments, employees, search, statusFilters]
  );

  const {
    page,
    pageSize,
    paginatedItems: paginatedAssets,
    setPage,
    setPageSize,
    resetPage,
  } = usePagination(filteredAssets);

  const getAssetAssignment = (assetId) =>
    findActiveAssignmentByAsset(assignments, assetId);

  const getEmployeeName = (employeeId) =>
    getEmployeeDisplayName(employeeId, employees);

  const selectedAssignment = selectedAsset
    ? getAssetAssignment(selectedAsset.id)
    : null;

  const selectedEmployeeName = selectedAssignment
    ? getEmployeeName(selectedAssignment.employeeId)
    : "";

  const loadDocuments = async (assetList) => {
    const entries = await Promise.all(
      (assetList || []).map(async (asset) => {
        try {
          const response = await getDocumentsByAsset(asset.id);
          return [asset.id, response.data || []];
        } catch {
          return [asset.id, []];
        }
      })
    );

    setDocumentsByAsset(Object.fromEntries(entries));
  };

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

      const assetList = assetRes.data || [];

      setAssets(assetList);
      setAssignments(assignmentRes.data || []);
      setEmployees(employeeRes.data || []);
      loadDocuments(assetList);
    } catch (error) {
      showError(
        "Assets not loaded",
        getApiErrorMessage(error, "Failed to load assets.")
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "", form: "" }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleSubmit = async () => {
    const validation = validateAssetForm(form, assets);

    setErrors(validation.errors);
    if (Object.keys(validation.errors).length > 0) return;

    try {
      await createAsset(buildAssetPayload(form));
      setForm(INITIAL_ASSET_FORM);
      setErrors({});
      showSuccess("Asset added", "Asset details saved successfully.");
      loadAssets();
    } catch (error) {
      showError(
        "Asset not added",
        getApiErrorMessage(error, "Failed to add asset.")
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;

    try {
      await deleteAsset(id);
      showSuccess("Asset deleted", "Asset removed successfully.");
      loadAssets();
    } catch (error) {
      showError("Delete failed", getApiErrorMessage(error, "Failed to delete asset."));
    }
  };

  const handleUploadDocument = async (assetId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetId", String(assetId));

    try {
      setUploadingAssetId(assetId);
      await uploadDocument(formData);
      showSuccess("Document uploaded", `${file.name} uploaded successfully.`);
      loadDocuments(assets);
    } catch (error) {
      showError(
        "Upload failed",
        getApiErrorMessage(error, "Document could not be uploaded.")
      );
    } finally {
      setUploadingAssetId(null);
    }
  };

  const handleQuickAssign = (asset) => {
    navigate(`${ROUTES.ADMIN_ASSIGNMENTS}?assetId=${asset.id}`);
  };

  const handleQuickReturn = async (assignmentId) => {
    if (!window.confirm("Return this asset now?")) return;

    try {
      await returnAsset({ assignmentId, conditionAtReturn: "Good" });
      showSuccess("Asset returned", "Asset returned successfully.");
      loadAssets();
    } catch (error) {
      showError("Return failed", getApiErrorMessage(error, "Failed to return asset."));
    }
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
  };

  return (
    <DashboardLayout role="Admin" title="Assets">
      <PageHeader title="Asset Management" />

      <AssetForm
        form={form}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <div className="filter-bar filter-bar-spaced">
        <SearchBox
          wide
          value={search}
          onChange={handleSearchChange}
          placeholder="Search asset by name, type, serial number, status, or employee..."
        />
      </div>

      <AssetTable
        assets={filteredAssets}
        paginatedAssets={paginatedAssets}
        totalAssets={filteredAssets.length}
        currentPage={page}
        pageSize={pageSize}
        search={search}
        statusFilters={statusFilters}
        showStatusFilter={showStatusFilter}
        selectedAsset={selectedAsset}
        selectedAssignment={selectedAssignment}
        selectedEmployeeName={selectedEmployeeName}
        documentsByAsset={documentsByAsset}
        uploadingAssetId={uploadingAssetId}
        onUploadDocument={handleUploadDocument}
        onAssetSelect={setSelectedAsset}
        onCloseAssetDetails={() => setSelectedAsset(null)}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onStatusFilterToggle={() => setShowStatusFilter((prev) => !prev)}
        onStatusFilterChange={handleStatusFilterChange}
        onDelete={handleDelete}
        onQuickAssign={handleQuickAssign}
        onQuickReturn={handleQuickReturn}
        getAssetAssignment={getAssetAssignment}
        getAssetStatus={getAssetStatus}
        getEmployeeName={getEmployeeName}
      />

      <NotificationDialog
        open={Boolean(notification)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onClose={closeNotification}
      />
    </DashboardLayout>
  );
}

export default Assets;
