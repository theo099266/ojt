import { Outlet } from "react-router-dom";
import Sidebar from "../shellroute/sidebar";
import AppBar from "../shellroute/appbar";

export default function DashboardLayout() {
  return (
    // Added overflow-hidden here
    <div className="flex h-screen bg-gray-100 overflow-hidden"> 
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppBar />

        <main className="flex-1 overflow-auto p-6 bg-[#F1E2F4]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}