import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  assignAsset,
  getAssignments,
  returnAsset,
} from "../../services/assignmentService";

import "./AssignAsset.css";

const INITIAL_ASSIGNMENT_FORM = {
  assetId: "",
  employeeId: "",
  conditionAtIssue: "",
};

function AssignAsset() {
  const [assignments, setAssignments] = useState([]);
  const [assignData, setAssignData] = useState(INITIAL_ASSIGNMENT_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "—";
  };

  const normalizeAssignments = (data) => {
    return data.map((assignment) => ({
      ...assignment,
      isReturned:
        assignment.actualReturnDate || assignment.status === "Returned",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAssignData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAssign = async () => {
    const payload = {
      assetId: assignData.assetId.trim(),
      employeeId: assignData.employeeId.trim(),
      conditionAtIssue: assignData.conditionAtIssue.trim(),
    };

    if (!payload.assetId || !payload.employeeId) {
      alert("Asset & Employee required");
      return;
    }

    if (isAssetAlreadyAssigned()) {
      alert("Asset already assigned and not yet returned");
      return;
    }

    try {
      await assignAsset(payload);
      setAssignData(INITIAL_ASSIGNMENT_FORM);
      loadAssignments();
    } catch (error) {
      console.error("Assignment failed", error);
      alert("Assignment failed");
    }
  };

  const isAssetAlreadyAssigned = () => {
    return assignments.some((assignment) => {
      const isReturned =
        assignment.actualReturnDate ||
        assignment.returnDate ||
        assignment.status === "Returned";

      return (
        String(assignment.assetId) === String(assignData.assetId) &&
        !isReturned
      );
    });
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const res = await getAssignments();
      setAssignments(normalizeAssignments(res.data || []));
    } catch (error) {
      console.error("Failed to load assignments", error);
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
      alert("Return failed");
    }
  };

  return (
    <DashboardLayout role="Admin" title="Assignments">
      <div className="page-header">
        <h1>Asset Assignment</h1>
      </div>

      <div className="card assignment-form-card">
        <div className="section-title">
          <i className="fas fa-link text-muted" />
          <span>Assign Asset</span>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Asset ID *</label>

            <input
              className="form-control"
              type="text"
              name="assetId"
              placeholder="e.g. 1"
              value={assignData.assetId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee ID *</label>

            <input
              className="form-control"
              type="text"
              name="employeeId"
              placeholder="e.g. 5"
              value={assignData.employeeId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Condition at Issue</label>

            <input
              className="form-control"
              type="text"
              name="conditionAtIssue"
              placeholder="e.g. Excellent"
              value={assignData.conditionAtIssue}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions-right">
          <button type="button" className="btn btn-primary" onClick={handleAssign}>
            <i className="fas fa-link" />
            Assign Asset
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <i className="fas fa-clock-rotate-left text-muted" />
          <span>Assignment History</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin" />
            <p>Loading...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox" />
            <p>No assignments found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((assignment) => {
                  const assignmentId =
                    assignment.assignmentId || assignment.id;

                  const isReturned =
                    assignment.actualReturnDate ||
                    assignment.returnDate ||
                    assignment.status === "Returned";

                  return (
                    <tr key={assignmentId}>
                      <td className="asset-name">
                        {assignment.assetName || assignment.assetId}
                      </td>

                      <td>
                        {assignment.employeeName || assignment.employeeId}
                      </td>

                      <td className="td-mono">
                        {formatDate(assignment.issuedDate)}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            isReturned ? "badge-green" : "badge-warn"
                          }`}
                        >
                          {isReturned ? "Returned" : "Active"}
                        </span>
                      </td>

                      <td>
                        {!isReturned && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleReturn(assignmentId)}
                          >
                            <i className="fas fa-rotate-left" />
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AssignAsset;