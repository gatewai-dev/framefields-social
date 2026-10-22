/**
 * The framefields ident: four seconds on black that open any video. It builds
 * in silence: the light comes up, the frame draws on, the nodes land and the
 * branch grows while the word flows in. Then one sound, a single soft blip,
 * exactly as the play head clicks into place and the light flares.
 */
import { after, all, lasting, scene, sound } from "@framefields-social/kit";
import { Backdrop } from "../cast/backdrop.js";
import { Glow } from "../cast/glow.js";
import { Headline } from "../cast/headline.js";
import { Mark } from "../cast/mark.js";
import { palette } from "../look.js";
import { sounds } from "../sounds.js";

/** When each beat of the ident happens, in frames from the top. */
const AT = {
	frame: 2,
	word: 14,
	firstNode: 28,
	branch: 32,
	secondNode: 44,
	strike: 54,
} as const;
const GLIDE = "power3.out";

export const intro = scene("intro", ({ stage, clock }) => {
	const length = clock.seconds(4);
	const out = length - 26;

	new Backdrop({ tone: "black" });
	const markBox = stage.frame.middle(0.4).shift(0, -stage.px(60)).center(stage.px(360));
	const glow = new Glow(markBox.center(stage.px(1100)), { strength: 0.45 });
	const mark = new Mark(markBox);
	const name = new Headline("framefields", markBox.below(stage.px(120), stage.px(64)).with({ x: 0, width: stage.width }), {
		align: "center",
		max: 96,
		fill: palette.paper,
	});

	return lasting(
		length,
		all(
			// Light first, from the very first frame; then the frame draws on and
			// the swoosh peaks as the corners close.
			glow.from({ opacity: 0, scale: 0.4 }, { dur: 30, ease: "sine.out" }),
			after(AT.frame, mark.frame({ dur: 20, ease: GLIDE })),

			// The word flows in under it.
			after(AT.word, name.write((AT.strike + 8 - AT.word) / clock.beat)),

			// The nodes land and the branch grows between them.
			after(AT.firstNode, mark.land(0, { dur: 14, ease: "back.out(1.4)" })),
			after(AT.branch, mark.grow({ dur: 14, ease: "sine.inOut" })),
			after(AT.secondNode, mark.land(1, { dur: 14, ease: "back.out(1.4)" })),

			// The click: play head, blip, light flare.
			after(AT.strike, all(
				mark.strike({ dur: 18, ease: "back.out(1.6)" }),
				sound(sounds.blip, { on: "peak" }),
				glow.to({ opacity: 1, scale: 1.15 }, { dur: 5, ease: "power2.out" }),
			)),
			after(AT.strike + 5, glow.to({ opacity: 0.6, scale: 1 }, { dur: 36, ease: "sine.inOut" })),

			// A slow push-in on everything, so nothing is ever quite still.
			after(AT.frame, mark.from({ scale: 0.92 }, { dur: out - AT.frame, ease: "sine.out" })),
			after(AT.word, name.from({ scale: 0.97 }, { dur: out - AT.word, ease: "sine.out" })),

			after(out, all(
				mark.to({ opacity: 0, scale: 1.04 }, { dur: 26, ease: "sine.inOut" }),
				name.to({ opacity: 0 }, { dur: 22, ease: "sine.inOut" }),
				glow.to({ opacity: 0 }, { dur: 26, ease: "sine.inOut" }),
			)),
		),
	);
});
