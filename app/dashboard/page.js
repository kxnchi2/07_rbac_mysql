"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";

const CAN_VIEW_ORDERS = ["superadmin", "admin", "sales"];

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        
        if (CAN_VIEW_ORDERS.includes(userData.role)) {
          fetch("/api/orders")
            .then((res) => (res.ok ? res.json() : []))
            .then((orderData) => setOrders(Array.isArray(orderData) ? orderData : []));
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (!user) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading Dashboard...</div>;
  }

  const isStaff = CAN_VIEW_ORDERS.includes(user.role);

  return (
    <div className="dashboard-layout">
      {/* แถบ Navbar ด้านบนที่มีปุ่มครบทุกหน้า */}
      <AdminNavbar user={user} />

      <div className="dashboard-content">
        <div className="welcome-header">
          <h1>ยินดีต้อนรับ, {user.fullname}</h1>
          <p>แผงควบคุมหลักสำหรับจัดการระบบโชว์รูมรถยนต์</p>
        </div>

        {/* การ์ดข้อมูลส่วนตัว */}
        <div className="dashboard-grid">
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
        </div>

        {/* ตารางรายการลูกค้าที่กดจองรถ */}
        {isStaff && (
          <div className="orders-section" style={{ marginTop: "32px", background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
            <h2 style={{ borderBottom: "2px solid #334155", paddingBottom: "12px", marginBottom: "20px", color: "#ffffff", fontSize: "1.25rem" }}>
              📋 รายการลูกค้าที่กดจองรถยนต์ ({orders.length} รายการ)
            </h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc" }}>
                <thead>
                  <tr style={{ background: "#0f172a", textAlign: "left", color: "#94a3b8" }}>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>วันที่ลูกค้าจอง</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ชื่อลูกค้า</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>เบอร์โทรศัพท์ / อีเมล</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>รถที่สนใจ</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>หมวดหมู่</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "12px", color: "#cbd5e1", fontSize: "14px" }}>{formatDate(order.orderDate)}</td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{order.customerName}</td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ color: "#38bdf8", fontWeight: "bold" }}>{order.customerPhone || "-"}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{order.customerEmail}</div>
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold", color: "#fff" }}>
                          {order.carBrand} {order.carModel}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: order.carCategory === "used" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
                            color: order.carCategory === "used" ? "#f59e0b" : "#10b981",
                            padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold"
                          }}>
                            {order.carCategory === "used" ? "รถมือสอง" : "รถป้ายแดง"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{Number(order.carPrice).toLocaleString()} ฿</td>
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