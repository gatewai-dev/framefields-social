/**
 * Entry point for the preview and the render worker: builds the post named by
 * POST in the format named by FORMAT. Builds only; render.ts does the rendering.
 */
import type { Composition } from "framefields";
import { FORMATS, isFormatName } from "./formats.js";
import { POSTS } from "./posts/index.js";

export const DEFAULT_POST = "hello-framefields";
export const DEFAULT_FORMAT = "reel";

export async function buildFilm(
	post = process.env.POST ?? DEFAULT_POST,
	format = process.env.FORMAT ?? DEFAULT_FORMAT,
): Promise<Composition> {
	const entry = POSTS[post];
	if (!entry) throw new Error(`Unknown post "${post}". Posts: ${Object.keys(POSTS).join(", ")}`);
	if (!isFormatName(format)) throw new Error(`Unknown format "${format}". Formats: ${Object.keys(FORMATS).join(", ")}`);
	return entry.build(FORMATS[format]);
}
