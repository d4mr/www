import { definePlugin } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";

// Language display names for common languages
const languageNames: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  mdx: "MDX",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  powershell: "PowerShell",
  ps1: "PowerShell",
  python: "Python",
  py: "Python",
  rust: "Rust",
  rs: "Rust",
  go: "Go",
  golang: "Go",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  csharp: "C#",
  "c#": "C#",
  php: "PHP",
  ruby: "Ruby",
  rb: "Ruby",
  sql: "SQL",
  graphql: "GraphQL",
  gql: "GraphQL",
  dockerfile: "Dockerfile",
  docker: "Docker",
  toml: "TOML",
  ini: "INI",
  xml: "XML",
  svg: "SVG",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
  solidity: "Solidity",
  sol: "Solidity",
};

function getLanguageDisplayName(language: string): string {
  return languageNames[language.toLowerCase()] || language.toUpperCase();
}

export function pluginLanguageLabel() {
  return definePlugin({
    name: "language-label",
    baseStyles: `
      .language-label {
        position: absolute;
        top: 0.375rem;
        right: 0.5rem;
        padding: 0.125rem 0.5rem;
        font-family: var(--font-mono);
        font-size: 0.625rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        color: #888;
        background: rgba(128, 128, 128, 0.1);
        border-radius: 0.25rem;
        pointer-events: none;
        user-select: none;
        z-index: 5;
        transition: right 0.2s ease, opacity 0.2s ease;
      }

      [data-theme="dark"] .language-label {
        color: #666;
        background: rgba(128, 128, 128, 0.15);
      }

      .frame:hover .language-label {
        right: 2.75rem;
        opacity: 0.6;
      }
    `,
    hooks: {
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const language = codeBlock.language;
        if (!language || language === "plaintext" || language === "text") {
          return;
        }

        const displayName = getLanguageDisplayName(language);

        // Create the language label element
        const labelElement = h("span", { class: "language-label" }, displayName);

        // Find the frame's copy button wrapper or the pre element to position relative to
        const frame = renderData.blockAst;

        // The frame structure is: figure.frame > div.header (optional) > div.copy > button
        // We want to insert our label inside the figure, positioned absolutely
        if (frame.type === "element" && frame.tagName === "figure") {
          // Insert the label as the first child of the figure
          frame.children.unshift(labelElement);
        }
      },
    },
  });
}
