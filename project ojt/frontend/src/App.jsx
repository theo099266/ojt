import { Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import Dashboard from "./navigation_direction/Dashboard";
import Reporting from "./navigation_direction/Reporting";
import Logs  from "./navigation_direction/Logs";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Reporting" element={<Reporting />} />
        <Route path="/Logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}

export default App;