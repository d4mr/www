// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginLanguageLabel } from "./src/plugins/expressive-code-language-label";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import rehypeExternalLinks from "rehype-external-links";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://d4mr.com", // Update with your actual domain
  integrations: [
    react(),
    expressiveCode({
      plugins: [pluginLineNumbers(), pluginLanguageLabel()],
      themes: ["vitesse-dark", "vitesse-light"],
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      defaultProps: {
        showLineNumbers: true,
      },
      styleOverrides: {
        borderRadius: "0.5rem",
        borderWidth: "1px",
        codePaddingInline: "1rem",
        codePaddingBlock: "0.875rem",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.8125rem",
        codeLineHeight: "1.65",
        uiFontFamily: "var(--font-mono)",
        uiFontSize: "0.6875rem",
        lineNumbers: {
          foreground: "#6e6e6e50",
        },
        frames: {
          shadowColor: "transparent",
          frameBoxShadowCssValue: "none",
          editorTabBarBackground: "transparent",
          editorActiveTabBackground: "transparent",
          editorActiveTabIndicatorTopColor: "transparent",
          editorActiveTabIndicatorBottomColor: "#6e6e6e30",
          terminalBackground: "var(--bg-paper)",
          terminalTitlebarBackground: "transparent",
          terminalTitlebarBorderBottomColor: "#6e6e6e30",
        },
      },
    }),
    mdx(),
    sitemap(),
    icon(),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["react-tweet"],
    },
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
