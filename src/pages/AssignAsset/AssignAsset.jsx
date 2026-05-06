import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

import {
  assignAsset,
  returnAsset,
  getAssignments
} from "../../services/assignmentService";

import "./AssignAsset.css";

function AssignAsset() {

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [assignData, setAssignData] = useState({
    assetId: "",
    employeeId: "",
    conditionAtIssue: "",
    expectedReturnDate: ""
  });

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleAssign = async () => {
    if (!assignData.assetId || !assignData.employeeId) {
      alert("Asset & Employee required");
      return;
    }

    try {
      await assignAsset(assignData);

      setAssignData({
        assetId: "",
        employeeId: "",
        conditionAtIssue: "",
        expectedReturnDate: ""
      });

      loadAssignments();
    } catch {
      alert("Assignment failed");
    }
  };

  const handleReturn = async (id) => {
    try {
      await returnAsset({
        assignmentId: id,
        conditionAtReturn: "Good"
      });

      loadAssignments();
    } catch {
      alert("Return failed");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="assign-container">

      <div className="header">
        <h2>Asset Assignment</h2>
      </div>

      <Navbar />

      {/* FORM */}
      <div className="card">

        <h3>Assign Asset</h3>

        <div className="form-group">

          <input
            placeholder="Asset ID"
            value={assignData.assetId}
            onChange={e =>
              setAssignData({ ...assignData, assetId: e.target.value })
            }
          />

          <input
            placeholder="Employee ID"
            value={assignData.employeeId}
            onChange={e =>
              setAssignData({ ...assignData, employeeId: e.target.value })
            }
          />

          <input
            placeholder="Condition"
            value={assignData.conditionAtIssue}
            onChange={e =>
              setAssignData({
                ...assignData,
                conditionAtIssue: e.target.value
              })
            }
          />

          <input
            type="date"
            value={assignData.expectedReturnDate}
            onChange={e =>
              setAssignData({
                ...assignData,
                expectedReturnDate: e.target.value
              })
            }
          />

        </div>

        <div className="btn-group">
          <button className="btn primary" onClick={handleAssign}>
            Assign Asset
          </button>
        </div>

      </div>

      {/* TABLE */}
      <div className="card">

        <h3>Assignment History ({assignments.length})</h3>

        {loading ? (
          <p className="empty">Loading...</p>
        ) : assignments.length === 0 ? (
          <p className="empty">No assignments found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Employee</th>
                <th>Issued</th>
                <th>Expected</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>

                  <td>{a.assetName || a.assetId}</td>
                  <td>{a.employeeName || a.employeeId}</td>

                  <td>{formatDate(a.issuedDate)}</td>
                  <td>{formatDate(a.expectedReturnDate)}</td>

                  <td>
                    <span className={`status ${a.actualReturnDate ? "returned" : "active"}`}>
                      {a.actualReturnDate ? "Returned" : "Active"}
                    </span>
                  </td>

                  <td>
                    {!a.actualReturnDate && (
                      <button
                        className="btn small success"
                        onClick={() => handleReturn(a.id)}
                      >
                        Return
                      </button>
                    )}
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

export default AssignAsset;