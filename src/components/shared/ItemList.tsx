import React from "react";

interface Item {
  t?: string;
  name?: string;
  d?: string;
  desc?: string;
}

interface ItemListProps {
  items: Item[];
  color: string;
  numbered: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, color, numbered }) => (
  <>
    {items.map((it, i) => (
      <div key={i} style={{
        padding: "10px 16px", borderBottom: "1px solid #f0ece7",
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        {numbered && (
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: color + "12", color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {i + 1}
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{it.t || it.name}</div>
          <div style={{ fontSize: 11, color: "#6b6560", lineHeight: 1.5, marginTop: 1 }}>{it.d || it.desc}</div>
        </div>
      </div>
    ))}
  </>
);

export default ItemList;
