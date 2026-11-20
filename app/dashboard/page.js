"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { can } from "@/lib/rbac";

const CAN_VIEW_STATS = ["superadmin", "admin", "sales"];

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
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Not logged in");
      })
      .then((userData) => {
        setUser(userData);
        
        if (CAN_VIEW_STATS.includes(userData.role)) {
          fetch("/api/orders")
            .then((res) => (res.ok ? res.json() : []))
            .then((orderData) => setOrders(Array.isArray(orderData) ? orderData : []));

          fetch("/api/cars")
            .then((res) => (res.ok ? res.json() : []))
            .then((carData) => setCars(Array.isArray(carData) ? carData : []));
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

  const isStaff = CAN_VIEW_STATS.includes(user.role);

  const totalCars = cars.length;
  const soldCarsCount = cars.filter((c) => c.status === "sold" || c.status === "reserved").length || orders.length;
  const availableCarsCount = Math.max(0, totalCars - soldCarsCount);
  const totalSalesAmount = orders.reduce((sum, item) => sum + Number(item.carPrice || 0), 0);

  return (
    <div className="dashboard-layout">
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

          <Link href="/cars" className="dash-card action-card">
            <div className="action-icon">🚘</div>
            <div>
              <h3>รายการรถยนต์ / เพิ่มรถ</h3>
              <p>ดูหน้าร้าน แบ่งหมวดป้ายแดง-มือสอง หรือเพิ่มรถใหม่</p>
            </div>
          </Link>

          {can(user.role, "user:manage") && (
            <Link href="/admin/users" className="dash-card action-card admin-only">
              <div className="action-icon">👥</div>
              <div>
                <h3>จัดการบัญชีผู้ใช้งาน</h3>
                <p>กำหนดสิทธิ์ (Role) ผู้ใช้งานในระบบ</p>
              </div>
            </Link>
          )}
        </div>

        {isStaff && (
          <>
            {/* การ์ดสรุปสถิติ 4 ช่อง */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "32px" }}>
              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "6px" }}>🚘 รถที่นำเข้าขายทั้งหมด</p>
                <h2 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>{totalCars} <span style={{ fontSize: "14px", fontWeight: "normal" }}>คัน</span></h2>
              </div>

              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "6px" }}>🤝 จอง / ขายไปแล้ว</p>
                <h2 style={{ color: "#10b981", fontSize: "28px", margin: 0 }}>{soldCarsCount} <span style={{ fontSize: "14px", fontWeight: "normal" }}>คัน</span></h2>
              </div>

              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "6px" }}>✨ รถคงเหลือพร้อมขาย</p>
                <h2 style={{ color: "#38bdf8", fontSize: "28px", margin: 0 }}>{availableCarsCount} <span style={{ fontSize: "14px", fontWeight: "normal" }}>คัน</span></h2>
              </div>

              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "6px" }}>💰 มูลค่ายอดจองรวม</p>
                <h2 style={{ color: "#f59e0b", fontSize: "24px", margin: 0 }}>{totalSalesAmount.toLocaleString()} ฿</h2>
              </div>
            </div>

            {/* ตารางที่ 1: รายการลูกค้าที่กดจองรถ + วันที่จอง */}
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

            {/* ตารางที่ 2: สต็อกรถที่นำเข้าขายทั้งหมด + วันนำเข้า */}
            <div className="orders-section" style={{ marginTop: "32px", background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
              <h2 style={{ borderBottom: "2px solid #334155", paddingBottom: "12px", marginBottom: "20px", color: "#ffffff", fontSize: "1.25rem" }}>
                🚘 สต็อกรถยนต์ที่นำเข้าขาย ({cars.length} คัน)
              </h2>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc" }}>
                  <thead>
                    <tr style={{ background: "#0f172a", textAlign: "left", color: "#94a3b8" }}>
                      <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>วันที่นำเข้า</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ยี่ห้อ / รุ่น</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>หมวดหมู่</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ราคา</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car) => (
                      <tr key={car.id} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "12px", color: "#cbd5e1", fontSize: "14px" }}>{formatDate(car.created_at)}</td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{car.brand} {car.model}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: car.category === "used" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
                            color: car.category === "used" ? "#f59e0b" : "#10b981",
                            padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold"
                          }}>
                            {car.category === "used" ? "รถมือสอง" : "รถป้ายแดง"}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>{Number(car.price).toLocaleString()} ฿</td>
                        <td style={{ padding: "12px" }}>
                          {car.status === "sold" || car.status === "reserved" ? (
                            <span style={{ color: "#ef4444", fontWeight: "bold" }}>● ขาย/จองแล้ว</span>
                          ) : (
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>● พร้อมขาย</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}