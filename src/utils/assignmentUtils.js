export function isReturned(assignment) {
  return Boolean(
    assignment?.actualReturnDate ||
      assignment?.returnDate ||
      assignment?.status === "Returned"
  );
}

export function getActiveAssignments(assignments = []) {
  return assignments.filter((assignment) => !isReturned(assignment));
}

export function findActiveAssignmentByAsset(assignments = [], assetId) {
  return assignments.find(
    (assignment) =>
      String(assignment.assetId) === String(assetId) && !isReturned(assignment)
  );
}

export function getAssignmentAssetName(assignment, assets = []) {
  const asset = assets.find(
    (item) => String(item.id) === String(assignment?.assetId)
  );

  return assignment?.assetName || asset?.name || `Asset #${assignment?.assetId}`;
}

export function getAssetStatus(assignment) {
  return assignment ? "Assigned" : "Available";
}
