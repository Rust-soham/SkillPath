# Skillpath Framer Submission Package

This is the working copy for the single document linked in Binary's required
**Technical Assessment** field. Replace every `[ADD LINK]` placeholder before
sharing it.

## Submission document

### Skillpath — Junior Full-Stack Developer Technical Assessment

**Published Framer site:** https://moody-partners-114745.framer.app/

**Public source code:** https://github.com/Rust-soham/SkillPath

**Shared AI conversation:** [ADD SHARED CODEX CHAT LINK]

### Reflection and AI disclosure (173 words)

I built the courses area as a React code component using the two provided GET
endpoints. It validates both responses, converts paise/cents before formatting,
and treats course and country failures independently. The catalogue supports
variable counts, responsive 3/2/1-column layouts, skeletons, retry, search, price
sorting, refundable badges, and designer-editable heading/accent controls.

With two more days, I would test more Framer layout combinations and add browser
coverage for intermediate widths, slow responses, and repeated failure/recovery.
I would also reduce the styling code: multiple visual directions helped me
explore, but the submitted Field Guide could use a smaller final-only stylesheet.
I am least happy with the country-failure fallback. Showing both currencies is
truthful and keeps the catalogue usable, but adds weight to every card.

I used OpenAI Codex for design exploration, test ideas, implementation review,
debugging, and documentation. AI proposed portions of the code and styling; I
inspected, revised, and tested the behavior, including API failures, currency
math, query policy, responsiveness, and final composition. The linked
conversation is the actual working chat, not a rewritten summary.

## Exact Framer setup

### 1. Create the page and breakpoints

1. Create a blank Framer site named `Skillpath`.
2. Rename the page `Home` and set its path to `/`.
3. Give the page a vertical Stack layout: width `Fill`, height `Fit Content`, gap
   `0`, overflow `Visible`, background `#EDF2EB`.
4. Keep Framer's Desktop breakpoint and add Tablet at `810px` and Phone at
   `390px`.
5. Set page min-width to `0` at every breakpoint. Do not apply a fixed page
   height.

Final top-level layer order:

```text
Home
├── Hero
├── SkillpathCourses (code component)
└── Footer
```

### 2. Build the original Field Guide hero with native Framer layers

Create `Hero` as a vertical Stack, width `Fill`, height `Fit Content`, min-height
`760px`, padding `24px 76px 96px`, gap `0`, background `#EDF2EB`, overflow
`Hidden`.

```text
Hero
├── Navigation
│   ├── Brand
│   │   ├── Brand Mark
│   │   └── Skillpath
│   └── Browse courses
└── Hero Content
    ├── Hero Copy
    │   ├── Eyebrow
    │   ├── Headline
    │   ├── Supporting copy
    │   └── Explore courses
    └── Learning Orbit
        ├── Outer Orbit
        ├── Inner Orbit
        ├── Waypoint Primary
        ├── Waypoint Secondary
        ├── Note 01
        ├── Note 02
        └── Note 03
```

`Navigation`: horizontal Stack, width `Fill`, justify `Space Between`, align
`Center`, padding-bottom `92px`. Brand is a horizontal Stack with a `18×18`
transparent ellipse using a `5px #176B52` border and the text `Skillpath`.
Connect `Browse courses` to the Courses section.

`Hero Content`: horizontal Stack, width `Fill`, max-width `1400px`, centered,
align `Center`, gap `88px`. Hero Copy width `Fill`; Learning Orbit width `420px`,
height `440px`, position `Relative`.

Copy:

- Eyebrow: `LEARN WHAT MOVES YOU`, 11px monospace, 800, 14% tracking,
  `#176B52`.
- Headline: `Learn boldly.\nMove deliberately.`, Iowan Old Style/Georgia,
  96px/0.86, medium, `#101714`.
- Supporting copy: `Practical courses for ambitious people who want useful
  skills, clearer systems, and momentum that lasts beyond the lesson.`, 18px/1.55,
  max-width `590px`, `#46534E`.
- Button: `Explore courses ↓`, height `50px`, padding `0 20px`, radius `3px`,
  fill and border `#176B52`, white 13px/800 text. Link it to Courses.

Orbit:

- Outer Orbit: `340×340`, right `0`, top `38`, transparent fill, `2px #66A18E`
  border, radius `100%`.
- Inner Orbit: `190×190`, centered inside Outer Orbit, transparent fill, `2px`
  dashed `#4E947E` border, radius `100%`.
- Primary waypoint: `54×54`, `#176B52`, radius `100%`, centered on the outer
  orbit near 2 o'clock.
- Secondary waypoint: `54×54`, `#9BC2B6`, radius `100%`, centered on the inner
  orbit at 6 o'clock.
- Notes: white Frames with `1px #101714` border, `5px 6px #77A999` shadow,
  `16px` padding. Use the labels `01 / LEARN`, `02 / PRACTICE`, `03 / APPLY`
  and titles `Practical ideas`, `Useful systems`, `Real momentum`. Arrange Notes
  01 and 02 down the left perimeter and Note 03 at the lower-right. Keep both
  waypoint centers visibly aligned with their orbit paths.

