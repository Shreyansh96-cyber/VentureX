import "./DashboardLayout.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="dashboardLayout">

        <Sidebar />

        <main className="mainContent">
          {children}
        </main>

      </div>
    </>
  );
}

export default DashboardLayout;