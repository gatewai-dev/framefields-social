/**
 * When things happen, read from the recorded voiceover rather than typed in:
 * rin-vo.json holds where each 1.2 s demo gap starts, so the split opens on
 * "Number one", each demo lands on its line and the split closes on the
 * outro. Re-record the voiceover and every cue moves with it.
 */
import path from "node:path";
import { ASSETS } from "@framefields-social/brand";
import type { Clock, Frames } from "@framefields-social/kit";
import vo from "../../../assets/audio/framefields-styles/rin-vo.json" with { type: "json" };

export const VOICEOVER = path.join(ASSETS, "audio/framefields-styles/rin-vo.mp3");
/** Rin's lipsync take of that voiceover: 768×1344, 24 fps, the same 71 s. */
export const MASTER = path.join(ASSETS, "video/framefields-styles/rin-master-768p.mp4");
export const MASTER_SIZE = { width: 768, height: 1344 } as const;

export const STYLES = [
	"Web 1.0",
	"Topographic",
	"Psychedelic",
	"Watercolour",
	"Teletext",
	"Origami",
	"Thermal camera",
	"Memphis",
	"Flow field",
	"Neumorphism",
	"Word art",
	"Collage",
	"Datamosh",
	"Spirograph",
	"Aurora",
	"Op art",
	"Light painting",
	"1-bit dither",
	"Skeuomorphic",
	"Retro desktop",
] as const;

/** A demo's window in the scene: it lands at `from` and runs `length` frames. */
export interface Window {
	readonly index: number;
	readonly name: string;
	readonly from: Frames;
	readonly length: Frames;
}

export interface Cues {
	/** The hello line ends and the first gap begins: the teaser flashes here. */
	readonly teaser: Frames;
	/** The split opens: Rin starts "Number one". */
	readonly open: Frames;
	readonly demos: readonly Window[];
	/** The split closes: Rin starts the outro. */
	readonly close: Frames;
	/** The whole take. */
	readonly total: Frames;
}

/** Each demo lands this many frames before Rin says its number. */
const LEAD = 2;

export function cues(clock: Clock): Cues {
	const gaps = vo.demoGap.at;
	const gap = vo.demoGap.seconds;
	if (gaps.length !== STYLES.length + 1) throw new Error(`rin-vo.json has ${gaps.length} demo gaps; the reel needs ${STYLES.length + 1}.`);
	// Line i starts as gap i ends: the hello line's gap, then one after each style.
	const lineStart = (i: number) => clock.seconds(gaps[i] + gap) - LEAD;
	const close = lineStart(STYLES.length);
	const demos = STYLES.map((name, index) => {
		const from = lineStart(index);
		return { index, name, from, length: lineStart(index + 1) - from };
	});
	return { teaser: clock.seconds(gaps[0]), open: demos[0].from, demos, close, total: clock.seconds(vo.seconds) };
}
