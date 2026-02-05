const styles = {
  card: {
    width: 260,
    padding: 16,
    borderRadius: 12,
    border: "1px solid #eee",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    background: "#fff",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  image: {
    width: "100%",
    height: 180,
    objectFit: "contain" as const,
  },

  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000ff",
    lineHeight: "1.2em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },

  prices: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  oldPrice: {
    textDecoration: "line-through",
    color: "#888",
    fontSize: 13,
  },

  currentPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: "#16a34a",
  },

  badge: {
    alignSelf: "flex-start",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  button: {
    marginTop: "auto",
    textAlign: "center" as const,
    padding: "10px 12px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
  },
};

export { styles };
