# framefields-social

The videos behind the [framefields](https://github.com/gatewai-dev/framefields) social accounts, in the open. Every post is a TypeScript composition rendered with framefields, so you can read exactly how it was made.

## A post is a play

```ts
const hook = scene("hook", ({ stage, clock: { beats } }) => {
	new Backdrop();
	const [top, middle, bottom] = stage.safe.rows(2, 3, 1.5);
	const mark = new Mark(top.center(stage.px(240)));
	const title = new Headline(rich`Video,\n${em("written in code.")}`, middle, { align: "center" });
	const shell = new Terminal("npm install framefields", bottom);

	return seq(
		stagger(beats(1), mark.enter(), title.enter(), shell.enter()),
		shell.type(),
		wait(beats(4)),
		stagger(beats(0.25), mark.exit(), title.exit(), shell.exit()),
	);
});
```

- **Actors** are characters: they have a mark on stage, a look, and verbs (`enter`, `type`, `assemble`). Making one inside a scene puts it on stage, back to front.
- **Actions** are values: a length plus what to write onto the timeline. `seq`, `all`, `stagger`, `wait` and `meanwhile` compose them, and a scene is the one action its script returns, so scenes size themselves.
- **Limbs** are an actor's moving parts. Each remembers where it stands, so moves chain (`to`, `from`, `by(-40)`) without anyone tracking positions.
- **Moves** (`fade`, `rise`, `slide`, `pop`, `mix`) work both ways: one move gives the entrance and the matching exit.
- **Stage and Clock** keep posts free of magic numbers: layout is carved from `stage.safe` in design pixels, and time is counted in beats.

## Layout

```
packages/kit     the language: Clock, Rect, Stage, Action, Actor, Limb, moves, scene, post
packages/brand   the framefields look and the cast: Backdrop, Mark, Headline, Label, Terminal
posts/<slug>     one post each; src/post.ts default-exports post({ ... })
apps/studio      the CLI that renders them
assets/          brand art, fonts and sounds (Git LFS)
output/<slug>/   the rendered MP4s and contact sheets (Git LFS)
```

## Studio

```bash
pnpm studio list
pnpm studio grid intro --format all
pnpm studio frames intro 0 30 60
pnpm studio preview intro
pnpm studio render intro --format all
```

Formats: `reel`, `portrait`, `square`, `landscape`. Output lands in `output/<slug>/` and is committed through Git LFS, so every post ships with its renders.

## License

Apache-2.0 (see [LICENCE](LICENCE)).
