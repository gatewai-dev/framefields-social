/**
 * Geometry. Layout is done by carving rectangles: start from the stage's safe
 * area and slice, split and inset until each actor has its mark. Rects are
 * immutable, so every step reads as a phrase: stage.safe.top(0.4).inset(48).
 */

export type Insets = { top?: number; right?: number; bottom?: number; left?: number };

export class Rect {
	constructor(
		readonly x: number,
		readonly y: number,
		readonly width: number,
		readonly height: number,
	) {}

	get cx(): number {
		return this.x + this.width / 2;
	}
	get cy(): number {
		return this.y + this.height / 2;
	}
	get x2(): number {
		return this.x + this.width;
	}
	get y2(): number {
		return this.y + this.height;
	}

	/** The top `share` (0–1) of this rect. */
	top(share: number): Rect {
		return new Rect(this.x, this.y, this.width, this.height * share);
	}
	bottom(share: number): Rect {
		const h = this.height * share;
		return new Rect(this.x, this.y2 - h, this.width, h);
	}
	left(share: number): Rect {
		return new Rect(this.x, this.y, this.width * share, this.height);
	}
	right(share: number): Rect {
		const w = this.width * share;
		return new Rect(this.x2 - w, this.y, w, this.height);
	}
	/** A full-width band `share` tall, centered vertically. */
	middle(share: number): Rect {
		const h = this.height * share;
		return new Rect(this.x, this.cy - h / 2, this.width, h);
	}

	/** Pixels in from each edge: one number for all four, or per edge. */
	inset(by: number | Insets): Rect {
		const { top = 0, right = 0, bottom = 0, left = 0 } =
			typeof by === "number" ? { top: by, right: by, bottom: by, left: by } : by;
		return new Rect(this.x + left, this.y + top, this.width - left - right, this.height - top - bottom);
	}

	/** A `width` × `height` rect centered in this one. */
	center(width: number, height = width): Rect {
		return new Rect(this.cx - width / 2, this.cy - height / 2, width, height);
	}

	/** Stacks rows whose heights follow `weights`: rows(1, 2) is a third over two thirds. */
	rows(...weights: number[]): Rect[] {
		const total = weights.reduce((a, b) => a + b, 0);
		let y = this.y;
		return weights.map((w) => {
			const h = (this.height * w) / total;
			const row = new Rect(this.x, y, this.width, h);
			y += h;
			return row;
		});
	}
	cols(...weights: number[]): Rect[] {
		const total = weights.reduce((a, b) => a + b, 0);
		let x = this.x;
		return weights.map((w) => {
			const width = (this.width * w) / total;
			const col = new Rect(x, this.y, width, this.height);
			x += width;
			return col;
		});
	}

	/** The band of `height` just under this rect, `gap` below it. */
	below(height: number, gap = 0): Rect {
		return new Rect(this.x, this.y2 + gap, this.width, height);
	}
	above(height: number, gap = 0): Rect {
		return new Rect(this.x, this.y - gap - height, this.width, height);
	}

	shift(dx: number, dy = 0): Rect {
		return new Rect(this.x + dx, this.y + dy, this.width, this.height);
	}
	with(changes: Partial<Pick<Rect, "x" | "y" | "width" | "height">>): Rect {
		const { x = this.x, y = this.y, width = this.width, height = this.height } = changes;
		return new Rect(x, y, width, height);
	}
}
