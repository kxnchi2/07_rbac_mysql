"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";
import Toast from "@/app/components/Toast";

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

// Component แสดงรูปโปรไฟล์ (ถ้าไม่มีรูปจะแสดงตัวอักษรแรกของชื่อ)
function UserAvatar({ src, name, size = 44 }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ef4444",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #334155, #1e293b)",
        border: "2px solid #475569",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: `${Math.round(size * 0.42)}px`,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);

  // State สำหรับแก้ไขรูปโปรไฟล์
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

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
        setAvatarInput(userData.avatar || "");
        loadOrders();
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  // ย่อขนาดรูปเมื่ออัปโหลดจากเครื่องเพื่อให้บันทึกได้รวดเร็ว
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200; // ย่อขนาดเป็น 200x200px
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setAvatarInput(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/me/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarInput }),
      });

      if (res.ok) {
        setUser((prev) => ({ ...prev, avatar: avatarInput }));
        setIsEditingAvatar(false);
        showToast("success", "อัปเดตรูปโปรไฟล์แล้ว", "บันทึกรูปโปรไฟล์ใหม่เรียบร้อย");
        loadOrders(); // โหลดตารางใหม่เผื่อมีรายการจองของตัวเอง
      } else {
        showToast("error", "บันทึกไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const label = STATUS_LABELS[newStatus]?.text || newStatus;
      showToast("success", "อัปเดตสถานะแล้ว", `เปลี่ยนสถานะเป็น "${label}" เรียบร้อย`);
      loadOrders();
    } else {
      showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  if (!user) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading Dashboard...</div>;
  }

  const isStaff = CAN_VIEW_ALL_ORDERS.includes(user.role);

  return (
    <div className="dashboard-layout">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <AdminNavbar user={user} />

      <div className="dashboard-content">
        <div className="welcome-header">
          <h1>ยินดีต้อนรับ, {user.fullname}</h1>
          <p>{isStaff ? "แผงควบคุมหลักสำหรับจัดการระบบโชว์รูมรถยนต์" : "ตรวจสอบข้อมูลส่วนตัวและสถานะการจองรถยนต์ของคุณ"}</p>
        </div>

        {/* การ์ดข้อมูลส่วนตัว + ระบบเปลี่ยนรูปโปรไฟล์ */}
        <div className="dashboard-grid">
          <div className="dash-card profile-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", width: "100%" }}>
              <UserAvatar src={user.avatar} name={user.fullname} size={68} />
              <div className="profile-info" style={{ flex: 1 }}>
                <h3>ข้อมูลผู้ใช้งาน</h3>
                <p><strong>อีเมล:</strong> {user.email}</p>
                <p>
                  <strong>สิทธิ์การใช้งาน:</strong>{" "}
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                style={{
                  background: "#334155",
                  color: "#f8fafc",
                  border: "1px solid #475569",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {isEditingAvatar ? "✕ ปิด" : "📷 เปลี่ยนรูปโปรไฟล์"}
              </button>
            </div>

            {/* ฟอร์มเปลี่ยนรูปโปรไฟล์ (เลือกไฟล์จากเครื่อง หรือ วางลิงก์ URL) */}
            {isEditingAvatar && (
              <div
                style={{
                  width: "100%",
                  background: "#0f172a",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <UserAvatar src={avatarInput} name={user.fullname} size={54} />
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                      เลือกไฟล์รูปจากเครื่อง (JPG, PNG)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ fontSize: "13px", color: "#cbd5e1" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                    หรือวางลิงก์รูปภาพ (Image URL)
                  </label>
                  <input
                    type="text"
                    value={avatarInput.startsWith("data:") ? "" : avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  {avatarInput && (
                    <button
                      type="button"
                      onClick={() => setAvatarInput("")}
                      style={{
                        background: "transparent",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ลบรูป
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {savingAvatar ? "กำลังบันทึก..." : "💾 บันทึกรูปโปรไฟล์"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ตารางรายการจอง (แสดงรูปโปรไฟล์ลูกค้าคู่กับชื่อ) */}
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
                  {isStaff && <th style={{ padding: "12px", borderBottom: "1px solid #334155" }}>ลูกค้า</th>}
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
                        {isStaff && (
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <UserAvatar src={order.customerAvatar} name={order.customerName} size={38} />
                              <span style={{ fontWeight: "bold" }}>{order.customerName}</span>
                            </div>
                          </td>
                        )}
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