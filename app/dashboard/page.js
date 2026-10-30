"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { can } from "@/lib/rbac";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]); 

  useEffect(() => {
    fetch("/api/me")
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Not logged in");
      })
      .then((userData) => {
        setUser(userData);
        
        // ถ้าเป็น admin หรือ sale ให้ดึงข้อมูลรายการสั่งซื้อทั้งหมดมาแสดง
        if (userData.role === "admin" || userData.role === "sale") {
          fetch("/api/orders")
            .then((res) => res.ok ? res.json() : [])
            .then((orderData) => setOrders(orderData))
            .catch((err) => console.error("โหลดข้อมูลการสั่งซื้อไม่สำเร็จ", err));
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (!user) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* แถบเมนูด้านบนของแผงควบคุม */}
      <nav className="dashboard-navbar">
        <div className="nav-logo">⚙️ AutoMarket Backend</div>
        <button onClick={handleLogout} className="btn-logout-nav">🚪 ออกจากระบบ</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-header">
          <h1>ยินดีต้อนรับ, {user.fullname}</h1>
          <p>แผงควบคุมหลักสำหรับจัดการระบบโชว์รูมรถยนต์</p>
        </div>

        <div className="dashboard-grid">
          {/* การ์ดแสดงข้อมูลส่วนตัว */}
          <div className="dash-card profile-card">
            <div className="profile-icon">👤</div>
            <div className="profile-info">
              <h3>ข้อมูลผู้ใช้งาน</h3>
              <p><strong>อีเมล:</strong> {user.email}</p>
              <p>
                <strong>สิทธิ์การใช้งาน:</strong>{" "}
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </p>
            </div>
          </div>

          {/* การ์ดเมนู: ไปหน้าโชว์รูม */}
          <Link href="/cars" className="dash-card action-card">
            <div className="action-icon">🚘</div>
            <div>
              <h3>รายการรถยนต์</h3>
              <p>รถคันไหนที่ลูกค้าสนใจสามารถกดปุ่มได้ที่นี้เลย</p>
            </div>
          </Link>

          {/* การ์ดเมนู: จัดการผู้ใช้งาน (แสดงเฉพาะคนที่มีสิทธิ์) */}
          {can(user.role, "user:manage") && (
            <Link href="/admin/users" className="dash-card action-card admin-only">
              <div className="action-icon">👥</div>
              <div>
                <h3>จัดการบัญชีผู้ใช้งาน</h3>
                <p>กำหนดสิทธิ์ (Role) หรือลบผู้ใช้งาน (เฉพาะ Admin)</p>
              </div>
            </Link>
          )}
        </div>

        {/* 📋 ตารางแสดงรายการสั่งซื้อ (เห็นเฉพาะ Admin และ Sale) */}
        {(user.role === "admin" || user.role === "sale") && (
          <div className="orders-section" style={{ marginTop: "40px", background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
            <h2 style={{ borderBottom: "2px solid #334155", paddingBottom: "12px", marginBottom: "20px", color: "#ffffff", fontSize: "1.25rem" }}>
              📋 รายการลูกค้าที่กดสั่งซื้อรถยนต์
            </h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc" }}>
                <thead>
                  <tr style={{ background: "#0f172a", textAlign: "left", color: "#94a3b8" }}>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ชื่อลูกค้า</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>อีเมลติดต่อ</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>เบอร์โทรศัพท์</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>รถที่สนใจ (ยี่ห้อ / รุ่น)</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ราคา</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "12px" }}>{order.customerName}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{order.customerEmail}</td>
                        <td style={{ padding: "12px", color: "#38bdf8", fontWeight: "bold" }}>
                          {order.customerPhone || "-"}
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold", color: "#38bdf8" }}>
                          {order.carBrand} {order.carModel}
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{Number(order.carPrice).toLocaleString()} ฿</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", border: "1px solid #f59e0b", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold" }}>
                            รอดำเนินการ
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                        ยังไม่มีรายการสั่งซื้อในขณะนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}