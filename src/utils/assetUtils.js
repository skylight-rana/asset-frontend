import { INITIAL_ASSET_FORM } from "../constants";
import { findActiveAssignmentByAsset, getAssetStatus } from "./assignmentUtils";
import { getEmployeeDisplayName } from "./employeeUtils";

export const INITIAL_ASSET_STATUS_FILTERS = {
  Assigned: true,
  Available: true,
};

export const validateAssetForm = (form, assets = []) => {
  const errors = {};
  const payload = buildAssetPayload(form);

  if (!payload.name) errors.name = "Asset name is required.";
  if (!payload.type) errors.type = "Asset type is required.";
  if (!payload.quantity || payload.quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0.";
  }
  if (payload.serialNumbers.length === 0) {
    errors.serialNumbers = "At least one serial number is required.";
  }
  if (
    payload.quantity > 0 &&
    payload.serialNumbers.length > 0 &&
    payload.quantity !== payload.serialNumbers.length
  ) {
    errors.serialNumbers = "Quantity and serial number count must be the same.";
  }

  const duplicateSerialNumber = payload.serialNumbers.find(
    (serialNumber, index) =>
      payload.serialNumbers.findIndex(
        (item) => item.toLowerCase() === serialNumber.toLowerCase()
      ) !== index
  );

  if (duplicateSerialNumber) {
    errors.serialNumbers = `Duplicate serial number entered: ${duplicateSerialNumber}`;
  }

  const existingSerialNumber = payload.serialNumbers.find((serialNumber) =>
    assets.some(
      (asset) => asset.serialNumber?.toLowerCase() === serialNumber.toLowerCase()
    )
  );

  if (existingSerialNumber) {
    errors.serialNumbers = `Serial number already exists: ${existingSerialNumber}`;
  }

  return { errors, payload };
};

export const buildAssetPayload = (form = INITIAL_ASSET_FORM) => ({
  name: form.name.trim(),
  type: form.type.trim(),
  quantity: Number(form.quantity),
  serialNumbers: parseSerialNumbers(form.serialNumbers),
});

export const parseSerialNumbers = (value = "") =>
  value
    .split(/[\n,]+/)
    .map((serialNumber) => serialNumber.trim())
    .filter(Boolean);

export const getAssetSearchText = ({ asset, assignment, employees, status }) => {
  const employeeName = assignment
    ? getEmployeeDisplayName(assignment.employeeId, employees)
    : "";

  return [
    asset.name,
    asset.type,
    asset.serialNumber,
    status,
    employeeName,
  ]
    .join(" ")
    .toLowerCase();
};

export const filterAssets = ({
  assets = [],
  assignments = [],
  employees = [],
  search = "",
  statusFilters = INITIAL_ASSET_STATUS_FILTERS,
}) => {
  const searchValue = search.trim().toLowerCase();

  return assets.filter((asset) => {
    const assignment = findActiveAssignmentByAsset(assignments, asset.id);
    const status = getAssetStatus(assignment);

    if (!statusFilters[status]) return false;
    if (!searchValue) return true;

    return getAssetSearchText({ asset, assignment, employees, status }).includes(
      searchValue
    );
  });
};
