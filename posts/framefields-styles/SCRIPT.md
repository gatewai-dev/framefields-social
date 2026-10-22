# 20 video styles you can make with framefields: script

Rin works at framefields and talks from the office, so she doesn't explain the product: a quick hello, one line, and straight into counting. She presents 20 visual styles. While she names each one, the frame splits: Rin stays on top and a demo made in framefields plays in the bottom section.

- **Format:** reel, 9:16 (1080×1920), about 75 s
- **Host:** Rin (`assets/character/rin.png`), framed waist-up and talking with her hands, in the framefields studio set (`assets/sets/framefields-studio.png`) with the sign behind her. Voice by `elevenlabs/tts/eleven-v4-turbo`, lipsync by `minimax/h3-max/lip-sync/image-to-video`
- **Structure:** hook (full frame), then 20 styles in split screen (Rin on top, demo below), then outro (full frame)
- **Rhythm:** about 3 s per style: her line plus a 1.2 s gap, while the demo plays below

---

## Spoken script (Rin)

This is the exact text for the voice and lipsync take. `[pause]` marks a cut point where a demo goes in (see [PLAN.md](PLAN.md)). In the master take each pause is a short beat of about 0.6 s with Rin holding a neutral smile and her hands back at rest. The edit removes those beats.

> **HOOK**
> Hellooo! I'll show you what video styles you can create with framefields. [pause]
>
> 1. Number one: Web one point oh. [pause]
> 2. Two: Topographic. [pause]
> 3. Three: Psychedelic. [pause]
> 4. Four: Watercolour. [pause]
> 5. Five: Teletext. [pause]
> 6. Six: Origami. [pause]
> 7. Seven: Thermal camera. [pause]
> 8. Eight: Memphis. [pause]
> 9. Nine: Flow field. [pause]
> 10. Ten: Neumorphism. [pause]
> 11. Eleven: Word art. [pause]
> 12. Twelve: Collage. [pause]
> 13. Thirteen: Datamosh. [pause]
> 14. Fourteen: Spirograph. [pause]
> 15. Fifteen: Aurora. [pause]
> 16. Sixteen: Op art. [pause]
> 17. Seventeen: Light painting. [pause]
> 18. Eighteen: One-bit dither. [pause]
> 19. Nineteen: Skeuomorphic. [pause]
> 20. And twenty: Retro desktop. [pause]
>
> **OUTRO**
> Every one of these is just code. Which one are you making first? Link's in the bio.

**Voice direction:** warm and upbeat, like a creator talking to their followers, not a narrator. She stretches the "Hellooo" at the start. She says each number quickly and gives the style name a little lift. Pace picks up slightly through the teens. In the outro, "just code" lands with a small smile.

### Hands

Rin talks with her hands the whole way through, like a real creator. The lipsync model takes no prompt, so this table is a guide for judging takes rather than something we can direct. During counting her hands are cut away by the split screen, so the hook and the outro are where her gestures show.

| Line | Gesture |
|------|---------|
| Hook: "Hellooo!" | A big wave with one hand |
| Hook: "I'll show you" | Both hands open wide, palms out, as if presenting what's coming |
| Hook: "with framefields" | Points down and to the side, toward where the demos appear |
| Numbers 1–20 | Shows the number on her fingers for 1–5; for 6 and up, alternates gestures so it doesn't repeat: a quick point at the camera, a snap, an open palm presenting the style name, a "chef's kiss", a finger frame (thumbs and fingers making a rectangle) |
| 17: "Light painting" | Draws a swoosh in the air with one finger (matches the demo) |
| 20: "And twenty" | Holds up both hands, fingers spread, then claps once |
| Outro: "just code" | Mimes typing on a keyboard in the air |
| Outro: "Which one are you making first?" | Points at the camera |
| Outro: "Link's in the bio." | Points down toward the caption/bio |

---

## Layout: split screen while she counts

From "Number one" to "And twenty", the frame splits in two. Her hands and the desk are cut away, and the demo plays in the bottom section, so Rin and the style she is naming are on screen together. The vision-tracked panel held between her hands (discussed earlier) is set aside in favour of this; the style label sits on the seam instead.

```
┌──────────────────────┐  0
│  framefields sign    │
│   Rin, head and      │  top: 1080×864 (45%)
│   shoulders, talking │  the master take, slid up
├══ 01 · WEB 1.0 ══════┤  864: seam, glowing cobalt line + style label
│                      │
│        DEMO          │  bottom: 1080×1056 (55%)
│                      │  the style being named
│                      │
└──────────────────────┘  1920
```

- **Top section:** the same uncut master take (`rin-master-768p.mp4`), scaled to fill the frame as in the hook and simply moved up, so the section shows the sign, her face and her shoulders (source rows ≈ 260–865 of 1344). No re-scale, so it's one continuous shot of her.
- **Opening the split** (at "Number one", 5.98 s): over about 0.4 s Rin slides up into the top section while the demo section rises from the bottom edge with a rounded top and a glowing cobalt seam, with a `sfx-blip`.
- **Between styles:** Rin keeps talking on top without any cut. The bottom section switches to the next demo at the start of each counting line, with a quick transition matched to the style (hard cut, glitch, wipe), so each demo gets 2.7–3.6 s including the 1.2 s gap after her line.
- **Closing the split** (at the outro, 65.74 s): the reverse move; the demo section drops away and Rin is full frame for "Every one of these is just code…".
- **Hook and outro** stay full frame, so her hand gestures there are fully visible. During counting her hands are cut away, so the gestures that matter are the ones in the hook and the outro.

