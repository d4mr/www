import type { APIRoute, GetStaticPaths } from "astro";
import type { ReactNode } from "react";
import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Load fonts
async function loadFonts() {
  const fontsDir = path.join(process.cwd(), "src/assets/fonts");
  
  const [newsreaderRegular, newsreaderLight, jetbrainsMono, notoSansJP] = await Promise.all([
    fs.readFile(path.join(fontsDir, "Newsreader-Regular.ttf")),
    fs.readFile(path.join(fontsDir, "Newsreader-Light.ttf")),
    fs.readFile(path.join(fontsDir, "JetBrainsMono-Regular.ttf")),
    fs.readFile(path.join(fontsDir, "NotoSansJP-Regular.ttf")),
  ]);

  return [
    {
      name: "Newsreader",
      data: newsreaderRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Newsreader",
      data: newsreaderLight,
      weight: 300 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: jetbrainsMono,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Noto Sans JP",
      data: notoSansJP,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("post");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { 
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, tags } = props as { 
    title: string; 
    description: string;
    tags: string[];
  };

  const fonts = await loadFonts();

  // Calculate font size based on title length
  const titleFontSize = title.length > 60 ? 56 : title.length > 40 ? 64 : 72;
  
  // Truncate description if needed
  const truncatedDesc = description.length > 120 
    ? description.substring(0, 120) + "..." 
    : description;

  // Japanese-inspired minimal design using JSX-like object syntax
  const markup = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f4",
        padding: "60px",
        position: "relative",
      },
      children: [
        // Subtle grid pattern overlay
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            },
          },
        },
        // Top decorative line
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 40,
              left: 60,
              right: 60,
              height: 1,
              backgroundColor: "#d6d3d1",
            },
          },
        },
        // Main content container
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            },
            children: [
              // Title
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Newsreader",
                    fontSize: titleFontSize,
                    fontWeight: 400,
                    color: "#292524",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: 24,
                    maxWidth: 950,
                  },
                  children: title,
                },
              },
              // Description
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Newsreader",
                    fontSize: 36,
                    fontWeight: 300,
                    color: "#57534e",
                    lineHeight: 1.4,
                    maxWidth: 950,
                  },
                  children: truncatedDesc,
                },
              },
            ],
          },
        },
        // Bottom section
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            },
            children: [
              // Author / site
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  },
                  children: [
                    // Decorative mark
                    {
                      type: "div",
                      props: {
                        style: {
                          width: 10,
                          height: 10,
                          backgroundColor: "#292524",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontFamily: "JetBrains Mono",
                          fontSize: 28,
                          color: "#57534e",
                          letterSpacing: "0.05em",
                        },
                        children: "d4mr.com",
                      },
                    },
                  ],
                },
              },
              // Tags
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    gap: 16,
                  },
                  children: tags.slice(0, 3).map((tag) => ({
                    type: "div",
                    props: {
                      style: {
                        fontFamily: "JetBrains Mono",
                        fontSize: 24,
                        color: "#78716c",
                        letterSpacing: "0.02em",
                      },
                      children: `#${tag}`,
                    },
                  })),
                },
              },
            ],
          },
        },
        // Bottom decorative line
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: 40,
              left: 60,
              right: 60,
              height: 1,
              backgroundColor: "#d6d3d1",
            },
          },
        },
        // Corner seal (hanko-inspired) - outer border
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 52,
              right: 56,
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #c44d4d",
            },
            children: [
              // Inner border
              {
                type: "div",
                props: {
                  style: {
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #c44d4d",
                  },
                  children: [
                    // Character 四 (four in Japanese)
                    {
                      type: "div",
                      props: {
                        style: {
                          fontFamily: "Noto Sans JP",
                          fontSize: 26,
                          fontWeight: 400,
                          color: "#c44d4d",
                          lineHeight: 1,
                        },
                        children: "四",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(markup as unknown as ReactNode, {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
