/**
 * Sound effects from the framefields AI gateway (ElevenLabs Sound Effects v2).
 * Generated once and kept raw in assets/audio/ under Git LFS; the look's
 * master bus shapes them at render time, so renders never call out.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "./posts.js";

export interface SoundRequest {
	/** File name under assets/audio/, without extension. */
	name: string;
	prompt: string;
	seconds: number;
	/** 0–1: how literally to follow the prompt. */
	influence?: number;
}

export async function generateSound({ name, prompt, seconds, influence = 0.5 }: SoundRequest): Promise<string> {
	loadEnv();
	const { data } = await ai.run<{ audio: { url: string } }>("fal-ai/elevenlabs/sound-effects/v2", {
		input: { text: prompt, duration_seconds: seconds, prompt_influence: influence, output_format: "mp3_44100_192" },
	});

	const file = audioFile(name);
	await fs.mkdir(path.dirname(file), { recursive: true });
	const response = await fetch(data.audio.url);
	if (!response.ok) throw new Error(`Failed to download audio from ${data.audio.url}: ${response.status}`);
	await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
	return file;
}

export const audioFile = (name: string): string => path.join(ROOT, "assets/audio", `${name}.mp3`);

function loadEnv(): void {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	if (!process.env.FRAMEFIELDS_API_KEY) {
		throw new Error("Set FRAMEFIELDS_API_KEY in .env to generate sounds. Create a key at https://framefields.dev/dashboard/keys");
	}
}