---

## Shot list

Times come from the recorded voiceover (`assets/audio/framefields-styles/rin-vo.json`): each style's window runs from the start of Rin's line to the start of the next one, so it includes her line plus the 1.2 s gap after it. Rin's master take plays without a single cut until the outro.

| # | Time (s) | Layout | Content |
|---|----------|--------|---------|
| 0 | 0.00–4.78 | Full frame | Hook: "Hellooo! I'll show you what video styles you can create with framefields." Title card animates in: **20 video styles** |
| 0b | 4.78–5.98 | Full frame | Fast teaser in the first gap: 6 of the 20 styles flash by at 4 frames each |
| 1 | 5.98–9.54 | Split | **Web 1.0**: Rin says the line on top, the demo plays below (3.6 s) |
| 2 | 9.54–12.32 | Split | **Topographic**: Rin says the line on top, the demo plays below (2.8 s) |
| 3 | 12.32–15.29 | Split | **Psychedelic**: Rin says the line on top, the demo plays below (3.0 s) |
| 4 | 15.29–18.06 | Split | **Watercolour**: Rin says the line on top, the demo plays below (2.8 s) |
| 5 | 18.06–20.94 | Split | **Teletext**: Rin says the line on top, the demo plays below (2.9 s) |
| 6 | 20.94–23.80 | Split | **Origami**: Rin says the line on top, the demo plays below (2.9 s) |
| 7 | 23.80–26.88 | Split | **Thermal camera**: Rin says the line on top, the demo plays below (3.1 s) |
| 8 | 26.88–29.61 | Split | **Memphis**: Rin says the line on top, the demo plays below (2.7 s) |
| 9 | 29.61–32.48 | Split | **Flow field**: Rin says the line on top, the demo plays below (2.9 s) |
| 10 | 32.48–35.42 | Split | **Neumorphism**: Rin says the line on top, the demo plays below (2.9 s) |
| 11 | 35.42–38.17 | Split | **Word art**: Rin says the line on top, the demo plays below (2.8 s) |
| 12 | 38.17–40.94 | Split | **Collage**: Rin says the line on top, the demo plays below (2.8 s) |
| 13 | 40.94–43.91 | Split | **Datamosh**: Rin says the line on top, the demo plays below (3.0 s) |
| 14 | 43.91–47.04 | Split | **Spirograph**: Rin says the line on top, the demo plays below (3.1 s) |
| 15 | 47.04–49.88 | Split | **Aurora**: Rin says the line on top, the demo plays below (2.8 s) |
| 16 | 49.88–52.74 | Split | **Op art**: Rin says the line on top, the demo plays below (2.9 s) |
| 17 | 52.74–55.91 | Split | **Light painting**: Rin says the line on top, the demo plays below (3.2 s) |
| 18 | 55.91–59.08 | Split | **1-bit dither**: Rin says the line on top, the demo plays below (3.2 s) |
| 19 | 59.08–62.20 | Split | **Skeuomorphic**: Rin says the line on top, the demo plays below (3.1 s) |
| 20 | 62.20–65.74 | Split | **Retro desktop**: Rin says the line on top, the demo plays below (3.5 s) |
| 21 | 65.74–71.05 | Full frame | Outro: the demo section slides away and Rin is full frame again. Then the framefields ident (`intro` scene, 4 s) |

About 75 s in total, ident included.

---

## Demo briefs

Each demo plays in the bottom section of the split screen, **1080×1056 (close to square)**, for 2.7–3.6 s (see the shot list). Design every demo for that box, not for the full 9:16 frame. Each one stars the same subject so the styles are easy to compare: **Rin herself**, taken from a lipsync clip. Where a style is pure design work rather than a filter on footage, Rin appears inside the design (in a window, card or frame).

The recipe column lists the framefields feature behind the style (from `framefields-effects` → `references/style-guide.md`), so the caption and the code can name the same thing.

