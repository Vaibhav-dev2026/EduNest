import { useState } from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="admin-layout-wrapper">
            <Navbar toggleSidebar={toggleSidebar} />

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

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