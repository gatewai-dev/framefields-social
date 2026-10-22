/**
 * Rin's voice through the framefields AI gateway (ElevenLabs Eleven v4 Turbo).
 *
 * The gateway has no voice design, so Rin's voice is one of the stock voices
 * plus fixed delivery settings. `auditionVoices` reads the same reference
 * script with each candidate and transcribes it back, so a voice that slurs,
 * skips or mispronounces shows up as transcript errors; `saveVoice` records the
 * chosen one in assets/character/rin-voice.json for every later post.
 *
 * Rin leaves a gap after every style she counts so a demo can be cut in there.
 * Eleven v4 ignores `<break time>`; `[long pause]` gives a clear but uneven
 * ~1.6 s silence (a colon pause is ~0.45 s), so `spaceForDemos` finds those
 * gaps and sets each to exactly DEMO_GAP, and returns where they are.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { ai } from "framefields";
import { ROOT } from "./posts.js";

export const TTS_MODEL = "elevenlabs/tts/eleven-v4-turbo";
export const STT_MODEL = "fal-ai/elevenlabs/speech-to-text/scribe-v2";

/** Young, warm and conversational: the stock voices that could be Rin. */
export const CANDIDATES = ["Jessica", "Laura", "Sarah", "Lily", "Matilda", "Aria", "Alice", "Charlotte"] as const;

/** Spoken after the hook and after every counted style: where a demo goes. */
export const DEMO_PAUSE = "[long pause]";
/** Every demo gap is set to exactly this many seconds of silence. */
export const DEMO_GAP = 1.2;
/** Silences at least this long are demo gaps; shorter ones are her own phrasing. */
const MIN_DEMO_GAP = 1.0;

/**
 * What Rin sounds like off-script: contractions, a trailing thought, a soft
 * laugh, then the hook and a run of the styles reel, with a demo gap after
 * each style, so the brand name and the hard style names are in the sample.
 */
export const REFERENCE_SCRIPT =
	"[warmly] Hi, I'm Rin! So... I make videos. A lot of videos. " +
	"And honestly? Most of my week used to just disappear into editing. [laughs softly] " +
	"Then I found framefields, and now I write what I want to see, and it just... shows up. " +
	`Okay, today's a fun one. [excited] Hellooo! Here are twenty video styles you can create with framefields. ${DEMO_PAUSE} ` +
	`Number one: Web one point oh. ${DEMO_PAUSE} Ten: Neumorphism. ${DEMO_PAUSE} ` +
	`Thirteen: Datamosh. ${DEMO_PAUSE} Nineteen: Skeuomorphic. ${DEMO_PAUSE} ` +
	"[playful] Every one of these is just code. Which one are you making first?";

/** Demo gaps the reference script asks for. */
export const REFERENCE_GAPS = REFERENCE_SCRIPT.split(DEMO_PAUSE).length - 1;

export interface Delivery {
	/** Lower is more expressive; around 0.4 keeps it lively without wobble. */
	stability: number;
	/** How closely it follows the stock voice; past ~0.8 it starts to sound processed. */
	similarity_boost: number;
	language_code: string;
	output_format: string;
	seed: number;
}

export const DELIVERY: Delivery = {
	stability: 0.4,
	similarity_boost: 0.78,
	language_code: "en",
	output_format: "mp3_44100_192",
	seed: 7,
};

export interface Audition {
	voice: string;
	file: string;
	url: string;
	requestId: string;
	seconds: number;
	wordsPerMinute: number;
	transcript: string;
	/** Demo gaps after spacing: where each starts in the file, in seconds. */
	gaps: number[];
	/** Word error rate of the transcript against the spoken words of the script (tags removed). */
	wer: number;
}

export const voiceDir = (): string => path.join(ROOT, "assets/character/rin-voice");

function loadEnv(): void {
	try {
		process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		// No .env: the key may already be in the environment.
	}
	if (!process.env.FRAMEFIELDS_API_KEY) {
		throw new Error("Set FRAMEFIELDS_API_KEY in .env to generate voice assets. Create a key at https://framefields.dev/dashboard/keys");
	}
}

/** Same spelling on both sides: the transcriber writes numerals and casual forms the script spells out. */
const SPOKEN: [RegExp, string][] = [
	[/\b1\.0\b/g, "one point oh"],
	[/\b20\b/g, "twenty"],
	[/\bwanna\b/g, "want to"],
	[/\btoday is\b/g, "today's"],
	[/\bhello+\b/g, "hello"],
];

const words = (text: string): string[] => {
	let t = text.replace(/\[[^\]]*\]/g, " ").toLowerCase();
	for (const [from, to] of SPOKEN) t = t.replace(from, to);
	return t
		.replace(/[^a-z0-9' ]+/g, " ")
		.split(/\s+/)
		.filter(Boolean);
};

/** Levenshtein distance over words, divided by the reference length. */
export function wordErrorRate(reference: string, hypothesis: string): number {
	const a = words(reference);
	const b = words(hypothesis);
	let row = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 0; i < a.length; i++) {
		const next = [i + 1];
		for (let j = 0; j < b.length; j++) {
			next.push(Math.min(row[j + 1] + 1, next[j] + 1, row[j] + (a[i] === b[j] ? 0 : 1)));
		}
		row = next;
	}
	return row[row.length - 1] / a.length;
}

const duration = (file: string): number =>
	Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());

