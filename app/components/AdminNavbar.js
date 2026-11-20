"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { can } from "@/lib/rbac";

const STAFF_ROLES = ["superadmin", "admin", "sales"];

export default function AdminNavbar({ user }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const isStaff = user && STAFF_ROLES.includes(user.role);

  const navLinkStyle = (path) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
    color: pathname === path ? "#ffffff" : "#cbd5e1",
    background: pathname === path ? "#ef4444" : "rgba(255, 255, 255, 0.08)",
    border: pathname === path ? "1px solid #ef4444" : "1px solid #334155",
    transition: "0.2s",
  });

  return (
    <nav
      className="dashboard-navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        padding: "14px 24px",
      }}
    >
      <Link href="/dashboard" className="nav-logo" style={{ textDecoration: "none" }}>
        ⚙️ AutoMarket Backend
      </Link>

      {/* ปุ่มเมนูบน Navbar ตามกรอบสีแดง */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Link href="/dashboard" style={navLinkStyle("/dashboard")}>
          🏠 แผงควบคุม
        </Link>

        <Link href="/cars" style={navLinkStyle("/cars")}>
          🚘 หน้าร้าน / เพิ่มรถ
        </Link>

        {isStaff && (
          <Link href="/dashboard/stats" style={navLinkStyle("/dashboard/stats")}>
            📊 สถิติ & สต็อกรถ
          </Link>
        )}

        {user && can(user.role, "user:manage") && (
          <Link href="/admin/users" style={navLinkStyle("/admin/users")}>
            👥 จัดการสมาชิก
          </Link>
        )}

        <button onClick={handleLogout} className="btn-logout-nav">
          🚪 ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}