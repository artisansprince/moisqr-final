// app/admin/dashboard/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Jika token tidak ada, redirect ke halaman login
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-5">
        <h1 className="text-3xl">Admin Dashboard</h1>
        <p>Selamat datang di halaman dashboard admin.</p>
        {/* Konten dashboard lainnya */}
      </div>
    </div>
  );
}
