function PageHeader({ eyebrow, title }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
    </div>
  );
}

export default PageHeader;
