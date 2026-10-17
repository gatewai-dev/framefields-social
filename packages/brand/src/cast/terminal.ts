/**
 * A one-line shell: a prompt, a command that types itself with the caret one
 * step behind each letter, and a caret that blinks whenever nobody is typing.
 */
import { type Action, Actor, action, type Frames, type Limb, type Move, type Performance, type Rect, rise } from "@framefields-social/kit";
import { type AnimatableNode, type BoxNode, FontManager, Layer } from "framefields";
import { palette, typeface } from "../look.js";

export interface TerminalOptions {
	/** The largest type size, in design pixels; long commands shrink to fit the box. */
	size?: number;
}

export class Terminal extends Actor<BoxNode> {
	private readonly command = this.limb({ text: 1 });
	private readonly caret: Limb;
	private readonly typing: Array<readonly [Frames, Frames]> = [];
	private readonly fontSize: number;
	/** Advance of one monospace character. */
	private readonly char: number;
	private readonly pad: number;

	constructor(
		readonly line: string,
		box: Rect,
		{ size = 40 }: TerminalOptions = {},
	) {
		super(box);
		const em = FontManager.measure("M", { fontFamily: typeface.mono, fontSize: 100 }).width / 100;
		// Two ems of padding, then "$ ", the command and the caret.
		this.fontSize = Math.min(this.stage.px(size), box.width / (1.8 + (line.length + 3) * em));
		this.char = em * this.fontSize;
		this.pad = 0.9 * this.fontSize;
		this.caret = this.limb({ x: this.caretX(line.length), opacity: 1 });
	}

	/** Types the command at `cps` characters a second. */
	type({ cps = 16 }: { cps?: number } = {}): Action {
		const n = this.line.length;
		const dur = this.clock.seconds(n / cps);
		return action(dur, (at) => {
			this.typing.push([at, at + dur]);
			this.command.key("text", at, 0).key("text", at + dur, 1, "none");
			for (let i = 0; i <= n; i++) this.caret.key("x", at + (dur * i) / n, this.caretX(i), "hold");
		});
	}

	protected override get entrance(): Move {
		return rise({ distance: 40 });
	}

	protected draw({ duration }: Performance): AnimatableNode<BoxNode> {
		this.blink(duration);
		const { x, y, width, height } = this.box;
		const card = this.fontSize * 2.4;
		const line = this.fontSize * 1.3;
		const baseline = (card - line) / 2;
		const mono = { fontFamily: typeface.mono, fontSize: this.fontSize, verticalAlign: "middle" } as const;

		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			children: [
				Layer.box({
					id: this.part("card"),
					position: "absolute",
					x: 0,
					y: (height - card) / 2,
					width,
					height: card,
					background: palette.glass,
					borderColor: palette.line,
					borderWidth: this.stage.px(1.5),
					borderRadius: this.fontSize * 0.5,
					children: [
						Layer.text("$", {
							id: this.part("prompt"),
							position: "absolute",
							x: this.pad,
							y: baseline,
							width: this.char * 2,
							height: line,
							...mono,
							fill: palette.sky,
						}),
						this.command.bind(
							Layer.text(this.line, {
								id: this.part("command"),
								position: "absolute",
								x: this.caretX(0),
								y: baseline,
								width: width - this.caretX(0) - this.pad,
								height: line,
								...mono,
								fill: palette.paper,
							}),
						),
						this.caret.bind(
							Layer.box({
								id: this.part("caret"),
								position: "absolute",
								x: this.caretX(this.line.length),
								y: baseline + line * 0.12,
								width: this.char * 0.6,
								height: line * 0.76,
								background: palette.sky,
							}),
						),
					],
				}),
			],
		});
	}

	/** Where the caret sits after `chars` characters. */
	private caretX(chars: number): number {
		return this.pad + (2 + chars) * this.char;
	}

	/** On a beat, off a beat, except while typing. */
	private blink(duration: Frames): void {
		const step = this.clock.beats(1);
		for (let f = 0, on = true; f < duration; f += step, on = !on) {
			const busy = this.typing.some(([start, end]) => f + step > start && f < end + step);
			this.caret.key("opacity", f, busy || on ? 1 : 0, "hold");
		}
	}
}
