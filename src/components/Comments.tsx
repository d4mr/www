import Giscus from "@giscus/react";
import { useStore } from "@nanostores/react";
import { themeStore } from "../stores/theme";

export default function Comments() {
  const theme = useStore(themeStore);

  return (
    <Giscus
      id="comments"
      repo="d4mr/d4mr-web" // Update with your repo
      repoId="" // Get from giscus.app
      category="Announcements" // Update as needed
      categoryId="" // Get from giscus.app
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === "dark" ? "dark" : "light"}
      lang="en"
      loading="lazy"
    />
  );
}
