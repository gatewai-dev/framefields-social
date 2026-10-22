/**
 * Sound effects from fal (ElevenLabs Sound Effects v2, about $0.002 a second).
 * Generated once and kept raw in assets/audio/ under Git LFS; the look's
 * master bus shapes them at render time, so renders never call out.
 */
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

	const file = audioFile(name);
	await fs.mkdir(path.dirname(file), { recursive: true });
	await fs.writeFile(file, Buffer.from(await (await fetch(audio.url)).arrayBuffer()));
	return file;
}

export const audioFile = (name: string): string => path.join(ROOT, "assets/audio", `${name}.mp3`);

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
