"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PERMISSIONS } from "@/lib/rbac";

// กรอง "sales" (มี s) ออกจากตัวเลือกทั้งหมด
const ROLES = Object.keys(PERMISSIONS).filter((role) => role !== "sales");

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  // โหลดรายชื่อผู้ใช้จาก API
  const loadUsers = () => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullname}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  disabled={user.role === "sales"}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                >
                  {user.role === "sales" && <option value="sales">sales</option>}
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && <p>{message}</p>}
    </div>
  );
}