import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import { useSidebar } from "../context/SidebarContext";

function AdminLayout({ children }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={`admin-layout-wrapper ${isCollapsed ? "layout--collapsed" : ""}`}>
            <Navbar />
            <Sidebar />
            <main className="main-content">
                <div className="main-content-inner animate-fade-in">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}

export default AdminLayout;
