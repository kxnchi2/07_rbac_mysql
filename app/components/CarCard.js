import Link from "next/link";

export default function CarCard({ item, canEdit, canDelete, onDelete, onBuy }) {
  const isSold = item.status === 'sold';
  const carImage = item.image || `/${item.id}.png`;

  return (
    <div className="car-card">
      <img
        src={carImage} 
        alt={`${item.brand} ${item.model}`}
        onError={(event) => {
          event.currentTarget.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80";
        }}
      />
      <div className="car-info" style={{ padding: "15px" }}>
        <h2>{item.brand} {item.model}</h2>
        <p className="price" style={{ color: "#ef4444", fontWeight: "bold" }}>
          ฿{Number(item.price).toLocaleString()}
        </p>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{item.description}</p>
        
        <div style={{ marginTop: "12px", marginBottom: "12px" }}>
          {!isSold ? (
            <button 
              onClick={() => onBuy(item.id)} 
              style={{ backgroundColor: "#10b981", color: "white", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}
            >
              🛒 ซื้อรถคันนี้
            </button>
          ) : (
            <button 
              disabled 
              style={{ backgroundColor: "#d1d5db", color: "#6b7280", padding: "10px", border: "none", borderRadius: "8px", width: "100%", fontWeight: "bold", cursor: "not-allowed" }}
            >
              ❌ ขายแล้ว
            </button>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div style={{ display: "flex", gap: "10px", borderTop: "1px dashed #e5e7eb", paddingTop: "10px" }}>
            {canEdit && <Link href={`/cars/${item.id}/edit`} style={{ color: "#3b82f6" }}>Edit</Link>}
            {canDelete && <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}>Delete</button>}
          </div>
        )}
      </div>
    </div>
  );
}