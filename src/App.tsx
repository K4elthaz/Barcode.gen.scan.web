import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "./Pages/Login";
import MainPage from "./Pages/main-page";
import DashboardPage from "./components/Dashboard/dashboard";
import ClassroomPage from "./components/Scan Barcode/ScanBarcode";
import UsersPage from "./components/Users/users";
import CategoryPage from "./components/Category/category";

import "./App.css";
import SupplierPage from "./components/Supplier/supplier";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />}>
          <Route index element={<DashboardPage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="category" element={<CategoryPage />} />
          <Route path="supplier" element={<SupplierPage />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div className="content">
        <Router>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
              <Toaster />
            </ToastProvider>
          </ThemeProvider>
        </Router>
      </div>
    </main>
  );
}

export default App;
