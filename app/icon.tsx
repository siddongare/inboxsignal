import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060709",
          borderRadius: 8,
          border: "1.5px solid rgba(212, 255, 0, 0.4)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mikalai Geometric Hexagon / Origami Facet */}
          <polygon
            points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
            stroke="#D4FF00"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Signal Core */}
          <circle cx="12" cy="12" r="3.2" fill="#D4FF00" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
