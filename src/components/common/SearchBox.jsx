function SearchBox({ value, onChange, placeholder, wide = false }) {
  return (
    <div className={`header-search ${wide ? "wide" : ""}`}>
      <i className="fas fa-search" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBox;
