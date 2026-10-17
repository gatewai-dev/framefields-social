/**
 * The framefields ident: four seconds on black that open any video, played
 * to a soft rising melody. The word flows in one wave across the notes; the
 * mark frames up on the first, grows its branch through the middle and lays
 * its play head down on the last, where the word settles. The light breathes
 * with the music's loudness, and everything drifts gently toward us until it
 * fades out with the chord.
 */
import { after, all, follow, lasting, scene, sound } from "@framefields-social/kit";
import { Backdrop } from "../cast/backdrop.js";
import { Glow } from "../cast/glow.js";
import { Headline } from "../cast/headline.js";
import { Mark } from "../cast/mark.js";
import { palette, sounds } from "../look.js";

/** The melody opens with its own breath of near-silence, so it starts with the picture. */
const CUE = 0;
/** One ease for everything that arrives: fast enough to feel the note, long enough to glide. */
const GLIDE = "power3.out";

export const intro = scene("intro", ({ stage, clock }) => {
	const length = clock.seconds(4);
	const out = length - 26;
	// Frames, from the top of the scene, where the melody's notes land.
	const notes = sounds.intro.notes(clock).map((n) => CUE + n);
	const [first, second, third] = notes;
	const last = notes[notes.length - 1];

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
			after(CUE, sound(sounds.intro)),
			glow.set({ opacity: 0 }),
			// The light wakes on the first note and breathes with the music from there.
			after(first, follow(glow.body, "opacity", sounds.intro, { quiet: 0, loud: 1, from: first - CUE, limit: length - first })),
			after(first, glow.from({ scale: 0.5 }, { dur: length - first, ease: "sine.out" })),

			// The mark builds on the notes.
			after(first, mark.frame({ dur: 22, ease: GLIDE })),
			after(second, mark.land(0, { dur: 16, ease: "back.out(1.3)" })),
			after(second + 2, mark.grow({ dur: third - second + 16, ease: "sine.inOut" })),
			after(third + 6, mark.land(1, { dur: 16, ease: "back.out(1.3)" })),
			after(last - 4, mark.strike({ dur: 22, ease: "back.out(1.4)" })),

			// The word: one wave from the first note, settling just after the last.
			after(first, name.write((last + 14 - first) / clock.beat)),

			// A slow push-in on everything, so nothing is ever quite still.
			after(first, mark.from({ scale: 0.92 }, { dur: out - first, ease: "sine.out" })),
			after(first, name.from({ scale: 0.97 }, { dur: out - first, ease: "sine.out" })),

			after(out, all(
				mark.to({ opacity: 0, scale: 1.04 }, { dur: 26, ease: "sine.inOut" }),
				name.to({ opacity: 0 }, { dur: 22, ease: "sine.inOut" }),
			)),
		),
	);
});
