import React from "react";

interface Props {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<Props> = ({ src, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.85)", display: "flex",
      alignItems: "center", justifyContent: "center", cursor: "zoom-out",
    }}
  >
    <img
      src={src}
      alt="Report image"
      style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 6, boxShadow: "0 8px 40px rgba(0,0,0,.5)" }}
      onClick={(e) => e.stopPropagation()}
    />
    <div
      onClick={onClose}
      style={{
        position: "absolute", top: 16, right: 20,
        color: "white", fontSize: 28, cursor: "pointer", lineHeight: 1,
      }}
    >
      ✕
    </div>
  </div>
);

export default ImageModal;
