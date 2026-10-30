"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CarCard from "@/app/components/CarCard";
import { can } from "@/lib/rbac";

export default function CarsPage() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  
  // State สำหรับฟอร์มเพิ่มรถ (รวมช่อง image)
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // State สำหรับระบบค้นหา
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const loadCars = () => {
    fetch("/api/cars")
      .then((response) => response.json())
      .then((data) => setCars(data));
  };

  useEffect(() => {
    fetch("/api/me")
      .then((response) => {
        if (response.ok) return response.json();
        return null;
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
      
    loadCars();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, price, description, image }),
    });
    setBrand(""); setModel(""); setPrice(""); setDescription(""); setImage("");
    loadCars();
  };

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบรถคันนี้ใช่หรือไม่?")) return;
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    loadCars();
  };

  const handleBuy = async (id) => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบ หรือ สมัครสมาชิก ก่อนทำการสั่งซื้อรถครับ");
      window.location.href = "/login";
      return;
    }

    if (!confirm("ยืนยันการสั่งซื้อรถคันนี้?")) return;
    await fetch(`/api/cars/${id}/buy`, { method: "POST" });
    alert("สั่งซื้อสำเร็จ! เซลส์จะทำการติดต่อกลับไปครับ");
    loadCars();
  };

  const filteredCars = Array.isArray(cars) ? cars.filter(car => {
    const matchBrand = selectedBrand === "" || car.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchModel = car.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBrand && matchModel;
  }) : [];

  const uniqueBrands = Array.isArray(cars) ? [...new Set(cars.map(item => item.brand))] : [];

  return (
    <div className="marketplace-layout">
      {/* แถบ Navbar สีแดง */}
      <nav className="top-navbar">
        <div className="nav-container">
          <Link href="/cars" className="nav-logo">🚗 AutoMarket</Link>
          <div className="nav-menu">
            <Link href="/cars">ซื้อรถยนต์</Link>
            <Link href="/cars">รถใหม่</Link>
            
            {user ? (
              <Link href="/dashboard" className="btn-nav-dashboard">
                👤 {user.fullname} ({user.role})
              </Link>
            ) : (
              <Link href="/login" className="btn-nav-dashboard" style={{ backgroundColor: '#10b981', fontWeight: 'bold' }}>
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ส่วนค้นหาและกรองข้อมูล */}
      <div className="search-banner">
        <h2>ค้นหารถยนต์ที่ใช่สำหรับคุณ</h2>
        <div className="search-box">
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="">ทุกยี่ห้อ</option>
            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อรุ่นรถ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="page-content">
        {/* ฟอร์มเพิ่มรถสำหรับ Admin / Sales (เพิ่มช่องกรอกลิงก์รูปภาพแล้ว) */}
        {user && can(user.role, "car:create") && (
          <div className="admin-panel">
            <h3>⚙️ ส่วนจัดการสำหรับ Admin (เพิ่มรถใหม่)</h3>
            <form onSubmit={handleCreate} className="news-form car-form">
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="ยี่ห้อ (Brand)" required />
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="รุ่น (Model)" required />
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ราคา (Price)" required />
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="ลิงก์รูปภาพรถ (Image URL เช่น https://...)" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" rows={2} />
              <button type="submit" className="btn-add">เพิ่มรถเข้าโชว์รูม</button>
            </form>
          </div>
        )}

        <h3 className="section-title">รถแนะนำสำหรับคุณ ({filteredCars.length} คัน)</h3>
        
        <div className="car-grid">
          {filteredCars.map((item) => (
            <CarCard
              key={item.id}
              item={item}
              canEdit={user ? can(user.role, "car:update") : false}
              canDelete={user ? can(user.role, "car:delete") : false}
              onDelete={handleDelete}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}