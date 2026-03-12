import React from "react";

export const fontSerif: React.CSSProperties = { fontFamily: "'Newsreader',Georgia,serif" };
export const fontMono: React.CSSProperties = { fontFamily: "'IBM Plex Mono',monospace" };

export const labelStyle: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: ".12em",
  textTransform: "uppercase", fontFamily: "'IBM Plex Mono',monospace", marginBottom: 10,
};

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid #e0dcd7",
  fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#1a1d23",
  background: "#fff", outline: "none",
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "none" as const, cursor: "pointer", paddingRight: 28,
};

export function compress(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const ratio = Math.min(800 / img.width, 1);
        c.width = img.width * ratio;
        c.height = img.height * ratio;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.5));
      };
      img.src = e.target!.result as string;
    };
    r.readAsDataURL(file);
  });
}

export const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
