/**
 * The stage: one canvas a post is performed on. A post is written once against
 * a Stage and reads its proportions from it, so the same script plays as a
 * reel, a feed portrait, a square and a landscape cut.
 */
import { type Insets, Rect } from "./geometry.js";

export interface Format {
	readonly name: string;
	readonly width: number;
	readonly height: number;
	/** Edges the platform's own UI covers, as shares of the canvas. Words stay out. */
	readonly chrome: Required<Insets>;
}

const even = (share: number): Required<Insets> => ({ top: share, right: share, bottom: share, left: share });

export const FORMATS = {
	/** Reels, TikTok, Shorts, Stories: the caption, buttons and handle eat the bottom and right. */
	reel: { name: "reel", width: 1080, height: 1920, chrome: { top: 0.1, right: 0.13, bottom: 0.22, left: 0.06 } },
	/** Instagram and LinkedIn feed. */
	portrait: { name: "portrait", width: 1080, height: 1350, chrome: even(0.07) },
	/** Feed square, X, Threads. */
	square: { name: "square", width: 1080, height: 1080, chrome: even(0.07) },
	/** YouTube, X and LinkedIn landscape. */
	landscape: { name: "landscape", width: 1920, height: 1080, chrome: even(0.07) },
} as const satisfies Record<string, Format>;

export type FormatName = keyof typeof FORMATS;

export function format(name: string): Format {
	if (!(name in FORMATS)) throw new Error(`Unknown format "${name}". Formats: ${Object.keys(FORMATS).join(", ")}`);
	return FORMATS[name as FormatName];
}

export type Orientation = "portrait" | "landscape" | "square";

export class Stage {
	/** The whole canvas. */
	readonly frame: Rect;
	/** Where it is safe to put words: the canvas less the platform's chrome. */
	readonly safe: Rect;
	/** One design pixel: designs are drawn on a 1080 short side and scale from it. */
	readonly u: number;

	constructor(readonly format: Format) {
		const { width, height, chrome } = format;
		this.frame = new Rect(0, 0, width, height);
		this.safe = this.frame.inset({
			top: chrome.top * height,
			right: chrome.right * width,
			bottom: chrome.bottom * height,
			left: chrome.left * width,
		});
		this.u = Math.min(width, height) / 1080;
	}

	get width(): number {
		return this.format.width;
	}
	get height(): number {
		return this.format.height;
	}

	get orientation(): Orientation {
		const { width, height } = this.format;
		return width === height ? "square" : height > width ? "portrait" : "landscape";
	}

	/** A length drawn on the 1080 design grid, in this canvas's pixels. */
	readonly px = (designPixels: number): number => designPixels * this.u;

	/** One value per orientation; square falls back to portrait. */
	pick<T>(choices: { portrait: T; landscape: T; square?: T }): T {
		const o = this.orientation;
		return o === "square" ? (choices.square ?? choices.portrait) : choices[o];
	}
}
