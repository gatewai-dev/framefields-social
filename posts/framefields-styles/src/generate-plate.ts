/**
 * Rin's talking plate: Rin from her character sheet, sitting in the studio set
 * with the framefields sign above her head. This is the still the lipsync model
 * animates, so she is framed waist-up, mouth closed, with both hands in frame
 * (the model can only move hands it can see).
 *
 * The set goes in first: the edit keeps its first reference's shape, so the
 * plate comes out 9:16 like the set.
 *
 * Run on purpose, never from the post: pnpm generate:plate [seed]
 * Writes assets/character/rin-talk.png and its .json record (Git LFS).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "../../../apps/studio/src/posts.js";

const MODEL = "openai/gpt-image-2.5/sunburst/edit";
const SET = path.join(ROOT, "assets/sets/framefields-studio.png");
const CHARACTER = path.join(ROOT, "assets/character/rin.png");
const OUT = path.join(ROOT, "assets/character");
const NAME = "rin-talk";

const PROMPT =
	"Image 1 is the studio. Image 2 is a character sheet of a woman named Rin. " +
	"Place Rin into the studio as a photorealistic vertical 9:16 talking-head frame for a social video. Keep the studio exactly as it is: same wall, plants, shelf, lamp, light, " +
	"and the framefields sign in the same place, fully readable above her head and never covered. " +
	"Rin keeps the exact face, eyes, freckles, skin texture and long dark espresso hair side-swept over her left shoulder from the large front portrait in image 2, " +
	"and the same thin black strap top. She sits on the chair at the desk, centered, facing the camera straight on, framed from the waist up with headroom between her head and the sign. " +
	"Both hands are fully visible in front of her at chest height, relaxed and slightly apart, fingers natural, five fingers each, as if about to gesture while talking. " +
	"Mouth closed with a warm, friendly slight smile, eyes looking into the lens. " +
	"Soft window light from the left and warm lamp fill, gentle background blur that keeps the sign readable, natural skin with no airbrushing. " +
	"No text other than the sign, no watermarks, no character-sheet labels.";

const seed = Number(process.argv[2] ?? 7);

async function main(): Promise<void> {
	if (!process.env.FRAMEFIELDS_API_KEY) {
		try {
			process.loadEnvFile(path.join(ROOT, ".env"));
		} catch {
			// No .env: the key may already be in the environment.
		}
	}
	const image = async (file: string) => new Blob([await fs.readFile(file)], { type: "image/png" });

	console.log(`[plate] ${MODEL}, seed ${seed}…`);
	const { data, requestId } = await ai.subscribe<{ images: { url: string }[] }>(MODEL, {
		input: {
			prompt: PROMPT,
			image_urls: [await image(SET), await image(CHARACTER)],
			aspect_ratio: "9:16",
			quality: "high",
			output_format: "png",
			seed,
		},
		logs: true,
		onQueueUpdate: (u) => {
			if (u.status === "IN_PROGRESS") for (const log of u.logs ?? []) console.log(`[plate][gateway] ${log.message}`);
		},
	});
	const url = data.images?.[0]?.url;
	if (!url) throw new Error(`${MODEL} returned no image: ${JSON.stringify(data)}`);

	const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
	const file = path.join(OUT, `${NAME}.png`);
	await fs.writeFile(file, buffer);
	await fs.writeFile(
		path.join(OUT, `${NAME}.json`),
		JSON.stringify(
			{
				name: NAME,
				model: MODEL,
				references: [path.relative(ROOT, SET), path.relative(ROOT, CHARACTER)],
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
	console.log(`[plate] Saved ${file}`);
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
