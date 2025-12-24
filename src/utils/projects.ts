import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"project">;

export async function getAllProjects(): Promise<Project[]> {
  const projects = await getCollection("project", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  return projects.sort((a, b) => {
    // Sort by year descending, then by featuredOrder
    const yearDiff = parseInt(b.data.year) - parseInt(a.data.year);
    if (yearDiff !== 0) return yearDiff;
    return a.data.featuredOrder - b.data.featuredOrder;
  });
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects
    .filter((p) => p.data.featured)
    .sort((a, b) => a.data.featuredOrder - b.data.featuredOrder);
}

export async function getProjectsByTag(tag: string): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((project) =>
    project.data.tags.includes(tag.toLowerCase())
  );
}

export function formatAwards(awards: Array<{ name: string; event?: string; year?: string }>) {
  const grouped = new Map<string, string[]>();
  for (const a of awards) {
    const event = a.event ?? "";
    if (!grouped.has(event)) grouped.set(event, []);
    grouped.get(event)!.push(a.name);
  }
  return Array.from(grouped.entries())
    .map(([event, names]) => `${event} · ${names.join(" · ")}`)
    .join(" · ");
}

export async function getRelatedPosts(project: Project) {
  const { getPostsByTag } = await import("./posts");

  // Get posts that share tags with this project
  const projectTags = project.data.tags;
  const relatedPostsSet = new Set<string>();
  const relatedPosts = [];

  for (const tag of projectTags) {
    const postsWithTag = await getPostsByTag(tag);
    for (const post of postsWithTag) {
      if (!relatedPostsSet.has(post.id)) {
        relatedPostsSet.add(post.id);
        relatedPosts.push(post);
      }
    }
  }

  return relatedPosts.slice(0, 3); // Limit to 3 related posts
}
