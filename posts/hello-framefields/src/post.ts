/**
 * Hello, framefields: the account's first post. The mark builds itself, the
 * line writes itself and the install command types itself; then the address.
 */
import { Backdrop, em, Headline, Label, look, Mark, Terminal } from "@framefields-social/brand";
import { post, scene, seq, stagger, wait } from "@framefields-social/kit";
import { rich, Transition } from "framefields";

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

const signoff = scene(
	"signoff",
	({ stage, clock: { beats } }) => {
		new Backdrop();
		const [top, name, address] = stage.safe.middle(0.5).rows(3, 1.2, 0.8);
		const mark = new Mark(top.center(top.height));
		const title = new Headline("framefields", name, { align: "center", max: 120 });
		const url = new Label("framefields.dev", address, { align: "center", mono: true });

		return seq(stagger(beats(0.75), mark.enter(), title.enter(), url.enter()), wait(beats(4)));
	},
	{ transition: ({ beats }) => Transition.fadeThrough(beats(1)) },
);

export default post({
	slug: "hello-framefields",
	title: "Hello, framefields",
	caption: "Video, written in code. framefields renders TypeScript on the GPU: no browser, no timeline to drag. npm install framefields",
	look,
	scenes: [hook, signoff],
});
