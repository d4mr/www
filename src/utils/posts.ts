import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"post">;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection("post", ({ data }) => {
    // Filter out drafts in production
    return import.meta.env.PROD ? !data.draft : true;
  });

  return posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.data.tags.includes(tag.toLowerCase()));
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllPosts();
  const tags = new Map<string, number>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    });
  });

  return tags;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, ".");
}
