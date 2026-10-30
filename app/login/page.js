"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ส่งอีเมลและรหัสผ่าน หากสำเร็จ API จะตั้ง cookie token ให้
  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      // โหลดหน้าใหม่ทั้งหน้า ให้ proxy.js ตรวจ cookie ที่เพิ่งได้รับ
      window.location.href = "/dashboard";
    } else {
      setMessage(data.message); // เช่น "Invalid email or password"
    }
  };

  return (
    <div className="auth-box">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p className="error">{message}</p>}
      <p>
        No account yet? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}