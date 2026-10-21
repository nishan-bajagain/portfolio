import { ImageResponse } from "next/og"

export const alt = "Nishan Bajagain - Software Developer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "#101827",
        color: "#f9fafb",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ color: "#34d399", fontSize: 32, marginBottom: 20 }}>PORTFOLIO</div>
      <div style={{ fontSize: 76, fontWeight: 700 }}>Nishan Bajagain</div>
      <div style={{ color: "#cbd5e1", fontSize: 38, marginTop: 18 }}>Software Developer</div>
    </div>,
    size,
  )
}
