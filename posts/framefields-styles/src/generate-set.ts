/**
 * The set Rin talks in: a friendly creator studio with the framefields sign on
 * the back wall. The real wordmark goes in as the edit's reference image, so
 * the sign carries the actual mark and Unbounded lettering rather than a guess.
 * The edit keeps its reference's shape, so the reference is the wordmark laid
 * on a 9:16 wall where the sign should hang (built from logo-wordmark-light.png:
 * `convert -size 1080x1920 xc:'#F4EFE8' \( logo-wordmark-light.png -resize 860x \)
 * -gravity north -geometry +0+420 -composite framefields-studio-reference.png`).
 *
 * Run on purpose, never from the post: tsx posts/framefields-styles/src/generate-set.ts [seed]
 * Writes assets/sets/framefields-studio.png and its .json record (Git LFS).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "../../../apps/studio/src/posts.js";

const MODEL = "openai/gpt-image-2.5/sunburst/edit";
const REFERENCE = path.join(ROOT, "assets/sets/framefields-studio-reference.png");
const OUT = path.join(ROOT, "assets/sets");
const NAME = "framefields-studio";

const PROMPT =
	"The attached image is a plain wall with the logo placed where the sign hangs. Keep the logo exactly as it is: the blue bracket-and-play mark and the lowercase 'framefields' wordmark in its wide, rounded geometric typeface, at that position and size. " +
	"Photorealistic vertical 9:16 photo of an empty, friendly, cozy content-creator studio, shot at eye level from where a host would sit, ready for a talking-head video. " +
	"Back wall: smooth warm off-white plaster. Mounted on it, centered horizontally in the upper third of the frame, is a large dimensional sign of that exact logo: " +
	"the mark in bright signal blue (#3B82F6) on the left and the word 'framefields' in deep navy (#0B1E4D) raised letters on the right, spelled exactly f-r-a-m-e-f-i-e-l-d-s, all lowercase, " +
	"with a soft blue halo backlight glowing on the wall around it. The sign is crisp, straight-on, fully readable and not cropped. " +
	"Around it: a light oak floating shelf low on the left with a small trailing plant, a few books and a tiny retro monitor; a tall leafy plant in a ceramic pot on the right edge; " +
	"a warm round paper lamp glowing softly; small accents of cobalt and sky blue (a cushion, a mug, a neon squiggle). " +
	"The middle and lower center of the frame stay open and uncluttered, with a slightly blurred desk edge at the very bottom, so a person can be placed there later. " +
	"No people, no other text, no watermarks. Soft natural window light from the left mixed with warm practical lamps, gentle depth of field that keeps the sign sharp, " +
	"inviting and bright, clean modern aesthetic, shot on a 35mm lens, high detail.";

const seed = Number(process.argv[2] ?? 7);

async function main(): Promise<void> {
	if (!process.env.FRAMEFIELDS_API_KEY) {
		try {
			process.loadEnvFile(path.join(ROOT, ".env"));
		} catch {
			// No .env: the key may already be in the environment.
		}
	}
	const reference = new Blob([await fs.readFile(REFERENCE)], { type: "image/png" });

	console.log(`[set] ${MODEL}, seed ${seed}…`);
	const { data, requestId } = await ai.subscribe<{ images: { url: string }[] }>(MODEL, {
		input: {
			prompt: PROMPT,
			image_urls: [reference],
			aspect_ratio: "9:16",
			quality: "high",
			output_format: "png",
			seed,
		},
		logs: true,
		onQueueUpdate: (u) => {
			if (u.status === "IN_PROGRESS") for (const log of u.logs ?? []) console.log(`[set][gateway] ${log.message}`);
		},
	});
	const url = data.images?.[0]?.url;
	if (!url) throw new Error(`${MODEL} returned no image: ${JSON.stringify(data)}`);

	await fs.mkdir(OUT, { recursive: true });
	const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
	const file = path.join(OUT, `${NAME}.png`);
	await fs.writeFile(file, buffer);
	await fs.writeFile(
		path.join(OUT, `${NAME}.json`),
		JSON.stringify(
			{
				name: NAME,
				model: MODEL,
				reference: path.relative(ROOT, REFERENCE),
				aspectRatio: "9:16",
				quality: "high",
				seed,
				prompt: PROMPT,
				url,
				requestId,
				generatedAt: new Date().toISOString(),
				sizeBytes: buffer.byteLength,
			},
			null,
			2,
		),
	);
	console.log(`[set] Saved ${file}`);
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
