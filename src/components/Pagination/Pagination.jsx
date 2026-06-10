import { PAGE_SIZE_OPTIONS } from "../../constants";
import "./Pagination.css";

function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageSizeSelect = (e) => {
    onPageSizeChange(Number(e.target.value));
  };

  const handlePreviousPage = () => {
    onPageChange(page - 1);
  };

  const handleNextPage = () => {
    onPageChange(page + 1);
  };
  const startItem = 
    totalItems === 0
     ? 0 
      : (page - 1) * pageSize + 1;
  
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalItems}
      </div>

      <div className="pagination-actions">
        <select
          className="pagination-size"
          value={pageSize}
          onChange={handlePageSizeSelect}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Previous
        </button>

        <span className="pagination-page">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
