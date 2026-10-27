/**
 * The one clip the montage restyles on every beat: a dancer turning in a dark
 * studio, so each look reads on a body, not on an abstract.
 *
 * Run on purpose, never from the post: pnpm generate:launch-footage
 * Writes assets/video/launch/dancer.mp4 and its .json record (Git LFS).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "../../../apps/studio/src/posts.js";

const MODEL = "seedance/2.0-mini";
const OUT = path.join(ROOT, "assets/video/launch");

const PROMPT =
	"Vertical 9:16 frame, one continuous shot, no cuts. A contemporary dancer in a flowing white shirt spins and sweeps her arms through the air in a dark minimalist studio, " +
	"lit by a strong cool blue rim light from behind and a soft white key light from the front, faint haze in the air. Full body visible, centered, the camera slowly circles her. " +
	"Elegant, energetic, premium commercial look, sharp focus, high contrast, deep navy background. No text, no logos.";

async function main(): Promise<void> {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	console.log(`[footage] ${MODEL}…`);
	const input = { prompt: PROMPT, duration: 6, resolution: "720p", generate_audio: false };
	const { data, requestId } = await ai.subscribe<{ video: { url: string }; seed: number }>(MODEL, { input, logs: true });
	const buffer = Buffer.from(await (await fetch(data.video.url)).arrayBuffer());
	await fs.mkdir(OUT, { recursive: true });
	await fs.writeFile(path.join(OUT, "dancer.mp4"), buffer);
	await fs.writeFile(path.join(OUT, "dancer.json"), JSON.stringify({ model: MODEL, input, requestId, seed: data.seed }, null, 2));
	console.log(`[footage] Saved ${path.join(OUT, "dancer.mp4")}`);
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
