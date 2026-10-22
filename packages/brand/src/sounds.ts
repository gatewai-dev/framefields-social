/**
 * The sound library: motion-graphics effects, each a raw file in
 * assets/audio/ (Git LFS) plus what the studio heard in it through the look's
 * master bus. Run `pnpm studio listen <name>` after adding or replacing one;
 * `gain` trims a sound in dB, calibrated against `pnpm studio render`'s QA.
 */
import path from "node:path";
import { Sound } from "@framefields-social/kit";
import blip from "../../../assets/audio/sfx-blip.json" with { type: "json" };
import { ASSETS } from "./look.js";

const file = (name: string) => path.join(ASSETS, "audio", `${name}.mp3`);

export const sounds = {
	/** One soft, rounded digital blip on C5, 0.3 s: the moment something clicks into place. */
	blip: new Sound(file("sfx-blip"), blip, { gain: 3.5 }),
} as const;
