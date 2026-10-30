"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // โหลดข้อมูลรถปัจจุบันมาใส่ฟอร์ม
  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setBrand(data.brand);
        setModel(data.model);
        setPrice(data.price);
        setDescription(data.description);
      });
  }, [id]);

  // ส่ง PUT เพื่อบันทึก แล้วกลับไปหน้ารายการ
  const handleUpdate = async (event) => {
    event.preventDefault();
    await fetch(`/api/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, price, description }),
    });
    router.push("/dashboard"); // กลับไปหน้าหลักหลังจากกด Save
  };

  return (
    <div className="auth-box">
      <h1>Edit Car</h1>
      <form onSubmit={handleUpdate}>
        <input 
          placeholder="Brand (เช่น Toyota, Honda)"
          value={brand} 
          onChange={(event) => setBrand(event.target.value)} 
          required
        />
        <input 
          placeholder="Model (เช่น Camry, Civic)"
          value={model} 
          onChange={(event) => setModel(event.target.value)} 
          required
        />
        <input 
          type="number"
          placeholder="Price (ราคา)"
          value={price} 
          onChange={(event) => setPrice(event.target.value)} 
          required
        />
        <textarea
          placeholder="Description (รายละเอียดเพิ่มเติม)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}