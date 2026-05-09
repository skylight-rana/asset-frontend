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
    conditionAtIssue: ""
  });

  // LOAD ASSIGNMENTS
  const loadAssignments = async () => {

    setLoading(true);

    try {

      const res = await getAssignments();

      // UPDATE UI IMMEDIATELY AFTER RETURN
      const updatedAssignments = res.data.map(a => ({
        ...a,
        isReturned:
          a.actualReturnDate ||
          a.status === "Returned"
      }));

      setAssignments(updatedAssignments);

    } catch (err) {

      console.error(err);

    }

    setLoading(false);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // ASSIGN ASSET
  const handleAssign = async () => {

    if (!assignData.assetId || !assignData.employeeId) {
      alert("Asset & Employee required");
      return;
    }

    try {

      await assignAsset(assignData);

      alert("Asset assigned successfully");

      setAssignData({
        assetId: "",
        employeeId: "",
        conditionAtIssue: ""
      });

      loadAssignments();

    } catch (err) {

      console.error(err);
      alert("Assignment failed");

    }
  };

  // RETURN ASSET
  const handleReturn = async (assignmentId) => {

    try {

      await returnAsset({
        assignmentId: assignmentId,
        conditionAtReturn: "Good"
      });

      alert("Asset returned successfully");

      // UPDATE STATUS LOCALLY
      setAssignments(prev =>
        prev.map(a =>
          (a.assignmentId || a.id) === assignmentId
            ? {
              ...a,
              isReturned: true,
              actualReturnDate: new Date()
            }
            : a
        )
      );

    } catch (err) {

      console.error(err);
      alert("Return failed");

    }
  };

  // DATE FORMAT
  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="assign-container">

      {/* HEADER */}
      <div className="header">
        <h2>Asset Assignment</h2>
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* FORM */}
      <div className="card">

        <h3>Assign Asset</h3>

        <div className="form-group">

          <input
            placeholder="Asset ID"
            value={assignData.assetId}
            onChange={e =>
              setAssignData({
                ...assignData,
                assetId: e.target.value
              })
            }
          />

          <input
            placeholder="Employee ID"
            value={assignData.employeeId}
            onChange={e =>
              setAssignData({
                ...assignData,
                employeeId: e.target.value
              })
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

        </div>

        <div className="btn-group">

          <button
            className="btn primary"
            onClick={handleAssign}
          >
            Assign Asset
          </button>

        </div>

      </div>

      {/* TABLE */}
      <div className="card">

        <h3>
          Assignment History ({assignments.length})
        </h3>

        {loading ? (

          <p className="empty">Loading...</p>

        ) : assignments.length === 0 ? (

          <p className="empty">
            No assignments found
          </p>

        ) : (

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

              {assignments.map(a => {

                // CHECK RETURN STATUS
                const isReturned =
                  a.actualReturnDate ||
                  a.returnDate ||
                  a.status === "Returned";

                return (
                  <tr key={a.assignmentId || a.id}>

                    <td>
                      {a.assetName || a.assetId}
                    </td>

                    <td>
                      {a.employeeName || a.employeeId}
                    </td>

                    <td>
                      {formatDate(a.issuedDate)}
                    </td>

                    <td>
                      <span
                        className={`status ${isReturned
                            ? "returned"
                            : "active"
                          }`}
                      >
                        {isReturned
                          ? "Returned"
                          : "Active"}
                      </span>
                    </td>

                    <td>

                      {!isReturned && (
                        <button
                          className="btn small success"
                          onClick={() =>
                            handleReturn(
                              a.assignmentId || a.id
                            )
                          }
                        >
                          Return
                        </button>
                      )}

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default AssignAsset;