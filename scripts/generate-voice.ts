#!/usr/bin/env tsx
/**
 * Rin's voice: audition the stock ElevenLabs voices, or save one as hers.
 * Usage:
 *   pnpm generate:voice                 audition every candidate
 *   pnpm generate:voice Jessica Lily    audition just these
 *   pnpm generate:voice --pick Jessica "why this voice"
 */
import fs from "node:fs/promises";
import path from "node:path";
import { type Audition, auditionVoices, saveVoice, voiceDir } from "../apps/studio/src/voice.js";

async function main() {
	const args = process.argv.slice(2);
	if (args[0] === "--pick") {
		const [, voice, ...notes] = args;
		if (!voice) throw new Error("Usage: pnpm generate:voice --pick <voice> [notes]");
		const { results } = JSON.parse(await fs.readFile(path.join(voiceDir(), "auditions.json"), "utf8")) as { results: Audition[] };
		const audition = results.find((r) => r.voice.toLowerCase() === voice.toLowerCase());
		if (!audition) throw new Error(`No audition for ${voice}. Auditioned: ${results.map((r) => r.voice).join(", ")}`);
		console.log(`Saved ${await saveVoice(audition.voice, audition, notes.join(" "))}`);
		return;
	}
	const results = await auditionVoices(args.length ? args : undefined);
	console.log("\nvoice       seconds  wpm  WER");
	for (const r of [...results].sort((a, b) => a.wer - b.wer)) {
		console.log(`${r.voice.padEnd(10)}  ${r.seconds.toFixed(1).padStart(7)}  ${Math.round(r.wordsPerMinute).toString().padStart(3)}  ${(r.wer * 100).toFixed(1)}%`);
	}
}

main().then(
	() => process.exit(0),
	(err: unknown) => {
		console.error(`\nVoice generation failed:`, err instanceof Error ? err.message : err);
		process.exit(1);
	},
);
