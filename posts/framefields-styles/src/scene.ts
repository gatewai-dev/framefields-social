/**
 * The whole reel but the ident, as one scene sized by Rin's voiceover. She
 * says hello full frame; on "Number one" the frame splits and she slides up
 * while the demos rise into the box below, one per line, each named on the
 * seam; on the outro the box drops away and she is full frame again.
 */
import { after, all, lasting, meanwhile, scene, sound } from "@framefields-social/kit";
import { Headline, palette, sounds } from "@framefields-social/brand";
import { Styles } from "framefields";
import { Demo, Panel } from "./cast/demo.js";
import { Flash, Host } from "./cast/host.js";
import { Pill } from "./cast/pill.js";
import { Seam } from "./cast/seam.js";
import { Tag } from "./cast/tag.js";
import { cues, MASTER, STYLES, VOICEOVER } from "./cues.js";
import { DEMOS } from "./demos/index.js";
import { layout } from "./layout.js";

/** The looks that flash over Rin in the first gap, a teaser of what's coming. */
const TEASER = [Styles.thermal(), Styles.teletext({ pixelSize: 14 }), Styles.topographic({ levels: 14 }), Styles.opArt({ pattern: "waves" }), Styles.oneBit(), Styles.kaleidoscope({ segments: 8 })];

export const styles = scene("styles", ({ stage, clock }) => {
	const cue = cues(clock);
	const { host: hostBox, lift, seam, demo } = layout(stage);
	const split = clock.beats(0.8);
	const travel = "expo.out";

	const host = new Host(hostBox, MASTER);
	const flashLength = Math.floor((cue.open - cue.teaser) / TEASER.length);
	TEASER.forEach((look, i) => new Flash(hostBox, MASTER, cue.teaser + i * flashLength, flashLength, look));

	// Over the wall above the sign, so it never covers her face or hands.
	const titleBand = stage.safe.top(0.16).shift(0, stage.px(20));
	const title = new Headline("20 video styles", titleBand, { align: "center", max: 104, fill: palette.navy });

	const panel = new Panel(demo);
	// The last demo plays on through the close, so it rides the box down.
	const demos = cue.demos.map((window, i) =>
		new Demo(demo, i === cue.demos.length - 1 ? { ...window, length: window.length + split } : window, DEMOS[i]),
	);
	const line = new Seam(stage.frame.with({ y: seam - stage.px(40), height: stage.px(80) }));
	const tags = cue.demos.map(({ index, name }) => new Tag({ stage, seam, number: index + 1, name }));
	const outro = new Pill(stage, "framefields.dev  ·  link in bio", titleBand.cy);

	const [first] = demos;
	const last = demos[demos.length - 1];
	const below = { y: stage.height };

	return lasting(
		cue.total,
		all(
			meanwhile(sound(VOICEOVER)),

			// Hello, full frame, with the title over the wall.
			after(clock.beats(1), title.write(1.5)),
			after(cue.teaser - clock.beats(1), title.exit()),

			// "Number one": she slides up, the box rises with its first demo.
			after(cue.open, all(
				host.to({ y: hostBox.y - lift }, { dur: split, ease: travel }),
				panel.from(below, { dur: split, ease: travel }),
				first.from(below, { dur: split, ease: travel }),
				line.enter(),
				sound(sounds.blip, { on: "peak" }),
			)),

			// One tag and one step of progress per style; a soft blip on each switch.
			...cue.demos.map(({ from, length, index }) =>
				after(from, all(
					after(index === 0 ? split / 2 : 0, tags[index].enter()),
					line.progress(index + 1, STYLES.length),
					...(index === 0 ? [] : [sound(sounds.blip, { volume: 0.45 })]),
					after(Math.max(0, length - 4), tags[index].exit()),
				)),
			),

			// The outro: the box drops away and she is full frame again.
			after(cue.close, all(
				host.to({ y: hostBox.y }, { dur: split, ease: travel }),
				panel.to(below, { dur: split, ease: "power3.in" }),
				last.to(below, { dur: split, ease: "power3.in" }),
				line.exit(),
			)),
			after(cue.close + clock.beats(2), outro.enter()),
		),
	);
});
