import { FormMessage, SectionTitle } from "../common";

function AssignmentForm({
  assignData,
  errors,
  assetSearch,
  employeeSearch,
  assetOptions,
  employeeOptions,
  onChange,
  onAssetSearchChange,
  onEmployeeSearchChange,
  onSubmit,
}) {
  return (
    <div className="card assignment-form-card">
      <SectionTitle icon="fas fa-link" title="Assign Asset" />

      <FormMessage message={errors.form} banner />

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Search Asset *</label>
          <input
            className={`form-control ${errors.assetId ? "is-invalid" : ""}`}
            type="text"
            name="assetSearch"
            list="asset-options"
            placeholder="Search by asset name, ID, or serial number"
            value={assetSearch}
            onChange={onAssetSearchChange}
          />
          <datalist id="asset-options">
            {assetOptions.map((asset) => (
              <option key={asset.id} value={asset.label} />
            ))}
          </datalist>
          {assignData.assetId && (
            <p className="field-hint">Selected Asset ID: {assignData.assetId}</p>
          )}
          {errors.assetId && <p className="field-error">{errors.assetId}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Search Employee *</label>
          <input
            className={`form-control ${errors.employeeId ? "is-invalid" : ""}`}
            type="text"
            name="employeeSearch"
            list="employee-options"
            placeholder="Search by employee name, ID, or email"
            value={employeeSearch}
            onChange={onEmployeeSearchChange}
          />
          <datalist id="employee-options">
            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.label} />
            ))}
          </datalist>
          {assignData.employeeId && (
            <p className="field-hint">Selected Employee ID: {assignData.employeeId}</p>
          )}
          {errors.employeeId && (
            <p className="field-error">{errors.employeeId}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Condition at Issue</label>
          <input
            className="form-control"
            type="text"
            name="conditionAtIssue"
            placeholder="e.g. Excellent"
            value={assignData.conditionAtIssue}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="form-actions-right">
        <button type="button" className="btn btn-primary" onClick={onSubmit}>
          <i className="fas fa-link" />
          Assign Asset
        </button>
      </div>
    </div>
  );
}

export default AssignmentForm;
