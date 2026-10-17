/** Every post in the repo, by slug. Add a post here to render it. */
import type { Composition } from "framefields";
import type { Format } from "../formats.js";
import * as helloFramefields from "./hello-framefields.js";

export const POSTS: Record<string, { build(format: Format): Promise<Composition> }> = {
	"hello-framefields": helloFramefields,
};
