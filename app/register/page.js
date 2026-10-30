"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // ส่งข้อมูลฟอร์มไปยัง API หากสำเร็จไปหน้า login
  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage(""); // เคลียร์ข้อความแจ้งเตือนเก่าก่อนกดส่ง

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password, phone }), 
      });

      // ดักจับการแปลง JSON ป้องกันหน้าเว็บล่มเวลามีข้อผิดพลาดจากเซิร์ฟเวอร์
      const data = await response.json().catch(() => ({ 
        message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ หรือไม่สามารถเชื่อมต่อฐานข้อมูลได้" 
      }));

      if (response.ok) {
        router.push("/login");
      } else {
        setMessage(data.message || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Register Error:", error);
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบการเชื่อมต่อ");
    }
  };

  return (
    <div className="auth-box">
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          value={fullname}
          onChange={(event) => setFullname(event.target.value)}
          placeholder="Full name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        
        {/* ช่องกรอกเบอร์โทรศัพท์ */}
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone Number (เบอร์โทรศัพท์)"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          minLength={6}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p className="error">{message}</p>}
      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}