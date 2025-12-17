import type { APIRoute } from "astro";
import type { ReactNode } from "react";
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

export const GET: APIRoute = async () => {
  const fonts = await loadFonts();

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
              // Name
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Newsreader",
                    fontSize: 72,
                    fontWeight: 400,
                    color: "#292524",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: 16,
                  },
                  children: "Prithvish Baidya",
                },
              },
              // Role
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 28,
                    fontWeight: 400,
                    color: "#57534e",
                    letterSpacing: "0.05em",
                    marginBottom: 32,
                  },
                  children: "blockchain engineer",
                },
              },
              // Description
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Newsreader",
                    fontSize: 32,
                    fontWeight: 300,
                    color: "#78716c",
                    lineHeight: 1.5,
                    maxWidth: 800,
                  },
                  children: "Building decentralized systems and developer tooling for blockchain applications.",
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
              // Site URL
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
        // Corner seal (hanko-inspired)
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
