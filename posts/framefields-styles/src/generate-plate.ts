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
 * `pnpm generate:plate --outfit [seed]` then edits only her clothes on the saved
 * plate (one more call), keeping face, hands, pose and set.
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

/** Her on-camera look: a creator who works at a video company, a little artsy. */
const OUTFIT =
	"Change only her clothes. Keep everything else in the image exactly the same: her face, expression, hair, both hands and every finger, pose, framing, the desk, " +
	"the room, the light and the framefields sign. " +
	"She now wears a relaxed, slightly oversized cropped jacket, open at the front over the same thin black top: deep cobalt blue (#1D4ED8) textured cotton twill " +
	"with a few loose, hand-painted abstract brushstrokes in cream and sky blue across one shoulder and down the opposite sleeve, like an artist's own jacket, " +
	"a soft notched collar and rolled cuffs at the forearms so her hands and wrists stay fully visible. Natural fabric folds and stitching, photorealistic, " +
	"stylish but approachable, nothing logo-like or written on it.";

const outfit = process.argv.includes("--outfit");
const seed = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 7);

async function main(): Promise<void> {
	if (!process.env.FRAMEFIELDS_API_KEY) {
		try {
			process.loadEnvFile(path.join(ROOT, ".env"));
		} catch {
			// No .env: the key may already be in the environment.
		}
	}
	const image = async (file: string) => new Blob([await fs.readFile(file)], { type: "image/png" });
	const file = path.join(OUT, `${NAME}.png`);
	const metaPath = path.join(OUT, `${NAME}.json`);
	const previous = outfit ? JSON.parse(await fs.readFile(metaPath, "utf8")) : undefined;
	const prompt = outfit ? OUTFIT : PROMPT;
	const references = outfit ? [file] : [SET, CHARACTER];

	console.log(`[plate] ${MODEL}${outfit ? " (outfit)" : ""}, seed ${seed}…`);
	const { data, requestId } = await ai.subscribe<{ images: { url: string }[] }>(MODEL, {
		input: {
			prompt,
			image_urls: await Promise.all(references.map(image)),
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
	await fs.writeFile(file, buffer);
	const step = {
		model: MODEL,
		references: references.map((r) => path.relative(ROOT, r)),
		aspectRatio: "9:16",
		quality: "high",
		seed,
		prompt,
		url,
		requestId,
		generatedAt: new Date().toISOString(),
		sizeBytes: buffer.byteLength,
	};
	await fs.writeFile(
		metaPath,
		JSON.stringify(
			outfit
				? { ...previous, ...step, name: NAME, steps: [...(previous.steps ?? [{ ...previous, name: undefined }]), step] }
				: { name: NAME, ...step },
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
