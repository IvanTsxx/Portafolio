import type { ReactNode } from "react";

export default function BlogPostTemplate({
  title,
  author,
  date,
  category,
  avatar,
}: {
  title: ReactNode;
  author: ReactNode;
  date: ReactNode;
  category: ReactNode;
  avatar?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        color: "white",
        backgroundImage:
          "radial-gradient(circle at 100% 0%, rgba(96, 148, 110, 0.2) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(96, 148, 110, 0.1) 0%, transparent 40%)",
        padding: "80px",
        justifyContent: "space-between",
        fontFamily: 'Inter, "Material Icons", sans-serif',
      }}
    >
      {/* Category */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div
          style={{
            backgroundColor: "rgba(96, 148, 110, 0.2)",
            color: "#86efac",
            border: "1px solid rgba(96, 148, 110, 0.5)",
            padding: "8px 24px",
            borderRadius: "9999px",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
      </div>

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h1
          style={{
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(to bottom right, #ffffff 30%, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            border: "2px solid #60946E",
            boxShadow: "0 0 20px rgba(96, 148, 110, 0.3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height="80"
            src={avatar}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            width="80"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: "white" }}>
            {author}
          </span>
          <span style={{ fontSize: 20, color: "#a1a1aa", marginTop: "4px" }}>
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
