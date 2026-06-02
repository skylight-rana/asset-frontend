import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AssignmentForm,
  AssignmentHistoryTable,
  PageHeader,
  SearchBox,
} from "../../components";
import { DEFAULT_PAGE_SIZE, INITIAL_ASSIGNMENT_FORM } from "../../constants";
import { DashboardLayout } from "../../layouts";
import { assignAsset, getAssets, getAssignments, getEmployees, returnAsset } from "../../services";
import { getApiErrorMessage, isReturned } from "../../utils";

import "./AssignAsset.css";

const INITIAL_STATUS_FILTERS = {
  Active: true,
  Returned: true,
};

function AssignAsset() {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignData, setAssignData] = useState(INITIAL_ASSIGNMENT_FORM);
  const [assetSearch, setAssetSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [errors, setErrors] = useState({});
  const [statusFilters, setStatusFilters] = useState(INITIAL_STATUS_FILTERS);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    loadAssignmentPageData();
  }, []);

  useEffect(() => {
    const assetIdFromUrl = searchParams.get("assetId");

    if (!assetIdFromUrl || assets.length === 0 || assignData.assetId) return;

    const selectedAsset = assets.find(
      (asset) => String(asset.id) === String(assetIdFromUrl)
    );

    if (!selectedAsset) return;

    setAssignData((prevData) => ({
      ...prevData,
      assetId: String(selectedAsset.id),
    }));
    setAssetSearch(
      `#${selectedAsset.id} - ${selectedAsset.name} (${selectedAsset.serialNumber})`
    );
  }, [assets, assignData.assetId, searchParams]);

  const assetOptions = useMemo(() => {
    const activeAssetIds = assignments
      .filter((assignment) => !isReturned(assignment))
      .map((assignment) => String(assignment.assetId));

    return assets.filter((asset) => !activeAssetIds.includes(String(asset.id))).map((asset) => ({
      ...asset,
      label: `#${asset.id} - ${asset.name} (${asset.serialNumber})`,
    }));
  }, [assets, assignments]);

  const employeeOptions = useMemo(() => {
    return employees.map((employee) => ({
      ...employee,
      label: `#${employee.id} - ${employee.name} (${employee.email})`,
    }));
  }, [employees]);

  const filteredAssignments = useMemo(() => {
    const searchValue = assignmentSearch.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const status = isReturned(assignment) ? "Returned" : "Active";

      if (!statusFilters[status]) return false;
      if (!searchValue) return true;

      const assetName = assignment.assetName?.toLowerCase() || "";
      const employeeName = assignment.employeeName?.toLowerCase() || "";
      const assetId = String(assignment.assetId || "");
      const employeeId = String(assignment.employeeId || "");

      return (
        assetName.includes(searchValue) ||
        employeeName.includes(searchValue) ||
        assetId.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        status.toLowerCase().includes(searchValue)
      );
    });
  }, [assignments, assignmentSearch, statusFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssignments.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const hasActiveAssignments = paginatedAssignments.some(
    (assignment) => !isReturned(assignment)
  );

  const normalizeAssignments = (data) => {
    return data.map((assignment) => ({
      ...assignment,
      isReturned: isReturned(assignment),
    }));
  };

  const handleToggleStatusFilter = () => {
    setShowStatusFilter((prev) => !prev);
  };

  const handleStatusFilterInputChange = (e) => {
    handleStatusFilterChange(e.target.value);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
  };

  const getIdFromSearchValue = (value, options) => {
    const exactMatch = options.find((option) => option.label === value);

    if (exactMatch) return String(exactMatch.id);

    const numericValue = value.trim().match(/^#?(\d+)/)?.[1];

    return numericValue || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAssignData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      form: "",
    }));
  };

  const handleAssetSearchChange = (e) => {
    const value = e.target.value;
    const assetId = getIdFromSearchValue(value, assetOptions);

    setAssetSearch(value);
    setAssignData((prevData) => ({
      ...prevData,
      assetId,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, assetId: "", form: "" }));
  };

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    const employeeId = getIdFromSearchValue(value, employeeOptions);

    setEmployeeSearch(value);
    setAssignData((prevData) => ({
      ...prevData,
      employeeId,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, employeeId: "", form: "" }));
  };

  const handleAssign = async () => {
    const payload = {
      assetId: assignData.assetId.trim(),
      employeeId: assignData.employeeId.trim(),
      conditionAtIssue: assignData.conditionAtIssue.trim(),
    };

    const nextErrors = {};

    if (!payload.assetId) nextErrors.assetId = "Asset ID is required.";
    if (!payload.employeeId) nextErrors.employeeId = "Employee ID is required.";

    if (payload.assetId && isAssetAlreadyAssigned()) {
      nextErrors.assetId = "Asset is already assigned and not yet returned.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await assignAsset(payload);
      setAssignData(INITIAL_ASSIGNMENT_FORM);
      setAssetSearch("");
      setEmployeeSearch("");
      setErrors({});
      loadAssignmentPageData();
    } catch (error) {
      console.error("Assignment failed", error);
      setErrors({ form: getApiErrorMessage(error, "Assignment failed.") });
    }
  };

  const isAssetAlreadyAssigned = () => {
    return assignments.some((assignment) => {
      return (
        String(assignment.assetId) === String(assignData.assetId) &&
        !isReturned(assignment)
      );
    });
  };

  const loadAssignmentPageData = async () => {
    try {
      setLoading(true);

      const [assignmentRes, assetRes, employeeRes] = await Promise.all([
        getAssignments(),
        getAssets(),
        getEmployees(),
      ]);

      setAssignments(normalizeAssignments(assignmentRes.data || []));
      setAssets(assetRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error("Failed to load assignment page data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assignmentId) => {
    try {
      await returnAsset({
        assignmentId,
        conditionAtReturn: "Good",
      });

      setAssignments((prevAssignments) =>
        prevAssignments.map((assignment) =>
          (assignment.assignmentId || assignment.id) === assignmentId
            ? {
                ...assignment,
                isReturned: true,
                actualReturnDate: new Date(),
              }
            : assignment
        )
      );
    } catch (error) {
      console.error("Return failed", error);
      setErrors({ form: getApiErrorMessage(error, "Return failed.") });
    }
  };


  const handleShowAssetDetails = (assignment) => {
    const asset = assets.find((item) => String(item.id) === String(assignment.assetId));
    setSelectedDetail({
      title: "Asset Details",
      items: [
        { label: "Asset ID", value: assignment.assetId },
        { label: "Name", value: asset?.name || assignment.assetName },
        { label: "Type", value: asset?.type },
        { label: "Serial Number", value: asset?.serialNumber },
        { label: "Status", value: isReturned(assignment) ? "Returned" : "Assigned" },
      ],
    });
  };

  const handleShowEmployeeDetails = (assignment) => {
    const employee = employees.find((item) => String(item.id) === String(assignment.employeeId));
    setSelectedDetail({
      title: "Employee Details",
      items: [
        { label: "Employee ID", value: assignment.employeeId },
        { label: "Name", value: employee?.name || assignment.employeeName },
        { label: "Email", value: employee?.email },
        { label: "Assigned Asset", value: assignment.assetName || `Asset #${assignment.assetId}` },
        { label: "Issued Date", value: assignment.issuedDate ? new Date(assignment.issuedDate).toLocaleDateString() : "—" },
      ],
    });
  };

  return (
    <DashboardLayout role="Admin" title="Assignments">
      <PageHeader title="Asset Assignment" />

      <AssignmentForm
        assignData={assignData}
        errors={errors}
        assetSearch={assetSearch}
        employeeSearch={employeeSearch}
        assetOptions={assetOptions}
        employeeOptions={employeeOptions}
        onChange={handleChange}
        onAssetSearchChange={handleAssetSearchChange}
        onEmployeeSearchChange={handleEmployeeSearchChange}
        onSubmit={handleAssign}
      />

      <div className="filter-bar filter-bar-spaced">
        <SearchBox
          wide
          value={assignmentSearch}
          onChange={(e) => setAssignmentSearch(e.target.value)}
          placeholder="Search assignment by asset, employee, ID, or status..."
        />
      </div>

      <AssignmentHistoryTable
        loading={loading}
        assignments={filteredAssignments}
        paginatedAssignments={paginatedAssignments}
        statusFilters={statusFilters}
        showStatusFilter={showStatusFilter}
        hasActiveAssignments={hasActiveAssignments}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onStatusFilterToggle={handleToggleStatusFilter}
        onStatusFilterChange={handleStatusFilterInputChange}
        selectedDetail={selectedDetail}
        onCloseDetail={() => setSelectedDetail(null)}
        onShowAsset={handleShowAssetDetails}
        onShowEmployee={handleShowEmployeeDetails}
        onReturn={handleReturn}
      />
    </DashboardLayout>
  );
}

export default AssignAsset;
