# Content Pipeline: Raw Video → Posted Content

The repeatable system for turning any client video (testimonial, behind-the-scenes, whatever) into posted content. Set up once, reuse forever.

**What Claude can/can't do (be real about this):**
- ❌ Can't play or scrub a `.mp4` directly — no native video processing
- ✅ Can read full transcripts (paste the text)
- ✅ Can read images — screenshots, still frames, cover photo options
- ✅ Can give real filming guidance (lighting, framing, audio, structure) from best practice

So the loop runs on **transcripts + screenshots**, not raw video. That's the real, working version — not a fake one.

## Tool: Canva (video editor, free tier)
Lucky's choice — manual timeline trimming, not transcript-based. You scrub to the moment and cut, instead of deleting text. Slightly more manual than Descript, but works fine for short clips, especially since Lucky already types out what's said in each clip as a manual "transcript" before editing (see Step 2 below) — that script tells you exactly which lines to find and trim to in Canva's timeline.

**Setup (one-time):** canva.com → free account → use the Video editor.

---

## STEP 0: Before You Even Record — The Checklist

Get this right once and every future testimonial looks twice as professional with zero extra effort.

**Lighting**
- Face the client toward a window or light source — never have the light behind them (silhouette kills it)
- Avoid overhead lighting only (creates harsh shadows under eyes) — a lamp at face height or natural daylight is best
- If indoors with bad light: open the blinds, that's usually enough

**Framing**
- Vertical (9:16) if this is going straight to Reels/Stories — shoot vertical from the start, don't crop later
- Eye-level with the camera, not looking down at it
- Headroom: leave a little space above the head, don't center the face dead in the middle
- Background: something relevant (their shop, their van, their workspace) beats a blank wall — it adds context for free

**Audio**
- This matters more than video quality — phone mic is fine if you're close (within 1-1.5m)
- Avoid recording near traffic/wind/fans — background noise is the #1 thing that makes UGC look amateur
- If outdoors, get close and shield the mic from wind with your body

**The Ask (what to prompt the client to say)**
- Don't feed them a script — ask a question that pulls the story out naturally:
  - "What was it like before we started working together?"
  - "Why did you end up bringing your other businesses on too?"
  - "What would you tell someone on the fence about working with me?"
- Let them ramble a bit — more raw footage means more options when editing. You cut the gold line out later.

---

## STEP 1-7: Record → Type Out Script → Get Cut Sheet → Edit in Canva → Post

1. **Record** using the checklist above
2. **Watch the clip back and type out what's said** (word-for-word, like a transcript) — paste it to Claude. This is how Claude reads content without watching the video itself.
3. **Claude gives you a cut sheet** — exact lines to KEEP vs. CUT, per clip, plus the stitch order if combining multiple clips
4. **Edit in Canva:** upload the raw clip(s), scrub to the KEEP lines from the cut sheet, trim out everything else, stitch clips in the given order, export
5. **Add text overlays/captions in Canva** if needed (burned-in captions help — most people watch muted)
6. **Export 2-3 still-frame screenshots** as candidate cover photos (Canva lets you grab a frame, or use your phone's screenshot tool)
7. **Bring the screenshots to Claude** → drop them in the vault → Claude reviews visually and picks the strongest cover

## Where it plugs into The Comeback
- Input: raw video → `03 Content/Testimonials/` (or relevant subfolder)
- Output: cut sheet + edited clip (Canva) + cover photo pick → caption drafts land in the matching brief file
- **Posting: organic only.** No paid ads right now — this is purely for IG/FB organic posts. Paid is a future-you decision once there's a real library of proven content, not part of the current plan.

## Status
> Set up: 2026-06-19
> First real run: Queenstown Cleaning testimonial (2 clips: `testiomoinal 1.mp4`, `test 2.mp4`)

<!-- TODO: Once you've run this a few times, note here what free-tier limits you hit, if any, and whether it's worth upgrading -->
