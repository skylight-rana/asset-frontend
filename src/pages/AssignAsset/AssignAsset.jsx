import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { assignAsset, returnAsset, getAssignments } from "../../services/assignmentService";
import "./AssignAsset.css";

function AssignAsset() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [assignData,  setAssignData]  = useState({ assetId: "", employeeId: "", conditionAtIssue: "" });

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAssignments();
      setAssignments(res.data.map(a => ({
        ...a,
        isReturned: a.actualReturnDate || a.status === "Returned",
      })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadAssignments(); }, []);

  const handleAssign = async () => {
    if (!assignData.assetId || !assignData.employeeId) { alert("Asset & Employee required"); return; }
    const alreadyAssigned = assignments.some(a => {
      const returned = a.actualReturnDate || a.returnDate || a.status === "Returned";
      return String(a.assetId) === String(assignData.assetId) && !returned;
    });
    if (alreadyAssigned) { alert("Asset already assigned and not yet returned"); return; }
    try {
      await assignAsset(assignData);
      setAssignData({ assetId: "", employeeId: "", conditionAtIssue: "" });
      loadAssignments();
    } catch { alert("Assignment failed"); }
  };

  const handleReturn = async (id) => {
    try {
      await returnAsset({ assignmentId: id, conditionAtReturn: "Good" });
      setAssignments(prev =>
        prev.map(a => (a.assignmentId || a.id) === id
          ? { ...a, isReturned: true, actualReturnDate: new Date() }
          : a
        )
      );
    } catch { alert("Return failed"); }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="app-layout">
      <Sidebar role="Admin" />
      <div className="main">
        <header className="top-header">
          <span className="page-title">Assignments</span>
          <div className="header-spacer" />
        </header>

        <div className="content">
          <div className="page-header">
            <h1>Asset Assignment</h1>
          </div>

          {/* Assign form */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">
              <i className="fas fa-link text-muted" />
              <span>Assign Asset</span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Asset ID *</label>
                <input className="form-control" placeholder="e.g. 1" value={assignData.assetId}
                  onChange={e => setAssignData({ ...assignData, assetId: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input className="form-control" placeholder="e.g. 5" value={assignData.employeeId}
                  onChange={e => setAssignData({ ...assignData, employeeId: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Condition at Issue</label>
                <input className="form-control" placeholder="e.g. Excellent" value={assignData.conditionAtIssue}
                  onChange={e => setAssignData({ ...assignData, conditionAtIssue: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleAssign}>
                <i className="fas fa-link" /> Assign Asset
              </button>
            </div>
          </div>

          {/* Assignment history */}
          <div className="card">
            <div className="section-title">
              <i className="fas fa-clock-rotate-left text-muted" />
              <span>Assignment History</span>
              {/* <span className="badge badge-gray">{assignments.length}</span> */}
            </div>

            {loading ? (
              <div className="empty-state"><i className="fas fa-spinner fa-spin" /><p>Loading…</p></div>
            ) : assignments.length === 0 ? (
              <div className="empty-state"><i className="fas fa-inbox" /><p>No assignments found.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Employee</th>
                      <th>Issued</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const returned = a.actualReturnDate || a.returnDate || a.status === "Returned";
                      return (
                        <tr key={a.assignmentId || a.id}>
                          <td style={{ fontWeight: 500 }}>{a.assetName || a.assetId}</td>
                          <td>{a.employeeName || a.employeeId}</td>
                          <td className="td-mono">{fmtDate(a.issuedDate)}</td>
                          <td>
                            <span className={`badge ${returned ? "badge-green" : "badge-warn"}`}>
                              {returned ? "Returned" : "Active"}
                            </span>
                          </td>
                          <td>
                            {!returned && (
                              <button className="btn btn-secondary btn-sm"
                                onClick={() => handleReturn(a.assignmentId || a.id)}>
                                <i className="fas fa-rotate-left" /> Return
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
        </div>
      </div>
    </div>
  );
}

export default AssignAsset;