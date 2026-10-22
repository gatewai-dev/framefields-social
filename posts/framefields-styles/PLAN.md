# 20 video styles you can make with framefields: production plan

How we get from Rin's character plate to the final reel. The words and shots are in [SCRIPT.md](SCRIPT.md). The spoken lines for the voice take are in [vo.txt](vo.txt).

**Approach:** record and lipsync **one continuous master take** of Rin reading the whole script, in one lipsync call with no length limit. Then cut that take at each `[pause]` and drop a framefields demo into every gap. One take keeps her look, lighting and voice the same all the way through. It also means the 20 demos can be built and changed without touching the talking head.

```
vo.txt ──elevenlabs/tts/eleven-v4-turbo──▶ rin-vo.mp3 ──┐
                                                        ├──minimax/h3-max/lip-sync/image-to-video──▶ rin-master.mp4 ──cut at pauses──▶ 22 Rin clips
rin plate (9:16, hands in frame) ───────────────────────┘                                                                                   │
rin B-roll (no talking) ──▶ subject for footage demos ──▶ 20 demo scenes ─────────┤
                                                                                  ▼
                                                    posts/framefields-styles/src/post.ts
                                                    (hook, 20 × [Rin, demo], outro, ident)
                                                                                  ▼
                                                    output/framefields-styles/reel.mp4
```

---

## Phase 1: Assets for Rin

| Step | Output | Notes |
|------|--------|-------|
| 1.0 Set ✅ | `assets/sets/framefields-studio.png` (9:16), `framefields-studio-landscape.png` | A friendly creator studio: warm off-white wall, plants, oak shelf, paper lamp, blue accents, and the real framefields sign (mark + Unbounded wordmark, blue backlight) in the upper third so it stays visible above Rin's head. Made with `openai/gpt-image-2.5/sunburst/edit` from the actual wordmark as reference (`pnpm generate:set`, script in `src/generate-set.ts`, prompt and request ID in the `.json` next to each image). The landscape version is for the later `landscape` cut. |
| 1.1 Talking plate | `assets/character/rin-talk.png` (9:16) | `rin.png` is a 4:3 model sheet with three views and text. Lipsync needs a single front-facing shot of Rin, in the same outfit, **sitting in the set (1.0)** on the chair at the desk, with the framefields sign readable above her head. **Frame it waist-up with both hands visible**, relaxed at chest height in front of her: the lipsync model can only animate hands that are already in the picture. Make it as an `openai/gpt-image-2.5/sunburst/edit` edit with `rin.png` and `framefields-studio.png` as references, so her face and the set both stay the same. |
| 1.2 Voice ✅ | `assets/character/rin-voice.json` | **Laura** on `elevenlabs/tts/eleven-v4-turbo` (stability 0.4, similarity 0.78, seed 7), chosen from eight stock voices by transcript accuracy, pitch range and by ear (`pnpm generate:voice`). Reference clip: `assets/character/rin-voice/rin-reference.mp3`. |
| 1.3 VO take ✅ | `assets/audio/framefields-styles/rin-vo.mp3` | The whole of `vo.txt` in one call (`pnpm generate:vo`), ~71 s. Each `[pause]` is spoken as `[long pause]` (the model ignores `<break time>`) and then set to exactly 1.2 s of silence, so all 21 demo gaps are the same length. Their start times are in `rin-vo.json` → `demoGap.at`: those are the cut points. |
| 1.4 Lipsync master | `assets/video/framefields-styles/rin-master.mp4` | Model: **`minimax/h3-max/lip-sync/image-to-video`** through the framefields AI gateway (`ai.subscribe`, as in `apps/studio/src/character.ts`). Inputs: the talking plate (1.1) as the image and `rin-vo.mp3` (1.3) as the audio. Send the **full ~90 s take in one call, with no length limit set**. Prompt for expressive, natural hand gestures as she talks (counting on her fingers, pointing, open palms; see "Hands" in SCRIPT.md), with her hands back at rest during each pause. Target 1080×1920 at 30 fps. Save the model ID, request ID and settings next to the video in `rin-master.json`, the same way `rin.json` records the plate. Check for mouth artefacts around 20 s and 60 s, where long takes tend to drift. |
| 1.5 B-roll | `assets/video/framefields-styles/rin-broll.mp4` | 6–8 s of Rin not talking: a small head turn, a blink, a smile, and her hands moving (a wave, framing her face with her fingers). This is the subject for the filter demos, so her hands show up in those too. Image-to-video from the same plate. |
| 1.6 Gesture clip | `assets/video/framefields-styles/rin-gesture.mp4` | Rin sweeps one hand slowly across the frame, as if drawing in the air, for Light painting (17). The particles follow her tracked wrist. |

