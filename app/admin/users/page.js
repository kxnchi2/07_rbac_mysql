"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PERMISSIONS } from "@/lib/rbac";

const ALL_ROLES = Object.keys(PERMISSIONS);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  // โหลดข้อมูลผู้ใช้ปัจจุบัน (เพื่อเช็กว่าเป็น admin หรือ superadmin)
  const loadCurrentUser = () => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user || data));
  };

  // โหลดรายชื่อผู้ใช้ทั้งหมดจาก API
  const loadUsers = () => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  };

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  // ส่ง PUT เพื่อเปลี่ยน role แล้วโหลดรายชื่อใหม่
  const handleRoleChange = async (id, role) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Role updated" : data.message);
    loadUsers();
  };

  const isSuperAdmin = currentUser?.role === "superadmin";

  // ตัวเลือก role ที่อนุญาตให้เลือกใน Dropdown
  const availableRoles = isSuperAdmin
    ? ALL_ROLES // superadmin เลือกได้ทั้งหมด
    : ALL_ROLES.filter((r) => !["sales", "admin", "superadmin"].includes(r)); // admin เลือกได้แค่ customer

  return (
    <div className="page">
      <Link href="/dashboard">← Dashboard</Link>
      <h1>Manage Users</h1>
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
            // ถ้าไม่ใช่ superadmin จะแก้คนที่เป็น sales, admin, superadmin ไม่ได้
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
                    {/* แสดงค่าปัจจุบันค้างไว้ กรณีเป็น role ที่ถูกซ่อนจากตัวเลือก */}
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
      {message && <p>{message}</p>}
    </div>
  );
}