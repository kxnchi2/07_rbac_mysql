"use client";

import { useState, useEffect } from "react";
import { PERMISSIONS } from "@/lib/rbac";
import AdminNavbar from "@/app/components/AdminNavbar";
import Toast from "@/app/components/Toast";

const ALL_ROLES = Object.keys(PERMISSIONS);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCurrentUser = () => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          window.location.href = "/login";
          return;
        }
        setCurrentUser(data.user || data);
      });
  };

  const loadUsers = () => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          showToast("error", "โหลดข้อมูลไม่สำเร็จ", data.message || "ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
        }
      });
  };

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("success", "อัปเดตสิทธิ์สำเร็จ", `เปลี่ยนสิทธิ์ผู้ใช้งานเป็น "${role}" เรียบร้อยแล้ว`);
    } else {
      showToast("error", "ไม่อนุญาตให้ดำเนินการ", data.message || "เกิดข้อผิดพลาด");
    }
    loadUsers();
  };

  const isSuperAdmin = currentUser?.role === "superadmin";

  const availableRoles = isSuperAdmin
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => !["sales", "admin", "superadmin"].includes(r));

  return (
    <div className="dashboard-layout">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <AdminNavbar user={currentUser} />

      <div className="page">
        <h1>👥 Manage Users</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isLocked =
                !isSuperAdmin && ["sales", "admin", "superadmin"].includes(user.role);

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.fullname}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={isLocked || user.id === currentUser?.id}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    >
                      {!availableRoles.includes(user.role) && (
                        <option value={user.role}>{user.role}</option>
                      )}
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}