All media goes in through Git LFS, the same as the existing character plate.

**Lipsync length:** we start with the whole take in one call and no limit. Splitting is only a fallback if that call is rejected: cut `rin-vo.mp3` at `[pause]` silences into chunks, run each with the same plate, and join them. Every join falls on a pause, which the edit removes.

## Phase 2: Cut list

1. The 21 demo gaps are already measured: `rin-vo.json` → `demoGap.at` (each 1.2 s long). Turn them into the in and out points of the 22 Rin clips (hook, 20 lines, outro) in `posts/framefields-styles/cuts.json`.
2. Each Rin clip keeps 2 frames of air at the front and 4 at the back so the cut lands on a closed mouth.
3. The timings in the SCRIPT shot list are targets. The real lengths come from the VO, and the composition sizes itself from `cuts.json`. We don't hand-tune timecodes.

## Phase 3: Demo scenes

Build each demo as its own scene in the post folder, roughly 2.8 s or 5–6 beats at 120 BPM. Group the work by technique so similar demos share code:

| Group | Demos | Shared piece |
|-------|-------|--------------|
| A. Filter on B-roll (`Styles.*`) | 2 Topographic, 3 Psychedelic, 4 Watercolour, 5 Teletext, 7 Thermal, 13 Datamosh, 16 Op art, 18 1-bit | One "B-roll + style" scene factory, plus a small extra per demo (reticle, Ceefax header, window frame) |
| B. Cutout + background | 8 Memphis, 9 Flow field, 12 Collage, 15 Aurora | `withVision({ mode: "matte" })` Rin cutout on top of a generated background |
| C. Design and UI scenes | 1 Web 1.0, 6 Origami, 10 Neumorphism, 11 Word art, 19 Skeuomorphic, 20 Retro desktop | Window and card components with `LayerStyle` bevels and shadows |
| D. Procedural drawing | 14 Spirograph, 17 Light painting | Path draw-on (`trimEnd`) and additive particles |

Suggested build order: **A** (fastest, proves the pipeline), then **B**, **D**, and **C** last (the most design work).

Things that can go into `packages/brand` for later posts: `StyleLabel` (number chip + name), `ProgressBar` (20 segments), `Caption` (word-pop captions from the VO timings), and `RinClip` (plays one cut from the master take).

## Phase 4: Assembly

- `posts/framefields-styles/src/post.ts`: hook, teaser, 20 × `seq(rinClip(i), demo(i))`, outro, then the `intro` ident.
- Cuts from Rin into a demo are hard cuts on the beat, with a `sfx-blip`. Cuts back to Rin are hard cuts as well, which keeps the pace up.
- The style label, the progress bar and captions sit on top of the scenes, so they stay sharp on every style.
- Music: the 120 BPM bed ducks about −10 dB under Rin's clips.

## Phase 5: Review and render

1. `pnpm studio grid framefields-styles` → check one frame from each demo on the contact sheet.
2. `pnpm studio preview framefields-styles` → check the lipsync, the hands (no extra fingers, no warping), cut points and audio ducking.
3. `pnpm studio render framefields-styles --format reel` → `output/framefields-styles/reel.mp4`.
4. Later: `square` and `landscape` versions, with Rin in a side panel and the demos filling the rest.

## Checklist

- [x] 1.0 Set with the framefields sign (portrait + landscape)
- [ ] 1.1 9:16 talking plate approved (looks like Rin, sitting in the set)
- [x] 1.2 Rin's voice on `elevenlabs/tts/eleven-v4-turbo` chosen and saved (Laura)
- [x] 1.3 VO generated in one call, 21 demo gaps of 1.2 s (pronunciation: check by ear)
- [ ] 1.4 Lipsync master (`minimax/h3-max/lip-sync/image-to-video`, one call, no limit) approved, hands moving naturally
- [ ] 1.5 B-roll generated
- [ ] 1.6 Gesture clip
- [ ] 2 `cuts.json` from the VO silences
- [ ] 3A Filter demos (8)
- [ ] 3B Cutout demos (4)
- [ ] 3C Design demos (6)
- [ ] 3D Drawing demos (2)
- [ ] 4 Assembly, label, progress bar, captions, music
- [ ] 5 Grid review → preview → reel render

## Open questions

- **Length:** about 90 s for all 20. If retention is a concern, we could split it into two posts ("Part 1: 1–10", "Part 2: 11–20"). That needs only one extra hook line each and the same master take.
- **Subject:** the plan uses Rin as the subject of every demo so the styles are easy to compare. The other option is stock or generated scenes (a city, a dancer, a product) for variety.
- **Teaser (shot 0b):** keep it, or go straight from the hook into #1?
