/**
 * An actor is a character in a post: it has a mark on stage, a look, and verbs
 * it knows how to perform. A subclass draws itself once, at rest, and exposes
 * verbs (enter, type, assemble…) that return Actions; the script decides when
 * each one happens. Complex characters keep more than one limb, so their
 * parts can move on their own.
 */
import type { AnimatableNode, LayoutNode } from "framefields";
import type { Action } from "./action.js";
import { casting } from "./casting.js";
import type { Rect } from "./geometry.js";
import { Limb, type Pose, type RestPose, type Tween } from "./limb.js";
import type { Motion } from "./look.js";
import { fade, type Move } from "./moves.js";
import type { Stage } from "./stage.js";
import type { Clock, Frames } from "./time.js";

/** What an actor learns about its scene once the script has been played. */
export interface Performance {
	/** The scene's length in frames. */
	readonly duration: Frames;
}

export abstract class Actor<N extends LayoutNode = LayoutNode> {
	readonly id: string;
	readonly stage: Stage;
	readonly clock: Clock;
	readonly motion: Motion;
	/** The actor's mark: where it stands at rest. */
	readonly box: Rect;
	/** The actor as a whole: its rest pose is its mark on stage. */
	readonly body: Limb;

	/** `box` defaults to the whole frame. `rest` adds props the body animates beyond place and opacity. */
	constructor(box?: Rect, rest: RestPose = {}) {
		const scene = casting();
		this.stage = scene.stage;
		this.clock = scene.clock;
		this.motion = scene.motion;
		this.box = box ?? scene.stage.frame;
		this.body = this.limb({ opacity: 1, scale: 1, rotation: 0, x: this.box.x, y: this.box.y, ...rest });
		this.id = scene.join(this, kebab(new.target.name));
	}

	/** How this actor arrives and leaves when the script doesn't say. */
	protected get entrance(): Move {
		return fade();
	}

	/** Draws the actor at rest, with its parts' limbs bound. Called once, after the script has played. */
	protected abstract draw(performance: Performance): AnimatableNode<N>;

	/** The finished layer: the drawing, moved by everything the script wrote. */
	render(performance: Performance): AnimatableNode<N> {
		return this.body.bind(this.draw(performance));
	}

	enter(move: Move = this.entrance): Action {
		return move(this, "in");
	}
	exit(move: Move = this.entrance): Action {
		return move(this, "out");
	}
	to(pose: Pose, tween?: Tween): Action {
		return this.body.to(pose, tween);
	}
	from(pose: Pose, tween?: Tween): Action {
		return this.body.from(pose, tween);
	}
	set(pose: Pose): Action {
		return this.body.set(pose);
	}

	/** A part that moves on its own. Bind it to the part's node in draw(). */
	protected limb(rest: RestPose): Limb {
		return new Limb(rest, { dur: this.clock.beats(this.motion.beats), ease: this.motion.travel });
	}

	/** An id for one of this actor's nodes. */
	protected part(name: string): string {
		return `${this.id}.${name}`;
	}
}

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
