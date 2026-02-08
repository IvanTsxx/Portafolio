import { ImageResponse } from "next/og";
import { getPost } from "@/app/actions/posts";

export const alt = "Iván Bongiovanni Blog Post";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Post no encontrado
      </div>,
      {
        ...size,
      },
    );
  }

  const fontData = await fetch(
    new URL(
      "https://raw.githubusercontent.com/vercel/satori/main/playground/public/inter-latin-ext-700-normal.woff",
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

  if (post.coverImage) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "#000",
        }}
      >
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.1,
              marginBottom: 20,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#e4e4e7",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            ivantsx.dev/blog
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ],
      },
    );
  }

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#09090b",
        color: "white",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
        backgroundSize: "100px 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Blog Post
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            lineHeight: 1.1,
            marginBottom: 20,
            color: "white",
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {post.description?.slice(0, 160) || ""}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#000",
            fontWeight: "bold",
          }}
        >
          IB
        </div>
        <div style={{ fontSize: 32, fontWeight: "bold", color: "white" }}>
          ivantsx.dev
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
