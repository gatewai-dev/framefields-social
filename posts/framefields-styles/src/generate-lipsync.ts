/**
 * Rin talking: the talking plate animated to her voiceover by the lipsync model.
 * The model takes only the image, the audio, a seed and a resolution (no prompt),
 * so the plate's hands-ready pose is what invites her to gesture.
 *
 * Billed per second of output: $0.05/s at 480P, $0.08/s at 768P, $0.16/s at
 * 1080P, $0.32/s at 2K, and ×1.2 over 15 s. Test short and low first.
 *
 * Run on purpose, never from the post:
 *   pnpm generate:lipsync --seconds 6 --resolution 480P   test on the first 6 s
 *   pnpm generate:lipsync --resolution 1080P              the full master take
 * Writes assets/video/framefields-styles/rin-<label>.mp4 and its .json record (Git LFS).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "../../../apps/studio/src/posts.js";
import { duration, loadEnv } from "../../../apps/studio/src/voice.js";

const MODEL = "minimax/h3-max/lip-sync/image-to-video";
const PLATE = path.join(ROOT, "assets/character/rin-talk.png");
const VO = path.join(ROOT, "assets/audio/framefields-styles/rin-vo.mp3");
const OUT = path.join(ROOT, "assets/video/framefields-styles");
const PRICE: Record<string, number> = { "480P": 0.05, "768P": 0.08, "1080P": 0.16, "2K": 0.32 };

const arg = (name: string): string | undefined => {
	const i = process.argv.indexOf(`--${name}`);
	return i < 0 ? undefined : process.argv[i + 1];
};
const seconds = arg("seconds") ? Number(arg("seconds")) : undefined;
const resolution = arg("resolution") ?? "480P";
const seed = Number(arg("seed") ?? 7);

async function main(): Promise<void> {
	loadEnv();
	if (!(resolution in PRICE)) throw new Error(`--resolution must be one of ${Object.keys(PRICE).join(", ")}`);
	if (seconds !== undefined && seconds < 5) throw new Error("The model needs at least 5 s of audio.");

	// A test takes the head of the voiceover, cut losslessly to WAV.
	let audio = VO;
	if (seconds !== undefined) {
		audio = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "rin-lipsync-")), "head.wav");
		execFileSync("ffmpeg", ["-y", "-v", "error", "-i", VO, "-t", String(seconds), "-c:a", "pcm_s16le", audio]);
	}
	const length = duration(audio);
	const cost = length * PRICE[resolution] * (length > 15 ? 1.2 : 1);
	const label = seconds === undefined ? `master-${resolution.toLowerCase()}` : `test-${seconds}s-${resolution.toLowerCase()}`;
	console.log(`[lipsync] ${MODEL}, ${length.toFixed(1)} s at ${resolution}, about $${cost.toFixed(2)}…`);

	const blob = async (file: string, type: string) => new Blob([await fs.readFile(file)], { type });
	const { data, requestId } = await ai.subscribe<{ video: { url: string }; seed: number; duration: number }>(MODEL, {
		input: {
			image_url: await blob(PLATE, "image/png"),
			audio_url: await blob(audio, audio.endsWith(".wav") ? "audio/wav" : "audio/mpeg"),
			resolution,
			enable_transcription: true,
			seed,
		},
		logs: true,
		// Paid jobs get their id printed first, so a failed poll can still be recovered.
		onEnqueue: (id) => console.log(`[lipsync] Request ${id}`),
		onQueueUpdate: (u) => {
			if (u.status === "IN_PROGRESS") for (const log of u.logs ?? []) console.log(`[lipsync][gateway] ${log.message}`);
		},
	});
	if (!data.video?.url) throw new Error(`${MODEL} returned no video: ${JSON.stringify(data)}`);

	await fs.mkdir(OUT, { recursive: true });
	const file = path.join(OUT, `rin-${label}.mp4`);
	await fs.writeFile(file, Buffer.from(await (await fetch(data.video.url)).arrayBuffer()));
	await fs.writeFile(
		path.join(OUT, `rin-${label}.json`),
		JSON.stringify(
			{
				model: MODEL,
				image: path.relative(ROOT, PLATE),
				audio: path.relative(ROOT, VO),
				audioSeconds: Number(length.toFixed(2)),
				resolution,
				enableTranscription: true,
				seed: data.seed,
				estimatedCostUsd: Number(cost.toFixed(2)),
				url: data.video.url,
				requestId,
				duration: data.duration,
				generatedAt: new Date().toISOString(),
			},
			null,
			2,
		),
	);
	console.log(`[lipsync] Saved ${file} (${data.duration} s)`);
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
