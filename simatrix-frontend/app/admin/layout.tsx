import React from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#f8f9fa] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