Tablet: Hero padding `24px 32px 72px`; Navigation padding-bottom `60px`; Hero
Content becomes vertical with gap `44px`; Learning Orbit width `Fill`, max-width
`520px`, height `390px`; headline `72px`.

Phone: Hero padding `20px 18px 58px`; Navigation padding-bottom `48px`; headline
`54px`; supporting copy `16px`; Learning Orbit height `320px`; scale notes to
roughly 43% of the art width and keep their text readable. Never hide the live
courses component to solve overflow.

### 3. Add the course code component

1. In **Assets → Code**, choose **Create Code File**.
2. Copy `src/SkillpathCourses.framer.tsx` from the public repository into
   `SkillpathCourses.tsx`. This self-contained Framer deployment file uses only
   React and Framer imports while retaining explicit runtime response validation.
3. The modular local implementation remains in `course.ts`, `course-api.ts`,
   `course-query.ts`, `course-runtime.ts`, and `SkillpathCourses.tsx`; it uses
   Zod, TanStack Query, and Better Result and is covered by the repository tests.
4. Insert only the default `SkillpathCourses` export onto the page between Hero and
   Footer. Set width `Fill`, height `Fit Content`, min-width `0`.
5. In its property panel set Heading to `Choose your next useful skill.` and
   Accent to `#176B52`. Change both once to prove the controls work, then restore
   the final values.
6. Rename the layer `SkillpathCourses — Live API`.

Do not place the hero or footer inside the course code component in Framer. The
native layers make page structure and responsive behavior easy for the reviewer
to inspect; the code boundary remains the dynamic array section requested by the
brief.

### 4. Build the footer with native Framer layers

Create `Footer` as a horizontal Stack, width `Fill`, height `Fit Content`, padding
`42px 76px`, justify `Space Between`, align `End`, gap `32px`, top border
`1px #AEB9B1`, background `#EDF2EB`.

```text
Footer
├── Footer Links
│   ├── Courses
│   ├── About Skillpath
│   └── Contact
└── Copyright
```

Footer Links is a wrapping horizontal Stack with `22px` gap. Use 13px/750 text.
Link Courses to the courses section, About Skillpath to the hero/top, and Contact
to `mailto:hello@skillpath.example`. Copyright is `© 2026 Skillpath. Built for
useful progress.`, 12px, `#46534E`.

Tablet: padding `36px 32px`. Phone: vertical Stack, align `Start`, padding
`34px 18px`, gap `28px`; keep Footer Links wrapping.

## Signed-out launch checklist

Run this after publishing and after making the source repository and submission
document public. Use a private/incognito window with no Framer, GitHub, Google,
or Codex session.

- [ ] Published Framer URL opens without login, permission prompt, or editor UI.
- [ ] Page loads over HTTPS and `/` does not redirect to a draft/project URL.
- [ ] Hero, live courses, and three-link footer appear in that order.
- [ ] A visible skeleton appears during a throttled/slow course request.
- [ ] Repeated hard reloads tolerate the API's variable 5–10 result count.
- [ ] A 404/500 produces a designed error/retry state, never a blank section or
      raw exception.
- [ ] Retry can recover without reloading the entire page.
- [ ] If courses succeed and country fails, cards remain usable and do not show a
      fabricated regional price.
- [ ] IN response formats `199900` paise as `₹1,999`, not `₹1,99,900`.
- [ ] US response formats `3999` cents as `$39.99`.
- [ ] Search, all sort options, and refundable-only badges behave correctly.
- [ ] Desktop shows 3 columns, tablet 2, and phone 1 with no horizontal scroll.
- [ ] Test widths around 1440, 1024, 810, 768, 430, 390, and 320px.
- [ ] Long descriptions clamp cleanly to two lines.
- [ ] Keyboard focus is visible on links, fields, buttons, and retry actions.
- [ ] Hero buttons/links and all three footer links resolve correctly.
- [ ] Public repository opens signed out and exposes readable source, README,
      and no credentials or private files.
- [ ] Repository's default branch contains the same code deployed in Framer.
- [ ] Submission document opens signed out with viewer access and contains the
      published Framer URL, public source URL, ≤200-word note, AI disclosure, and
      actual shared chat URL.
- [ ] Shared chat opens signed out and shows the real working conversation.
- [ ] Every `[ADD ... LINK]` placeholder is gone.
- [ ] Paste the public submission-document URL—not the Framer URL—into Binary's
      required Technical Assessment field.

## Source-derived delivery facts

- The assignment explicitly says the course endpoint returns 5–10 records and
  that both endpoints intentionally fail about one-third of the time.
- The Binary form currently exposes one required Technical Assessment link field.
- The wariCrew role page currently displays `Last Date to Apply - 26th Jan, 2026`
  even though the form remains accessible. Confirm directly with wariCrew if
  submission timing is uncertain.
