/**
 * The launch track: 14 seconds of music at 120 bpm, written to the storyboard
 * bar by bar so the picture can cut on it (see post.ts for what lands where).
 *
 * Run on purpose, never from the post: pnpm generate:launch-music [model] [take]
 * Writes assets/audio/launch/track-<take>.wav and its .json record (Git LFS); then
 * `pnpm studio listen launch/track` measures its loudness and note onsets.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "../../../apps/studio/src/posts.js";

const MODEL = process.argv[2] ?? "seed-audio/1.0";
const OUT = path.join(ROOT, "assets/audio/launch");
const SECONDS = 15;
const take = Number(process.argv[3] ?? 1);

const PROMPT =
	"A 15-second instrumental tech product launch sting, exactly 120 BPM in 4/4, A minor, punchy modern electronic with cinematic weight. " +
	"Bar 1 (0 to 2 seconds): four sharp staccato synth stabs, one on each beat, over a tight rising riser, nothing else. " +
	"At exactly 2 seconds: the drop. A huge kick and clap, driving four-on-the-floor kick, offbeat open hi-hats, a pulsing sidechained synth bass and a bright arpeggiated pluck in sixteenth notes, " +
	"full energy for four bars, from 2 to 10 seconds, with a short reverse-cymbal swell from 9 to 10 seconds. " +
	"At exactly 10 seconds: one big final impact hit with a deep sub boom and a wide shimmering major chord that rings out and decays to silence by 15 seconds, no more drums. " +
	"Clean, confident, premium, no vocals.";

async function main(): Promise<void> {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	console.log(`[music] ${MODEL}…`);
	const { data, requestId } = await ai.subscribe<{ audio?: { url: string }; audio_url?: string }>(MODEL, {
		input: { text_prompt: PROMPT },
		logs: true,
	});
	const url = data.audio?.url ?? data.audio_url;
	if (!url) throw new Error(`${MODEL} returned no audio: ${JSON.stringify(data)}`);
	const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
	await fs.mkdir(OUT, { recursive: true });
	await fs.writeFile(path.join(OUT, `track-${take}.${ext(url)}`), buffer);
	await fs.writeFile(
		path.join(OUT, `track-${take}.record.json`),
		JSON.stringify({ model: MODEL, seconds: SECONDS, prompt: PROMPT, url, requestId, generatedAt: new Date().toISOString() }, null, 2),
	);
	console.log(`[music] Saved ${path.join(OUT, `track-${take}.${ext(url)}`)}`);
}

const ext = (url: string) => url.split("?")[0].split(".").pop() ?? "mp3";

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
