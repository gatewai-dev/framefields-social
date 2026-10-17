/**
 * The framefields mark as a character. Four corners frame the shot, a branch
 * grows between two nodes, and the play head drops in: assemble() builds it in
 * that order. The drawing is the logo's own geometry (assets/brand/logo.svg,
 * a 512 grid) scaled into the actor's box, so it is the mark, not a likeness.
 */
import { type Action, Actor, type Limb, type Move, pop, type Rect, stagger, type Tween } from "@framefields-social/kit";
import { type AnimatableNode, type BoxNode, Layer, type ShapeNode } from "framefields";
import { palette } from "../look.js";

const GRID = 512;
const CORNERS = [
	"M 184 56 L 86 56 Q 56 56 56 86 L 56 184",
	"M 328 56 L 426 56 Q 456 56 456 86 L 456 184",
	"M 184 456 L 86 456 Q 56 456 56 426 L 56 328",
	"M 328 456 L 426 456 Q 456 456 456 426 L 456 328",
];
const BRANCH = "M 176 182 L 176 330 M 176 182 C 176 256 236 256 276 256";
const NODES = [
	[176, 172],
	[176, 340],
] as const;
const NODE_RADIUS = 32;
const PLAY = "M 284 200 L 362 256 L 284 312 Z";
/** The play head's bounds, its round stroke included: it scales about its own center. */
const PLAY_BOX = { x: 267, y: 183, width: 112, height: 146 };

export interface MarkOptions {
	color?: string;
}

export class Mark extends Actor<BoxNode> {
	private readonly corners = this.limb({ trimEnd: 1, opacity: 1 });
	private readonly branch = this.limb({ trimEnd: 1, opacity: 1 });
	private readonly nodes = NODES.map(() => this.limb({ scale: 1, opacity: 1 }));
	private readonly play = this.limb({ scale: 1, opacity: 1, rotation: 0 });
	private readonly color: string;
	/** Logo units to pixels. */
	private readonly k: number;

	constructor(box: Rect, { color = palette.signal }: MarkOptions = {}) {
		super(box);
		this.color = color;
		this.k = Math.min(box.width, box.height) / GRID;
	}

	/** Corners draw on, the first node lands, the branch grows to the second, the play head drops in. */
	assemble(): Action {
		return stagger(this.clock.beats(0.375), this.frame(), this.land(0), this.grow(), this.land(1), this.strike());
	}

	/** The four corners draw on together: the shot is framed. */
	frame(tween: Tween = {}): Action {
		return this.corners.from({ trimEnd: 0, opacity: 0 }, { dur: this.clock.beats(1.5), ease: "expo.inOut", ...tween });
	}

	/** Node `which` (0 top, 1 bottom) lands with a bounce. */
	land(which: 0 | 1, tween: Tween = {}): Action {
		return this.nodes[which].from({ scale: 0, opacity: 0 }, { dur: this.clock.beats(0.75), ease: "back.out(2.2)", ...tween });
	}

	/** The branch grows from the top node toward the play head. */
	grow(tween: Tween = {}): Action {
		return this.branch.from({ trimEnd: 0, opacity: 0 }, { dur: this.clock.beats(1), ease: "power3.inOut", ...tween });
	}

	/** The play head drops in, turning into place. */
	strike(tween: Tween = {}): Action {
		return this.play.from({ scale: 0, opacity: 0, rotation: -40 }, { dur: this.clock.beats(1), ease: "back.out(1.6)", ...tween });
	}

	protected override get entrance(): Move {
		return (actor, phase) => (phase === "in" ? this.assemble() : pop({ from: 0.85 })(actor, phase));
	}

	protected draw(): AnimatableNode<BoxNode> {
		const { x, y, width, height } = this.box;
		const size = GRID * this.k;
		// The logo's 512 square, centered in the box.
		const ox = (width - size) / 2;
		const oy = (height - size) / 2;
		const stroke = (d: string, weight: number, id: string, limb: Limb) =>
			limb.bind(this.path(id, d, ox, oy, size, size, { strokeColor: this.color, strokeWidth: weight * this.k }));

		return Layer.box({
			id: this.id,
			position: "absolute",
			x,
			y,
			width,
			height,
			children: [
				...CORNERS.map((d, i) => stroke(d, 34, `corner-${i + 1}`, this.corners)),
				stroke(BRANCH, 28, "branch", this.branch),
				...NODES.map(([cx, cy], i) =>
					this.nodes[i].bind(
						Layer.shape("circle", {
							id: this.part(`node-${i + 1}`),
							position: "absolute",
							x: ox + (cx - NODE_RADIUS) * this.k,
							y: oy + (cy - NODE_RADIUS) * this.k,
							width: 2 * NODE_RADIUS * this.k,
							height: 2 * NODE_RADIUS * this.k,
							fill: this.color,
						}),
					),
				),
				this.play.bind(
					this.path(
						"play",
						translate(PLAY, -PLAY_BOX.x, -PLAY_BOX.y),
						ox + PLAY_BOX.x * this.k,
						oy + PLAY_BOX.y * this.k,
						PLAY_BOX.width * this.k,
						PLAY_BOX.height * this.k,
						{ fill: this.color, strokeColor: this.color, strokeWidth: 34 * this.k, strokeLineJoin: "round" },
					),
				),
			],
		});
	}

	/** A logo path, scaled from logo units, drawn in a box at (x, y). */
	private path(
		name: string,
		d: string,
		x: number,
		y: number,
		width: number,
		height: number,
		paint: Partial<ShapeNode> & { fill?: string },
	): AnimatableNode<ShapeNode> {
		return Layer.shape("path", {
			id: this.part(name),
			position: "absolute",
			x,
			y,
			width,
			height,
			d: scale(d, this.k),
			fillType: paint.fill ? "solid" : "none",
			strokeLineCap: "round",
			strokeLineJoin: "round",
			...paint,
		});
	}
}

/** The logo's paths are absolute M/L/Q/C/Z with space-separated numbers, so numbers come in x, y pairs. */
const mapPairs = (d: string, f: (x: number, y: number) => [number, number]) => {
	const out: string[] = [];
	let x: number | undefined;
	for (const token of d.trim().split(/\s+/)) {
		if (/^[A-Za-z]$/.test(token)) out.push(token);
		else if (x === undefined) x = Number(token);
		else {
			const [px, py] = f(x, Number(token));
			out.push(`${round(px)} ${round(py)}`);
			x = undefined;
		}
	}
	return out.join(" ");
};
const round = (n: number) => Math.round(n * 100) / 100;
const scale = (d: string, k: number) => mapPairs(d, (x, y) => [x * k, y * k]);
const translate = (d: string, dx: number, dy: number) => mapPairs(d, (x, y) => [x + dx, y + dy]);
