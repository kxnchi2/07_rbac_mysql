"use client";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success: {
      borderLeft: "4px solid #10b981",
      icon: "✅",
      titleColor: "#10b981",
    },
    error: {
      borderLeft: "4px solid #ef4444",
      icon: "❌",
      titleColor: "#ef4444",
    },
    warning: {
      borderLeft: "4px solid #f59e0b",
      icon: "⚠️",
      titleColor: "#f59e0b",
    },
    info: {
      borderLeft: "4px solid #38bdf8",
      icon: "ℹ️",
      titleColor: "#38bdf8",
    },
  };

  const current = styles[toast.type] || styles.info;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        minWidth: "280px",
        maxWidth: "380px",
        background: "#18181b",
        color: "#f8fafc",
        padding: "16px 20px",
        borderRadius: "10px",
        border: "1px solid #27272a",
        borderLeft: current.borderLeft,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        animation: "slideIn 0.25s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "18px", lineHeight: "1.2" }}>{current.icon}</span>
        <div>
          {toast.title && (
            <div style={{ fontWeight: "bold", fontSize: "14px", color: current.titleColor, marginBottom: "2px" }}>
              {toast.title}
            </div>
          )}
          <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.4" }}>
            {toast.message}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#71717a",
          cursor: "pointer",
          fontSize: "16px",
          padding: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}