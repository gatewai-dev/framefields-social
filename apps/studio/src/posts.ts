/** Finding posts: every folder under posts/ whose src/post.ts default-exports a Post. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Post } from "@framefields-social/kit";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const POSTS = path.join(ROOT, "posts");

export const entryOf = (slug: string): string => path.join(POSTS, slug, "src/post.ts");

export function slugs(): string[] {
	return fs
		.readdirSync(POSTS, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(entryOf(d.name)))
		.map((d) => d.name)
		.sort();
}

export async function load(slug: string): Promise<Post> {
	if (!fs.existsSync(entryOf(slug))) throw new Error(`No post "${slug}". Posts: ${slugs().join(", ")}`);
	const { default: post } = await import(pathToFileURL(entryOf(slug)).href);
	if (!(post instanceof Post)) throw new Error(`${entryOf(slug)} must default-export post({ ... }).`);
	return post;
}
