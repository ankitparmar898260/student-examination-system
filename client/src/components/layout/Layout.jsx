import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-[#0F172A]">
      {/* Sidebar (left, fixed width w-64) */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* White Topbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
