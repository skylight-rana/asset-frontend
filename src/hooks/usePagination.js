import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "../constants";

function usePagination(items = [], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    page: currentPage,
    pageSize,
    paginatedItems,
    setPage,
    setPageSize: handlePageSizeChange,
    resetPage,
  };
}

export default usePagination;
