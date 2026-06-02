import { ASSET_TYPES } from "../../constants";
import { FormMessage, SectionTitle } from "../common";

function AssetForm({ form, errors, onChange, onSubmit }) {
  return (
    <div className="card asset-form-card" id="add-form">
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
          <label className="form-label">Quantity *</label>
          <input
            className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
            type="number"
            name="quantity"
            min="1"
            placeholder="e.g. 3"
            value={form.quantity}
            onChange={onChange}
          />
          {errors.quantity && <p className="field-error">{errors.quantity}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Serial Numbers *</label>
        <textarea
          className={`form-control ${errors.serialNumbers ? "is-invalid" : ""}`}
          name="serialNumbers"
          rows="4"
          placeholder={"Enter one serial number per line or comma separated, e.g.\nSN-001\nSN-002\nSN-003"}
          value={form.serialNumbers}
          onChange={onChange}
        />
        <small className="text-muted">
          Quantity must match the number of serial numbers. Each physical item must have a unique serial number.
        </small>
        {errors.serialNumbers && (
          <p className="field-error">{errors.serialNumbers}</p>
        )}
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
