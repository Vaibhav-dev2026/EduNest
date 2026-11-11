import AppRoutes from "./routes/AppRoutes";
import CursorSpotlight from "./components/common/CursorSpotlight";
import { SidebarProvider } from "./context/SidebarContext";
import { NotificationProvider } from "./context/NotificationContext";

import "./styles/main.css";
import "./styles/variables.css";
import "./styles/dashboard.css";
import "./styles/forms.css";
import "./styles/tables.css";
import "./styles/responsive.css";
import "./styles/liquid-glass.css";

function App() {
    return (
        <SidebarProvider>
            <NotificationProvider>
                <CursorSpotlight />
                <AppRoutes />
            </NotificationProvider>
        </SidebarProvider>
    );
}

export default App;
