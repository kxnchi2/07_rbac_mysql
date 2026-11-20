"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";

const CAN_VIEW_ALL_ORDERS = ["superadmin", "admin", "sales"];

const STATUS_LABELS = {
  pending: { text: "⏳ รอดำเนินการ", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" },
  contacted: { text: "📞 ติดต่อลูกค้าแล้ว", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.2)" },
  sold: { text: "✅ ปิดการขายสำเร็จ", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)" },
  cancelled: { text: "❌ ยกเลิกการจอง", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" },
};

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

  const loadOrders = () => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((orderData) => setOrders(Array.isArray(orderData) ? orderData : []));
  };

  useEffect(() => {
    fetch("/api/me")
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Not logged in");
      })
      .then((userData) => {
        setUser(userData);
        loadOrders();
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      loadOrders();
    } else {
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  if (!user) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading Dashboard...</div>;
  }

  const isStaff = CAN_VIEW_ALL_ORDERS.includes(user.role);

  return (
    <div className="dashboard-layout">
      <AdminNavbar user={user} />

      <div className="dashboard-content">
        <div className="welcome-header">
          <h1>ยินดีต้อนรับ, {user.fullname}</h1>
          <p>{isStaff ? "แผงควบคุมหลักสำหรับจัดการระบบโชว์รูมรถยนต์" : "ตรวจสอบข้อมูลส่วนตัวและสถานะการจองรถยนต์ของคุณ"}</p>
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

        {/* ตารางรายการจอง (ทีมงานเห็นทั้งหมดและเปลี่ยนสถานะได้ / ลูกค้าเห็นเฉพาะของตัวเอง) */}
        <div className="orders-section" style={{ marginTop: "32px", background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
          <h2 style={{ borderBottom: "2px solid #334155", paddingBottom: "12px", marginBottom: "20px", color: "#ffffff", fontSize: "1.25rem" }}>
            {isStaff
              ? `📋 รายการลูกค้าที่กดจองรถยนต์ (${orders.length} รายการ)`
              : `🚘 ประวัติการจองรถยนต์ของคุณ (${orders.length} รายการ)`}
          </h2>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc" }}>
              <thead>
                <tr style={{ background: "#0f172a", textAlign: "left", color: "#94a3b8" }}>
                  <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>วันที่จอง</th>
                  {isStaff && <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ชื่อลูกค้า</th>}
                  {isStaff && <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>เบอร์โทรศัพท์ / อีเมล</th>}
                  <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>รถที่สนใจ</th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>หมวดหมู่</th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ราคา</th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const statusInfo = STATUS_LABELS[order.orderStatus] || STATUS_LABELS.pending;
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "12px", color: "#cbd5e1", fontSize: "14px" }}>{formatDate(order.orderDate)}</td>
                        {isStaff && <td style={{ padding: "12px", fontWeight: "bold" }}>{order.customerName}</td>}
                        {isStaff && (
                          <td style={{ padding: "12px" }}>
                            <div style={{ color: "#38bdf8", fontWeight: "bold" }}>{order.customerPhone || "-"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{order.customerEmail}</div>
                          </td>
                        )}
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
                        <td style={{ padding: "12px" }}>
                          {isStaff ? (
                            <select
                              value={order.orderStatus || "pending"}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{
                                background: statusInfo.bg,
                                color: statusInfo.color,
                                border: `1px solid ${statusInfo.color}`,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              <option value="pending" style={{ background: "#0f172a", color: "#f59e0b" }}>⏳ รอดำเนินการ</option>
                              <option value="contacted" style={{ background: "#0f172a", color: "#38bdf8" }}>📞 ติดต่อลูกค้าแล้ว</option>
                              <option value="sold" style={{ background: "#0f172a", color: "#10b981" }}>✅ ปิดการขายสำเร็จ</option>
                              <option value="cancelled" style={{ background: "#0f172a", color: "#ef4444" }}>❌ ยกเลิกการจอง</option>
                            </select>
                          ) : (
                            <span style={{
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              border: `1px solid ${statusInfo.color}`,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}>
                              {statusInfo.text}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isStaff ? 7 : 5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                      {isStaff ? "ยังไม่มีรายการสั่งซื้อในขณะนี้" : "คุณยังไม่มีรายการจองรถยนต์"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}