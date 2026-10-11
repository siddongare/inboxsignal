import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060709",
          borderRadius: 40,
          border: "4px solid rgba(212, 255, 0, 0.4)",
          boxShadow: "0 0 40px rgba(212, 255, 0, 0.15)",
        }}
      >
        <svg
          width="104"
          height="104"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
            stroke="#D4FF00"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.2" fill="#D4FF00" />
          <line x1="12" y1="2" x2="12" y2="7" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.2" />
          <line x1="12" y1="17" x2="12" y2="22" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
