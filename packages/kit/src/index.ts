/**
 * The kit: a small language for writing videos as plays. A post is scenes; a
 * scene casts actors on a stage and returns one Action; actions compose with
 * seq, all and stagger; actors move through limbs that remember where they are.
 */
export { type Action, action, after, all, lasting, meanwhile, seq, stagger, wait } from "./action.js";
export type { SoundCue } from "./casting.js";
export { Actor, type Performance } from "./actor.js";
export { type Insets, Rect } from "./geometry.js";
export { by, Limb, type Pose, type RestPose, type Target, type Tween, type Value } from "./limb.js";
export type { Look, Motion, Typeface } from "./look.js";
export { type Direction, fade, mix, type Move, move, type Phase, pop, rise, slide, type Timing } from "./moves.js";
export { Post, post, type PostDefinition } from "./post.js";
export { type Cue, Scene, type SceneOptions, type Script, scene, type Take } from "./scene.js";
export { FORMATS, type Format, type FormatName, format, type Orientation, Stage } from "./stage.js";
export { type Analysis, follow, Sound, sound } from "./sound.js";
export { Clock, type Frames, type Tempo } from "./time.js";
