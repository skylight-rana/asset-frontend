import { ASSET_TYPES } from "../../constants";
import { FormMessage, SectionTitle } from "../common";

function AssetForm({ form, errors, onChange, onSubmit }) {
  return (
    <div className="card" id="add-form">
      <SectionTitle icon="fas fa-plus-circle" title="Add New Asset" />

      <FormMessage message={errors.form} banner />

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Asset Name *</label>
          <input
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            type="text"
            name="name"
            placeholder="e.g. Dell XPS 15"
            value={form.name}
            onChange={onChange}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Type *</label>
          <select
            className={`form-control ${errors.type ? "is-invalid" : ""}`}
            name="type"
            value={form.type}
            onChange={onChange}
          >
            <option value="">Select type...</option>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p className="field-error">{errors.type}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Serial Number *</label>
          <input
            className={`form-control ${errors.serialNumber ? "is-invalid" : ""}`}
            type="text"
            name="serialNumber"
            placeholder="e.g. SN-001"
            value={form.serialNumber}
            onChange={onChange}
          />
          {errors.serialNumber && (
            <p className="field-error">{errors.serialNumber}</p>
          )}
        </div>
      </div>

      <div className="form-actions-right">
        <button type="button" className="btn btn-primary" onClick={onSubmit}>
          <i className="fas fa-plus" />
          Add Asset
        </button>
      </div>
    </div>
  );
}

export default AssetForm;