/** Silences of at least `min` seconds: [start, end] pairs. */
function silences(file: string, min: number): [number, number][] {
	// silencedetect reports on stderr.
	const log = spawnSync("ffmpeg", ["-i", file, "-af", `silencedetect=noise=-40dB:d=${min}`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
	const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
	const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
	return starts.map((start, i) => [start, ends[i] ?? duration(file)] as [number, number]).filter(([, end]) => end < duration(file));
}

/**
 * Rewrite `file` so every demo gap is exactly `gap` seconds of silence, keeping
 * 0.1 s of room tone either side so breaths are not clipped. Returns where each
 * gap starts in the new file.
 */
export function spaceForDemos(file: string, gap = DEMO_GAP): number[] {
	const pad = 0.1;
	const found = silences(file, MIN_DEMO_GAP);
	const total = duration(file);
	const parts: string[] = [];
	const labels: string[] = [];
	const at: number[] = [];
	let from = 0;
	let t = 0;
	found.forEach(([start, end], i) => {
		parts.push(`[0]atrim=${from}:${start + pad},asetpts=PTS-STARTPTS[s${i}]`);
		parts.push(`aevalsrc=0:s=44100:d=${gap - 2 * pad}[g${i}]`);
		labels.push(`[s${i}]`, `[g${i}]`);
		t += start + pad - from;
		at.push(Number((t - pad).toFixed(3)));
		t += gap - 2 * pad;
		from = end - pad;
	});
	parts.push(`[0]atrim=${from}:${total},asetpts=PTS-STARTPTS[tail]`);
	labels.push("[tail]");
	const graph = `${parts.join(";")};${labels.join("")}concat=n=${labels.length}:v=0:a=1,aformat=channel_layouts=mono[out]`;
	const spaced = file.replace(/\.mp3$/, ".spaced.mp3");
	execFileSync("ffmpeg", ["-y", "-v", "error", "-i", file, "-filter_complex", graph, "-map", "[out]", "-b:a", "192k", spaced]);
	execFileSync("mv", [spaced, file]);
	return at;
}

async function download(url: string, file: string): Promise<void> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
	await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
}

/** Read `text` with `voice`; returns the gateway URL and request id. */
export async function speak(text: string, voice: string, delivery: Delivery = DELIVERY) {
	const { data, requestId } = await ai.subscribe<{ audio: { url: string } }>(TTS_MODEL, {
		input: { text, voice, ...delivery },
	});
	if (!data.audio?.url) throw new Error(`${TTS_MODEL} returned no audio: ${JSON.stringify(data)}`);
	return { url: data.audio.url, requestId };
}

async function transcribe(file: string): Promise<string> {
	const audio_url = new Blob([await fs.readFile(file)], { type: "audio/mpeg" });
	const { data } = await ai.subscribe<{ text: string }>(STT_MODEL, { input: { audio_url, language_code: "en" } });
	return data.text ?? "";
}

/** Each candidate reads the reference script; the audio lands in assets/character/rin-voice/. */
export async function auditionVoices(voices: readonly string[] = CANDIDATES): Promise<Audition[]> {
	loadEnv();
	await fs.mkdir(voiceDir(), { recursive: true });
	const spoken = words(REFERENCE_SCRIPT).length;
	const results: Audition[] = [];
	for (const voice of voices) {
		console.log(`[voice] ${voice}…`);
		const { url, requestId } = await speak(REFERENCE_SCRIPT, voice);
		const file = path.join(voiceDir(), `audition-${voice.toLowerCase()}.mp3`);
		await download(url, file);
		const raw = duration(file);
		const speaking = raw - silences(file, MIN_DEMO_GAP).reduce((sum, [start, end]) => sum + end - start, 0);
		const gaps = spaceForDemos(file);
		const seconds = duration(file);
		const transcript = await transcribe(file);
		const wer = wordErrorRate(REFERENCE_SCRIPT, transcript);
		const wordsPerMinute = (spoken / speaking) * 60;
		results.push({ voice, file, url, requestId, seconds, wordsPerMinute, transcript, gaps, wer });
		const note = gaps.length === REFERENCE_GAPS ? "" : ` (expected ${REFERENCE_GAPS} demo gaps)`;
		console.log(`[voice] ${voice}: ${seconds.toFixed(1)} s, ${Math.round(wordsPerMinute)} wpm, ${gaps.length} demo gaps${note}, WER ${(wer * 100).toFixed(1)}%`);
	}
	await fs.writeFile(path.join(voiceDir(), "auditions.json"), JSON.stringify({ model: TTS_MODEL, delivery: DELIVERY, script: REFERENCE_SCRIPT, results }, null, 2));
	return results;
}

/** Record `voice` as Rin's, with the delivery settings and its audition as the reference clip. */
export async function saveVoice(voice: string, audition: Audition, notes: string): Promise<string> {
	const reference = path.join(voiceDir(), "rin-reference.mp3");
	await fs.copyFile(audition.file, reference);
	const metaPath = path.join(ROOT, "assets/character/rin-voice.json");
	const meta = {
		name: "rin",
		model: TTS_MODEL,
		voice,
		delivery: DELIVERY,
		demoPause: { tag: DEMO_PAUSE, gapSeconds: DEMO_GAP, at: audition.gaps },
		notes,
		reference: path.relative(ROOT, reference),
		referenceScript: REFERENCE_SCRIPT,
		requestId: audition.requestId,
		seconds: Number(audition.seconds.toFixed(2)),
		wordsPerMinute: Math.round(audition.wordsPerMinute),
		wer: Number(audition.wer.toFixed(3)),
		generatedAt: new Date().toISOString(),
	};
	await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
	return metaPath;
}
