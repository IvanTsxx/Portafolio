/** biome-ignore-all lint/suspicious/noExplicitAny: <necessary> */
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  const fontData = await fetch(
    new URL(
      "https://raw.githubusercontent.com/vercel/satori/main/playground/public/inter-latin-ext-700-normal.woff",
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

  const logoPath = join(process.cwd(), "public", "android-chrome-192x192.png");
  const logoData = readFileSync(logoPath);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "#fbfbfb",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#18181b",
        }}
      >
        Post no encontrado
      </div>,
      { ...size },
    );
  }

  if (post.coverImage) {
    const coverImage = post.coverImage.replace(/\.webp$/, ".png");
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
          src={coverImage}
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
            padding: "60px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
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
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#e4e4e7",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <img
              src={logoData.buffer as any}
              alt="Logo"
              width={48}
              height={48}
              style={{ borderRadius: "12px" }}
            />
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
        backgroundColor: "#fbfbfb", // Light background from screenshot
        backgroundImage:
          "radial-gradient(circle at 80% 20%, rgba(94, 156, 118, 0.1) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(94, 156, 118, 0.08) 0%, transparent 40%)", // Subtle sage green blobs (approx. primary)
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: "#5E9C76", // Primary color (Sage Green approx)
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          Blog Post
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            lineHeight: 1.05,
            marginBottom: 10,
            color: "#18181b", // Dark text
            letterSpacing: "-0.03em",
          }}
        >
          {`${post.title.slice(0, 100)}...`}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#8c8c92", // Muted text
            maxWidth: "900px",
            lineHeight: 1.4,
            fontWeight: "lighter",
          }}
        >
          {`${post.description?.slice(0, 120)}...` || ""}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <img
          src={logoData.buffer as any}
          alt="Logo"
          width={64}
          height={64}
          style={{ borderRadius: "16px" }}
        />
        <div style={{ fontSize: 32, fontWeight: "bold", color: "#18181b" }}>
          ivantsx/blog
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
