/**
 * Rin's voiceover for the styles reel: vo.txt read in one take with her saved
 * voice (assets/character/rin-voice.json), each [pause] spoken as a demo gap
 * and then set to exactly DEMO_GAP seconds. The gap times are the cut points
 * where the demos go in.
 *
 * Run on purpose, never from the post: pnpm generate:vo
 * `pnpm generate:vo --respace` redoes only the gap spacing on the saved take (free).
 * Writes assets/audio/framefields-styles/rin-vo.mp3 and rin-vo.json (Git LFS for the audio).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { DEMO_GAP, DEMO_PAUSE, duration, loadEnv, loadVoice, spaceForDemos, speak, TTS_MODEL } from "../../../apps/studio/src/voice.js";
import { ROOT } from "../../../apps/studio/src/posts.js";

const SCRIPT = path.join(ROOT, "posts/framefields-styles/vo.txt");
const OUT = path.join(ROOT, "assets/audio/framefields-styles");

async function main(): Promise<void> {
	const file = path.join(OUT, "rin-vo.mp3");
	const meta = path.join(OUT, "rin-vo.json");
	if (process.argv.includes("--respace")) {
		const record = JSON.parse(await fs.readFile(meta, "utf8"));
		const gaps = spaceForDemos(file);
		const expected = record.text.split(DEMO_PAUSE).length - 1;
		if (gaps.length !== expected) console.warn(`[vo] Found ${gaps.length} demo gaps, expected ${expected}.`);
		record.demoGap = { seconds: DEMO_GAP, at: gaps };
		record.seconds = Number(duration(file).toFixed(2));
		await fs.writeFile(meta, JSON.stringify(record, null, 2));
		console.log(`[vo] Respaced ${file}: ${record.seconds} s, ${gaps.length} demo gaps at ${gaps.join(", ")}`);
		return;
	}
	loadEnv();
	const { voice, delivery } = await loadVoice();
	const lines = (await fs.readFile(SCRIPT, "utf8")).split("\n").filter((l) => l.trim());
	const text = lines.map((l) => l.trim().replaceAll("[pause]", DEMO_PAUSE)).join(" ");
	const expected = text.split(DEMO_PAUSE).length - 1;

	console.log(`[vo] ${TTS_MODEL}, ${voice}, ${text.length} characters, ${expected} demo gaps…`);
	const { url, requestId } = await speak(text, voice, delivery);

	await fs.mkdir(OUT, { recursive: true });
	await fs.writeFile(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
	const gaps = spaceForDemos(file);
	if (gaps.length !== expected) console.warn(`[vo] Found ${gaps.length} demo gaps, expected ${expected}: listen before using it.`);

	await fs.writeFile(
		meta,
		JSON.stringify(
			{
				model: TTS_MODEL,
				voice,
				delivery,
				script: path.relative(ROOT, SCRIPT),
				text,
				demoGap: { seconds: DEMO_GAP, at: gaps },
				seconds: Number(duration(file).toFixed(2)),
				url,
				requestId,
				generatedAt: new Date().toISOString(),
			},
			null,
			2,
		),
	);
	console.log(`[vo] Saved ${file}: ${duration(file).toFixed(1)} s, demo gaps at ${gaps.join(", ")}`);
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
