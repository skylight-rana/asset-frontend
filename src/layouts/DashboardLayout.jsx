import Sidebar from "../components/Sidebar/Sidebar";

function DashboardLayout({ role, title, children }) {
    return (
        <div className="app-layout">
            <Sidebar role={role} />

            <div className="main">
                <header className="top-header">
                    <span className="page-title">{title}</span>
                    <div className="header-spacer" />
                </header>

                <main className="content">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;