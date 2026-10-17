/**
 * Listening: what a script needs to know about a sound to move with it. The
 * loudness envelope (one value per frame, 0–1) and the note onsets (seconds,
 * found by spectral flux) go into a JSON file beside the audio, read by the
 * brand at build time, so renders and previews never decode audio to sync.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import type { Analysis } from "@framefields-social/kit";

const RATE = 22050;
const WINDOW = 2048;
const HOP = 512;

export async function listen(file: string, fps = 30): Promise<string> {
	const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(RATE), "-f", "f32le", "-"], {
		maxBuffer: 1 << 28,
	});
	const samples = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
	const analysis: Analysis = { fps, envelope: envelope(samples, fps), onsets: onsets(samples) };
	const out = file.replace(/\.\w+$/, ".json");
	await fs.writeFile(out, `${JSON.stringify(analysis)}\n`);
	return out;
}

/** RMS loudness per frame, scaled so the loudest frame is 1. */
function envelope(samples: Float32Array, fps: number): number[] {
	const step = RATE / fps;
	const rms = Array.from({ length: Math.ceil(samples.length / step) }, (_, i) => {
		const frame = samples.subarray(Math.round(i * step), Math.round((i + 1) * step));
		return Math.sqrt(frame.reduce((sum, s) => sum + s * s, 0) / Math.max(1, frame.length));
	});
	const loudest = Math.max(...rms) || 1;
	return rms.map((v) => Math.round((v / loudest) * 1000) / 1000);
}

/** Where new notes start: peaks in how much the spectrum grows from one window to the next. */
function onsets(samples: Float32Array): number[] {
	const hann = Float32Array.from({ length: WINDOW }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (WINDOW - 1)));
	let previous: Float64Array | undefined;
	const flux: number[] = [];
	for (let start = 0; start + WINDOW <= samples.length; start += HOP) {
		const re = new Float64Array(WINDOW);
		for (let i = 0; i < WINDOW; i++) re[i] = samples[start + i] * hann[i];
		const spectrum = magnitudes(re).map((m) => Math.log1p(m * 10));
		if (previous) flux.push(spectrum.reduce((sum, m, i) => sum + Math.max(0, m - (previous as Float64Array)[i]), 0));
		previous = spectrum;
	}
	const mean = flux.reduce((a, b) => a + b, 0) / flux.length;
	const sd = Math.sqrt(flux.reduce((a, b) => a + (b - mean) ** 2, 0) / flux.length);
	const z = flux.map((f) => (f - mean) / sd);
	const found: number[] = [];
	for (let i = 1; i < z.length - 1; i++) {
		const t = ((i + 1) * HOP) / RATE;
		const peak = z[i] > 1.2 && z[i] >= z[i - 1] && z[i] >= z[i + 1];
		if (peak && (!found.length || t - found[found.length - 1] > 0.1)) found.push(Math.round(t * 1000) / 1000);
	}
	return found;
}

/** Magnitude spectrum of a power-of-two real signal (iterative radix-2 FFT). */
function magnitudes(re: Float64Array): Float64Array {
	const n = re.length;
	const im = new Float64Array(n);
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) [re[i], re[j]] = [re[j], re[i]];
	}
	for (let size = 2; size <= n; size <<= 1) {
		const angle = (-2 * Math.PI) / size;
		for (let start = 0; start < n; start += size) {
			for (let k = 0; k < size / 2; k++) {
				const wr = Math.cos(angle * k);
				const wi = Math.sin(angle * k);
				const a = start + k;
				const b = a + size / 2;
				const tr = re[b] * wr - im[b] * wi;
				const ti = re[b] * wi + im[b] * wr;
				re[b] = re[a] - tr;
				im[b] = im[a] - ti;
				re[a] += tr;
				im[a] += ti;
			}
		}
	}
	return Float64Array.from({ length: n / 2 + 1 }, (_, i) => Math.hypot(re[i], im[i]));
}
