/**
 * Listening: what a script needs to know about a sound to move with it. The
 * sound is rendered through the look's master bus with framefields, exactly
 * as a video will play it, and AudioSignal measures that loudness frame by
 * frame. Notes belong to the music, not the mix, so they are found in the
 * dry render, before compression lifts the quiet parts and the room smears
 * the attacks: a spectral-flux pass proposes onsets, and only those where
 * the pitch moves count as notes, so a bowed or sung line doesn't read its
 * vibrato as a run of new notes. Both go into a JSON
 * file beside the audio, read by the brand at build time, so renders and
 * previews never decode audio to sync.
 */
import fs from "node:fs/promises";
import type { Analysis, Look } from "@framefields-social/kit";
import { AudioSignal, Composition, HeadlessMediaRenderer, Layer } from "framefields";

const WINDOW = 2048;
const HOP = 512;

export async function listen(file: string, look: Look): Promise<string> {
	const { fps } = look.tempo;
	const { channels, sampleRate } = await hear(file, look.master ?? [], fps);
	const dry = await hear(file, [], fps);
	const { energy, numFrames } = await AudioSignal.extractFromChannels(channels, sampleRate, { fps });
	const levels = Array.from({ length: numFrames }, (_, frame) => {
		energy.seekFrame?.(frame);
		return energy.value;
	});
	const loudest = Math.max(...levels) || 1;
	const analysis: Analysis = {
		fps,
		envelope: levels.map((v) => Math.round((v / loudest) * 1000) / 1000),
		onsets: notes(mono(dry.channels), dry.sampleRate),
	};
	const out = file.replace(/\.\w+$/, ".json");
	await fs.writeFile(out, `${JSON.stringify(analysis)}\n`);
	return out;
}

/** The sound as a post plays it through `effects`, mixed by framefields. */
async function hear(file: string, effects: Look["master"] & object, fps: number): Promise<{ channels: Float32Array[]; sampleRate: number }> {
	const { durationSec } = await AudioSignal.extract(file, { fps });
	const frames = Math.ceil(durationSec * fps);
	const listening = new Composition({ width: 16, height: 16, fps, durationFrames: frames });
	listening.add(effects.reduce((layer, effect) => layer.apply(effect), Layer.audio(file, { id: "listen", durationFrames: frames })));
	return new HeadlessMediaRenderer().renderAudio(await listening.toVirtualMediaAsync(), { fps });
}

const mono = (channels: Float32Array[]) =>
	Float32Array.from(channels[0], (_, i) => channels.reduce((sum, c) => sum + c[i], 0) / channels.length);

/** Where new notes start: peaks in how much the spectrum grows from one window to the next. */
function onsets(samples: Float32Array, rate: number): number[] {
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
	// The cut at the end of the file reads as a jump in the spectrum; a note can't start there.
	const end = samples.length / rate - 0.1;
	for (let i = 1; i < z.length - 1; i++) {
		const t = ((i + 1) * HOP) / rate;
		const peak = t < end && z[i] > 1.2 && z[i] >= z[i - 1] && z[i] >= z[i + 1];
		if (peak && (!found.length || t - found[found.length - 1] > 0.1)) found.push(Math.round(t * 1000) / 1000);
	}
	return found;
}

/** Onsets where the pitch moves to a new semitone: the melody's notes. */
function notes(samples: Float32Array, rate: number): number[] {
	let previous: number | undefined;
	return onsets(samples, rate).filter((t) => {
		const semitone = pitch(samples, rate, t);
		const moved = semitone !== previous;
		previous = semitone;
		return moved;
	});
}

/** The strongest partial in the cello-to-voice range just after `t`, in semitones from A4. */
function pitch(samples: Float32Array, rate: number, t: number): number {
	const size = 8192;
	const start = Math.round((t + 0.08) * rate);
	const re = new Float64Array(size);
	for (let i = 0; i < size && start + i < samples.length; i++) re[i] = samples[start + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1)));
	const spectrum = magnitudes(re);
	let peak = 0;
	for (let i = 1; i < spectrum.length; i++) {
		const hz = (i * rate) / size;
		if (hz > 60 && hz < 1000 && spectrum[i] > spectrum[peak]) peak = i;
	}
	return Math.round(12 * Math.log2((peak * rate) / size / 440));
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