| # | Style | What we see | framefields recipe |
|---|-------|-------------|--------------------|
| 1 | Web 1.0 | A 1998 homepage: tiled starfield background, a "Welcome to Rin's Homepage!!" marquee, a visitor counter ticking up, an "under construction" bar, and Rin in a bevelled table cell | Layout, boxes and `LayerStyle` bevels; Times/Comic-style fonts; `stepped(2)` motion |
| 2 | Topographic | Rin's face becomes a contour map. The isolines drift as she turns her head, and the paper fill fades in | `Styles.topographic()` / `Contour` (`fill: "source"` → `flat`) |
| 3 | Psychedelic | A kaleidoscope of Rin that rotates and cycles through hues, leaving trails | `Styles.kaleidoscope()` + `Modulate` hue cycling + `Trails` (`hueShift`) |
| 4 | Watercolour | Rin is painted in, from wet edges to finished portrait, over paper grain | `Styles.watercolor()` + paper texture with `blendMode: "multiply"`, slow ease |
| 5 | Teletext | A Ceefax page: "P100 FRAMEFIELDS" header, blocky Rin in teletext colours, a monospace news ticker | `Styles.teletext()` + monospace grid layout |
| 6 | Origami | Paper panels fold in one crease at a time to form a frame around Rin, on a paper texture | Shapes with drop shadows + `stepped(2)` + paper texture (`multiply`) |
| 7 | Thermal camera | Rin in heat vision: a reticle tracks her face and a temperature readout shows "36.6°C" | `Styles.thermal()` + detection box from `withVision` driving the reticle |
| 8 | Memphis | Squiggles, triangles and polka-dot shapes pop in around Rin's cutout in pastel colours | Shapes + bold palette; `withVision({ mode: "matte" })` cutout |
| 9 | Flow field | Thousands of particles stream through curl noise and wrap around Rin's silhouette | `Layer.particles` with `noise` + `push: { person }`, vision cutout on top |
| 10 | Neumorphism | Soft extruded UI cards (play button, toggle, "Rin" profile card) press in and out | `LayerStyle` inner and drop shadows on an off-white background, `spring` eases |
| 11 | Word art | "FRAMEFIELDS" in rainbow-gradient, 3D-slanted 90s word art swoops in behind Rin | Text + gradient fill + skew/perspective + `LayerStyle` shadow; subject sandwich |
| 12 | Collage | Rin is cut out like a sticker with a white stroke, layered with torn paper, tape and magazine letters | `withVision({ mode: "matte" })` + `LayerStyle` stroke and shadow, `stepped(2)` |
| 13 | Datamosh | A clean frame of Rin, then the next shot's motion smears through her face and snaps clean on the beat | `Datamosh({ keyframes })`, with the keyframe on the beat |
| 14 | Spirograph | Hypotrochoid curves draw themselves around Rin in neon strokes, then rotate | Vector paths with stroke `trimEnd` draw-on + rotation |
| 15 | Aurora | Green-to-violet northern lights ripple behind Rin's cutout | `Layer.vfx({ effectType: "Aurora" })` + matte cutout, slow ease |
| 16 | Op art | Rin is redrawn in black-and-white waving stripes that bend with her features | `Styles.opArt()` (`pattern: "waves"`) |
| 17 | Light painting | Rin's hand traces a glowing ribbon in the dark that writes "ff" | `Layer.particles` `blend: "add"` following a tracked wrist (`person.point("rightWrist")`) |
| 18 | 1-bit dither | A Mac Paint-style Rin, black and white Bayer dither, in a classic window frame | `Styles.oneBit()` / `Dither` `bayer` |
| 19 | Skeuomorphic | An old iPhone-style app: glossy leather and stitching, a bevelled camera icon that opens on Rin | `LayerStyle` bevel, gloss gradients, textures |
| 20 | Retro desktop | A Win95/Mac OS 9 desktop: Rin's video plays in a draggable window, and error pop-ups cascade out of it | Layout + bevelled windows + `stepped(2)` drag; window cascade with `stagger` |

### Notes on footage
- **Demos 2, 3, 4, 5, 7, 13, 16 and 18** are filters on footage. They need a short clip of Rin moving: a slight head turn, a blink, a smile, her hands in motion (B-roll, no talking). One 6–8 s B-roll clip covers all of them.
- **Demo 17** uses the gesture clip (`rin-gesture.mp4`): Rin sweeps her hand through the frame and the light follows her tracked wrist.
- **Demos 8, 9, 12 and 15** need a clean person matte, so use the B-roll on a plain background.
- **Demos 1, 6, 10, 11, 14, 19 and 20** are design scenes. Rin can be a still or the B-roll inside a frame.

---

## On-screen text

- **Hook title:** "20 video styles" (large, Unbounded)
- **Style label (every demo):** a number chip + the style name in Unbounded, sitting on the seam between Rin and the demo (`Label` from `packages/brand`). It changes with each style, on the start of her line.
- **Captions:** burned-in, word-by-word captions for the hook and the outro. During counting the style label already says what she says, so no captions there.
- **Progress:** a thin 20-segment bar along the seam (or the top edge) that fills as each style is shown (keeps people watching to the end)
- **Outro end card:** framefields logo + "framefields.dev" + "Link in bio"

## Sound

- **Bed:** an upbeat lo-fi/electronic loop at about 120 BPM. It sits under Rin the whole time and lifts a little in each 1.2 s gap.
- **SFX:** `sfx-blip` when the split opens and on each demo switch; a style-matched hit inside some demos (a dial-up modem chirp for Web 1.0, a static burst for Teletext and Datamosh, a paper fold for Origami, a click for Neumorphism and Retro desktop, a Windows-style error "ding" for the pop-ups)
- **Rin's voice:** the master take's own soundtrack, uninterrupted from start to end. Demos add music and SFX only.
