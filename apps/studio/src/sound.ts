/**
 * Sound effects from fal (ElevenLabs Sound Effects v2, about $0.002 a second).
 * Generated once, mastered, kept in assets/audio/ under Git LFS, so renders
 * never call out.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./posts.js";

const ENDPOINT = "https://fal.run/fal-ai/elevenlabs/sound-effects/v2";

export interface SoundRequest {
	/** File name under assets/audio/, without extension. */
	name: string;
	prompt: string;
	seconds: number;
	/** 0–1: how literally to follow the prompt. */
	influence?: number;
}

export async function generateSound({ name, prompt, seconds, influence = 0.5 }: SoundRequest): Promise<string> {
	const key = apiKey();
	const response = await fetch(ENDPOINT, {
		method: "POST",
		headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
		body: JSON.stringify({ text: prompt, duration_seconds: seconds, prompt_influence: influence, output_format: "mp3_44100_192" }),
	});
	if (!response.ok) throw new Error(`fal answered ${response.status}: ${await response.text()}`);
	const { audio } = (await response.json()) as { audio: { url: string } };

	const source = sourceOf(name);
	await fs.mkdir(path.dirname(source), { recursive: true });
	await fs.writeFile(source, Buffer.from(await (await fetch(audio.url)).arrayBuffer()));
	return master(name);
}

/** The generator's raw output: mastering always starts again from here. */
const sourceOf = (name: string) => path.join(ROOT, "assets/audio/source", `${name}.mp3`);

/**
 * Makes assets/audio/source/<name>.mp3 easy on the ear as assets/audio/<name>.mp3.
 * Generators deliver hot, often past full scale, which crackles on phone
 * speakers: the 2.5–6 kHz band where harshness lives is dipped, the top end
 * shelved off, a little warmth added, a short quiet room tail smooths the
 * attacks, and it lands at -14 LUFS (where Reels, TikTok and YouTube play)
 * with true peaks held under -1.5 dBFS.
 */
export function master(name: string, { fadeSeconds = 0.6 }: { fadeSeconds?: number } = {}): string {
	const source = sourceOf(name);
	const file = path.join(ROOT, "assets/audio", `${name}.mp3`);
	const seconds = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", source]).toString());
	const chain = [
		"volume=-6dB",
		"highpass=f=40",
		"lowshelf=f=180:g=1.5",
		"equalizer=f=3500:t=q:w=1.2:g=-3",
		"highshelf=f=7000:g=-4",
		"aecho=1:0.9:45|90:0.18|0.1",
		`afade=t=out:st=${Math.max(0, seconds - fadeSeconds).toFixed(2)}:d=${fadeSeconds}`,
		"loudnorm=I=-14:TP=-1.5:LRA=11",
		"alimiter=limit=-1.5dB:attack=5:release=80:level=false",
	].join(",");
	execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-af", chain, "-ar", "48000", "-b:a", "256k", file]);
	return file;
}

function apiKey(): string {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	const key = process.env.FAL_API_KEY ?? process.env.FAL_KEY;
	if (!key) throw new Error("Set FAL_API_KEY in .env to generate sounds.");
	return key;
}
