function TableScroll({ children, maxHeight = "420px" }) {
  return (
    <div className="table-scroll" style={{ "--table-max-height": maxHeight }}>
      {children}
    </div>
  );
}

export default TableScroll;
