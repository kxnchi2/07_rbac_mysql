"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CarCard from "@/app/components/CarCard";
import { can } from "@/lib/rbac";

const POPULAR_BRANDS = ["Toyota", "Honda", "Isuzu", "Mazda", "Mitsubishi", "Nissan", "Ford", "BYD", "Tesla", "BMW", "Mercedes-Benz"];

export default function CarsPage() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  
  // State สำหรับฟอร์มเพิ่มรถ
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("new"); // 'new' = ป้ายแดง, 'used' = มือสอง
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // State สำหรับระบบค้นหาและแบ่งหมวดหมู่
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' | 'new' | 'used'

  const loadCars = () => {
    fetch("/api/cars")
      .then((response) => response.json())
      .then((data) => setCars(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
      
    loadCars();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, price, description, image, category }),
    });
    if (res.ok) {
      alert("เพิ่มรถเข้าโชว์รูมเรียบร้อยแล้ว!");
      setBrand(""); setModel(""); setPrice(""); setCategory("new"); setDescription(""); setImage("");
      loadCars();
    }
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

  // กรองรถตาม หมวดหมู่ + ยี่ห้อ + ชื่อรุ่น
  const filteredCars = cars.filter((car) => {
    const matchCategory = selectedCategory === "all" || (car.category || "new") === selectedCategory;
    const matchBrand = selectedBrand === "" || car.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchModel = car.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchBrand && matchModel;
  });

  const uniqueBrands = [...new Set(cars.map((item) => item.brand))];
  const newCarsCount = cars.filter((c) => (c.category || "new") === "new").length;
  const usedCarsCount = cars.filter((c) => c.category === "used").length;

  return (
    <div className="marketplace-layout">
      {/* แถบ Navbar */}
      <nav className="top-navbar">
        <div className="nav-container">
          <Link href="/cars" onClick={() => setSelectedCategory("all")} className="nav-logo">🚗 AutoMarket</Link>
          <div className="nav-menu">
            <button onClick={() => setSelectedCategory("all")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit" }}>รถทั้งหมด</button>
            <button onClick={() => setSelectedCategory("new")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit" }}>รถป้ายแดง</button>
            <button onClick={() => setSelectedCategory("used")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit" }}>รถมือสอง</button>
            
            {user ? (
              <Link href="/dashboard" className="btn-nav-dashboard">
                👤 {user.fullname} ({user.role})
              </Link>
            ) : (
              <Link href="/login" className="btn-nav-dashboard" style={{ backgroundColor: "#10b981", fontWeight: "bold" }}>
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
            {uniqueBrands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อรุ่นรถ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มแท็บเลือกหมวดหมู่สำหรับลูกค้า */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "18px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "8px 20px", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: "bold",
              background: selectedCategory === "all" ? "#ef4444" : "rgba(255,255,255,0.15)", color: "#fff"
            }}
          >
            🚘 รถทั้งหมด ({cars.length})
          </button>
          <button
            onClick={() => setSelectedCategory("new")}
            style={{
              padding: "8px 20px", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: "bold",
              background: selectedCategory === "new" ? "#10b981" : "rgba(255,255,255,0.15)", color: "#fff"
            }}
          >
            ✨ รถป้ายแดง ({newCarsCount})
          </button>
          <button
            onClick={() => setSelectedCategory("used")}
            style={{
              padding: "8px 20px", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: "bold",
              background: selectedCategory === "used" ? "#f59e0b" : "rgba(255,255,255,0.15)", color: "#fff"
            }}
          >
            🏷️ รถมือสอง ({usedCarsCount})
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* ฟอร์มเพิ่มรถแบบใช้งานง่ายสำหรับ Admin / Sales */}
        {user && can(user.role, "car:create") && (
          <div className="admin-panel" style={{ background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "16px", color: "#fff" }}>⚙️ เพิ่มรถยนต์เข้าโชว์รูม ({user.role})</h3>
            <form onSubmit={handleCreate} className="news-form car-form" style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>หมวดหมู่รถยนต์ *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px" }}>
                    <option value="new">✨ รถป้ายแดง (New Car)</option>
                    <option value="used">🏷️ รถมือสอง (Used Car)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>ยี่ห้อ (เลือกหรือพิมพ์เอง) *</label>
                  <input
                    list="brand-options"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="เช่น Toyota, Honda..."
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  />
                  <datalist id="brand-options">
                    {POPULAR_BRANDS.map((b) => <option key={b} value={b} />)}
                  </datalist>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>ชื่อรุ่น (Model) *</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="เช่น Civic RS, Fortuner..."
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>ราคา (บาท) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="เช่น 899000"
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>ลิงก์รูปภาพรถ (Image URL)</label>
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="วางลิงก์รูปภาพ https://..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                />
                {image && (
                  <img
                    src={image}
                    alt="Preview"
                    style={{ marginTop: "8px", maxHeight: "120px", borderRadius: "8px", border: "1px solid #475569" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม เช่น ปีรถ, เลขไมล์, สี, โปรโมชัน..."
                rows={2}
                style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
              />
              <button type="submit" className="btn-add" style={{ padding: "12px", fontWeight: "bold" }}>
                ➕ เพิ่มรถเข้าโชว์รูม
              </button>
            </form>
          </div>
        )}

        <h3 className="section-title">
          {selectedCategory === "new" ? "✨ รถป้ายแดง" : selectedCategory === "used" ? "🏷️ รถมือสอง" : "🚘 รถแนะนำทั้งหมด"} ({filteredCars.length} คัน)
        </h3>
        
        <div className="car-grid">
          {filteredCars.map((item) => (
            <div key={item.id} style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute", top: "10px", left: "10px", zIndex: 10,
                  padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold",
                  background: item.category === "used" ? "#f59e0b" : "#10b981", color: "#fff"
                }}
              >
                {item.category === "used" ? "รถมือสอง" : "รถป้ายแดง"}
              </span>
              <CarCard
                item={item}
                canEdit={user ? can(user.role, "car:update") : false}
                canDelete={user ? can(user.role, "car:delete") : false}
                onDelete={handleDelete}
                onBuy={handleBuy}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ส่วนแสดงที่อยู่และข้อมูลติดต่อร้าน */}
      <footer
        style={{
          marginTop: "60px",
          background: "#0f172a",
          borderTop: "2px solid #ef4444",
          padding: "32px 20px",
          textAlign: "center",
          color: "#cbd5e1",
        }}
      >
        <h3 style={{ color: "#ffffff", fontSize: "1.2rem", marginBottom: "10px" }}>
          🚗 AutoMarket โชว์รูมรถยนต์ป้ายแดง & มือสอง
        </h3>
        <p style={{ fontSize: "15px", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto 8px auto" }}>
          📍 <strong>ที่ตั้งร้าน:</strong> จ.ปทุมธานี อ.ลำลูกกา ต.คูคต ซ.ไม่รู้ถามพ่อมึงดู 888/888 ข้างบ้านเอ็มออนิว
        </p>
        <p style={{ fontSize: "16px", color: "#38bdf8", fontWeight: "bold", margin: 0 }}>
          📞 เบอร์โทรเมียน้อย: 099-999-9999
        </p>
      </footer>
    </div>
  );
}