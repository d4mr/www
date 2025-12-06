import Giscus from "@giscus/react";
import { useStore } from "@nanostores/react";
import { themeStore } from "../stores/theme";

export default function Comments() {
  const theme = useStore(themeStore);

  return (
    <Giscus
      id="comments"
      repo="d4mr/www"
      repoId="R_kgDOQje2Nw"
      category="comments"
      categoryId="DIC_kwDOQje2N84CzdSs"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      theme={theme === "dark" ? "dark" : "light"}
      lang="en"
      loading="lazy"
    />
  );
}
