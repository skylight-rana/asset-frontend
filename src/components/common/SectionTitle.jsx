function SectionTitle({ icon, title, children }) {
  return (
    <div className="section-title">
      {icon && <i className={`${icon} text-muted`} />}
      <span>{title}</span>
      {children}
    </div>
  );
}

export default SectionTitle;
