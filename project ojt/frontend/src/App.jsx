import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Future Pages */}
        {/* <Route path="/cash-advances" element={<CashAdvances />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}
        {/* <Route path="/users" element={<Users />} /> */}
      </Route>
    </Routes>
  );
}

export default App;