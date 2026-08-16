import type { ReactNode } from "react"

import {
    SkillpathCourses,
    SkillpathCoursesLibrary,
    SkillpathCoursesNight,
    SkillpathCoursesSignal,
} from "./SkillpathCourses"

type LandingDirection =
    | "field-guide"
    | "night-school"
    | "signal-poster"
    | "quiet-library"

const LANDING_STYLES = `
.sl-page { --sl-accent: #176b52; --sl-ink: #101714; --sl-muted: #46534e; --sl-paper: #edf2eb; width: 100%; min-width: 0; overflow: hidden; color: var(--sl-ink); background: var(--sl-paper); font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif; }
.sl-page * { box-sizing: border-box; }
.sl-hero { position: relative; min-height: min(800px, 88vh); padding: 24px clamp(24px, 5vw, 76px) clamp(58px, 8vw, 110px); overflow: hidden; }
.sl-nav { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: clamp(52px, 8vw, 110px); }
.sl-brand { display: inline-flex; align-items: center; gap: 10px; color: inherit; font-size: 17px; font-weight: 850; letter-spacing: -.03em; text-decoration: none; }
.sl-brand-mark { width: 18px; height: 18px; border: 5px solid var(--sl-accent); border-radius: 50%; }
.sl-nav-link { color: inherit; font-size: 12px; font-weight: 750; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }
.sl-nav-link:hover { color: var(--sl-accent); }
.sl-hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr); align-items: center; gap: clamp(40px, 7vw, 110px); max-width: 1400px; margin: 0 auto; }
.sl-overline { display: flex; align-items: center; gap: 10px; margin: 0 0 18px; color: var(--sl-accent); font: 800 11px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .14em; text-transform: uppercase; }
.sl-overline::before { width: 24px; height: 3px; background: currentColor; content: ""; }
.sl-hero-title { max-width: 900px; margin: 0; font: 550 clamp(56px, 8vw, 122px)/.86 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.065em; text-wrap: balance; }
.sl-hero-copy { max-width: 590px; margin: 28px 0 0; color: var(--sl-muted); font-size: clamp(16px, 1.5vw, 20px); line-height: 1.55; text-wrap: balance; }
.sl-cta { display: inline-flex; min-height: 50px; align-items: center; justify-content: center; gap: 14px; margin-top: 34px; padding: 0 20px; border: 1px solid var(--sl-accent); border-radius: 3px; color: #fff; background: var(--sl-accent); font-size: 13px; font-weight: 800; text-decoration: none; transition: box-shadow .18s ease, transform .18s ease, filter .18s ease; }
.sl-cta::after { content: "↓"; }
.sl-cta:hover { box-shadow: 6px 7px 0 color-mix(in srgb, var(--sl-accent), transparent 68%); transform: translate(-2px, -3px); }
.sl-cta:focus-visible, .sl-footer a:focus-visible, .sl-nav a:focus-visible { outline: 3px solid color-mix(in srgb, var(--sl-accent), transparent 55%); outline-offset: 4px; }
.sl-art { position: relative; min-height: 440px; }
.sl-art-orbit { position: absolute; inset: 4% 4% auto auto; width: min(31vw, 360px); aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--sl-accent), transparent 42%); border-radius: 50%; }
.sl-art-orbit::before, .sl-art-orbit::after { position: absolute; border-radius: 50%; content: ""; }
.sl-art-orbit::before { inset: 17%; border: 1px dashed color-mix(in srgb, var(--sl-ink), transparent 67%); }
.sl-art-orbit::after { width: 23%; aspect-ratio: 1; right: 1%; top: 13%; background: var(--sl-accent); box-shadow: -140px 175px 0 color-mix(in srgb, var(--sl-accent), white 55%); }
.sl-note { position: absolute; display: grid; min-height: 104px; padding: 16px; border: 1px solid var(--sl-ink); color: var(--sl-ink); background: #fff; box-shadow: 5px 6px 0 color-mix(in srgb, var(--sl-accent), transparent 46%); }
.sl-note strong { align-self: end; font: 700 17px/1.1 "Iowan Old Style", Georgia, serif; }
.sl-note span { color: var(--sl-muted); font: 750 9px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .1em; text-transform: uppercase; }
.sl-note-one { width: 49%; left: 0; top: 10%; transform: rotate(-4deg); }
.sl-note-two { width: 53%; right: 0; top: 43%; transform: rotate(3deg); }
.sl-note-three { width: 44%; left: 13%; bottom: 3%; transform: rotate(-1deg); }
[data-direction="field-guide"] .sl-art-orbit { inset: 9% -2% auto auto; width: min(29vw, 340px); border-width: 2px; }
[data-direction="field-guide"] .sl-art-orbit::before { inset: 22%; border-width: 2px; border-color: color-mix(in srgb, var(--sl-accent), transparent 32%); }
[data-direction="field-guide"] .sl-art-orbit::after { width: 16%; right: 1%; top: 13%; z-index: 3; box-shadow: -139px 194px 0 color-mix(in srgb, var(--sl-accent), white 55%); }
[data-direction="field-guide"] .sl-note-one { width: 43%; left: -2%; top: 3%; }
[data-direction="field-guide"] .sl-note-two { width: 43%; right: auto; left: 1%; top: 43%; }
[data-direction="field-guide"] .sl-note-three { width: 40%; right: -1%; left: auto; bottom: 0; }
.sl-courses { position: relative; }
.sl-footer { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 32px; padding: 42px clamp(24px, 5vw, 76px); border-top: 1px solid color-mix(in srgb, var(--sl-ink), transparent 68%); }
.sl-footer-links { display: flex; flex-wrap: wrap; gap: 22px; }
.sl-footer a { color: inherit; font-size: 13px; font-weight: 750; text-decoration: none; }
.sl-footer a:hover { color: var(--sl-accent); }
.sl-copyright { margin: 0; color: var(--sl-muted); font-size: 12px; }

.sl-page[data-direction="night-school"] { --sl-accent: #b7f34a; --sl-ink: #f4f7e9; --sl-muted: #b4bca8; --sl-paper: #131612; font-family: "Gill Sans", "Trebuchet MS", sans-serif; }
[data-direction="night-school"] .sl-hero { min-height: 94vh; background-image: radial-gradient(circle at 78% 30%, rgba(183,243,74,.14), transparent 27%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: auto, 48px 48px, 48px 48px; }
[data-direction="night-school"] .sl-brand-mark { border-width: 1px; box-shadow: 0 0 18px var(--sl-accent), inset 0 0 8px var(--sl-accent); }
[data-direction="night-school"] .sl-hero-title { max-width: 1000px; font-weight: 500; font-style: italic; }
[data-direction="night-school"] .sl-cta { border-radius: 999px; color: #131612; }
[data-direction="night-school"] .sl-art { min-height: 500px; }
[data-direction="night-school"] .sl-art-orbit { inset: 6% 0 auto auto; width: min(34vw, 410px); border-color: rgba(183,243,74,.46); box-shadow: inset 0 0 80px rgba(183,243,74,.05), 0 0 80px rgba(183,243,74,.04); }
[data-direction="night-school"] .sl-art-orbit::before { border-color: rgba(244,247,233,.22); }
[data-direction="night-school"] .sl-art-orbit::after { z-index: 3; }
[data-direction="night-school"] .sl-note { border-color: #465040; color: var(--sl-ink); background: rgba(27,32,25,.88); box-shadow: 0 14px 45px rgba(0,0,0,.35); backdrop-filter: blur(10px); }
[data-direction="night-school"] .sl-note strong { font-size: 20px; font-weight: 500; font-style: italic; }
[data-direction="night-school"] .sl-note-one { width: 43%; left: -3%; top: 4%; }
[data-direction="night-school"] .sl-note-two { width: 43%; right: auto; left: 0; top: 45%; }
[data-direction="night-school"] .sl-note-three { width: 40%; right: -1%; left: auto; bottom: 1%; }
[data-direction="night-school"] .sl-footer { border-color: #465040; }

.sl-page[data-direction="signal-poster"] { --sl-accent: #e3452f; --sl-ink: #171511; --sl-muted: #625d52; --sl-paper: #f2ead7; font-family: "Arial Narrow", "Avenir Next Condensed", sans-serif; }
[data-direction="signal-poster"] .sl-hero { min-height: 850px; border-bottom: 3px solid var(--sl-ink); background-image: linear-gradient(90deg, transparent 49.9%, rgba(23,21,17,.1) 50%, transparent 50.1%); }
[data-direction="signal-poster"] .sl-brand { font-family: "Arial Black", sans-serif; text-transform: uppercase; }
[data-direction="signal-poster"] .sl-brand-mark { border-radius: 0; transform: rotate(45deg); }
[data-direction="signal-poster"] .sl-hero-grid { grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr); }
[data-direction="signal-poster"] .sl-hero-title { max-width: 1050px; font-family: "Arial Black", "Arial Narrow", sans-serif; font-size: clamp(62px, 10vw, 150px); font-weight: 900; line-height: .79; text-transform: uppercase; }
[data-direction="signal-poster"] .sl-hero-title em { color: var(--sl-accent); font-style: normal; }
[data-direction="signal-poster"] .sl-hero-copy { max-width: 520px; font-weight: 650; }
[data-direction="signal-poster"] .sl-cta { min-height: 55px; border: 2px solid var(--sl-ink); border-radius: 0; box-shadow: 7px 7px 0 var(--sl-ink); font-family: "Arial Black", sans-serif; text-transform: uppercase; }
[data-direction="signal-poster"] .sl-cta:hover { box-shadow: 11px 11px 0 var(--sl-ink); }
[data-direction="signal-poster"] .sl-art-orbit { inset: 7% -8% auto auto; border: 0; background: var(--sl-accent); }
[data-direction="signal-poster"] .sl-art-orbit::before { inset: 15%; border: 3px solid var(--sl-ink); }
[data-direction="signal-poster"] .sl-art-orbit::after { right: auto; left: -16%; top: 58%; background: var(--sl-paper); border: 3px solid var(--sl-ink); box-shadow: none; }
[data-direction="signal-poster"] .sl-note { border-width: 2px; box-shadow: 7px 7px 0 var(--sl-ink); }
[data-direction="signal-poster"] .sl-note strong { font-family: "Arial Black", sans-serif; text-transform: uppercase; }
[data-direction="signal-poster"] .sl-note-two { background: #ffd841; }
[data-direction="signal-poster"] .sl-footer { border-top: 3px solid var(--sl-ink); font-family: "Arial Black", sans-serif; text-transform: uppercase; }

.sl-page[data-direction="quiet-library"] { --sl-accent: #3c684f; --sl-ink: #17160f; --sl-muted: #5e594d; --sl-paper: #ece5d8; font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif; }
[data-direction="quiet-library"] .sl-hero { min-height: 820px; background-image: linear-gradient(90deg, transparent calc(50% - .5px), rgba(23,22,15,.14) 50%, transparent calc(50% + .5px)); }
[data-direction="quiet-library"] .sl-nav { border-bottom: 1px solid #b7ad9c; padding-bottom: 20px; }
[data-direction="quiet-library"] .sl-brand { font-family: inherit; font-size: 19px; font-weight: 500; }
[data-direction="quiet-library"] .sl-brand-mark { width: 14px; height: 14px; border-width: 1px; }
[data-direction="quiet-library"] .sl-hero-grid { display: block; max-width: 1050px; padding-top: clamp(60px, 9vw, 125px); text-align: center; }
[data-direction="quiet-library"] .sl-overline { justify-content: center; }
[data-direction="quiet-library"] .sl-hero-title { max-width: 940px; margin-inline: auto; font-size: clamp(54px, 8vw, 112px); font-weight: 500; line-height: .91; }
[data-direction="quiet-library"] .sl-hero-copy { max-width: 600px; margin-inline: auto; }
[data-direction="quiet-library"] .sl-cta { border-radius: 2px; }
[data-direction="quiet-library"] .sl-art { min-height: 150px; margin-top: 50px; }
[data-direction="quiet-library"] .sl-art-orbit { width: 118px; inset: 0 calc(50% - 59px) auto auto; border-color: var(--sl-accent); }
[data-direction="quiet-library"] .sl-art-orbit::before { inset: 28%; border-style: solid; }
[data-direction="quiet-library"] .sl-art-orbit::after { width: 12px; right: calc(50% - 6px); top: calc(50% - 6px); box-shadow: none; }
[data-direction="quiet-library"] .sl-note { display: none; }
[data-direction="quiet-library"] .sl-footer { border-color: #b7ad9c; }

@media (prefers-reduced-motion: reduce) { .sl-page * { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
@media (max-width: 850px) { .sl-hero { min-height: auto; } .sl-hero-grid { grid-template-columns: 1fr; } .sl-art { min-height: 380px; } [data-direction="field-guide"] .sl-art-orbit { width: min(58vw, 350px); } [data-direction="signal-poster"] .sl-hero-grid { grid-template-columns: 1fr; } [data-direction="quiet-library"] .sl-art { min-height: 140px; } }
@media (max-width: 560px) { .sl-hero { padding-inline: 18px; } .sl-nav { padding-bottom: 54px; } .sl-hero-title { font-size: clamp(48px, 16vw, 74px); } .sl-hero-copy { margin-top: 22px; font-size: 16px; } .sl-art { min-height: 320px; } .sl-note { min-height: 88px; padding: 12px; } .sl-footer { grid-template-columns: 1fr; padding-inline: 18px; } .sl-footer-links { gap: 18px; } [data-direction="field-guide"] .sl-art-orbit { inset: 10% -8% auto auto; width: min(76vw, 300px); } [data-direction="field-guide"] .sl-note-one, [data-direction="night-school"] .sl-note-one { width: 43%; left: 0; } [data-direction="field-guide"] .sl-note-two, [data-direction="night-school"] .sl-note-two { width: 43%; left: 0; top: 46%; } [data-direction="field-guide"] .sl-note-three, [data-direction="night-school"] .sl-note-three { width: 40%; right: 0; left: auto; } [data-direction="night-school"] .sl-art-orbit { inset-inline: auto -10%; width: min(80vw, 315px); } [data-direction="signal-poster"] .sl-hero-title { font-size: clamp(54px, 18vw, 84px); } [data-direction="quiet-library"] .sl-hero-title { font-size: clamp(48px, 15vw, 72px); } }
`

function HeroArt() {
    return (
        <div className="sl-art" aria-hidden="true">
            <div className="sl-art-orbit" />
            <div className="sl-note sl-note-one">
                <span>01 / Learn</span>
                <strong>Practical ideas</strong>
            </div>
            <div className="sl-note sl-note-two">
                <span>02 / Practice</span>
                <strong>Useful systems</strong>
            </div>
            <div className="sl-note sl-note-three">
                <span>03 / Apply</span>
                <strong>Real momentum</strong>
            </div>
        </div>
    )
}

function CoursesForDirection({ direction }: { readonly direction: LandingDirection }) {
    const props = { sectionTitle: "Choose your next useful skill." }

    switch (direction) {
        case "field-guide":
            return <SkillpathCourses {...props} accentColor="#176B52" />
        case "night-school":
            return <SkillpathCoursesNight {...props} accentColor="#B7F34A" />
        case "signal-poster":
            return <SkillpathCoursesSignal {...props} accentColor="#E3452F" />
        case "quiet-library":
            return <SkillpathCoursesLibrary {...props} accentColor="#3C684F" />
    }
}

function LandingPage({
    direction,
    title,
}: {
    readonly direction: LandingDirection
    readonly title: ReactNode
}) {
    return (
        <div className="sl-page" data-direction={direction}>
            <style>{LANDING_STYLES}</style>
            <section className="sl-hero">
                <nav className="sl-nav" aria-label="Primary navigation">
                    <a className="sl-brand" href="#top" aria-label="Skillpath home">
                        <span className="sl-brand-mark" aria-hidden="true" />
                        Skillpath
                    </a>
                    <a className="sl-nav-link" href="#courses">Browse courses</a>
                </nav>
                <div className="sl-hero-grid" id="top">
                    <div>
                        <p className="sl-overline">Learn what moves you</p>
                        <h1 className="sl-hero-title">{title}</h1>
                        <p className="sl-hero-copy">
                            Practical courses for ambitious people who want useful skills,
                            clearer systems, and momentum that lasts beyond the lesson.
                        </p>
                        <a className="sl-cta" href="#courses">Explore courses</a>
                    </div>
                    <HeroArt />
                </div>
            </section>
            <div className="sl-courses" id="courses">
                <CoursesForDirection direction={direction} />
            </div>
            <footer className="sl-footer">
                <div className="sl-footer-links">
                    <a href="#courses">Courses</a>
                    <a href="#top">About Skillpath</a>
                    <a href="mailto:hello@skillpath.example">Contact</a>
                </div>
                <p className="sl-copyright">© 2026 Skillpath. Built for useful progress.</p>
            </footer>
        </div>
    )
}

/** Complete editorial field-guide landing page for Framer. */
export function SkillpathLandingFieldGuide() {
    return <LandingPage direction="field-guide" title={<>Learn boldly.<br />Move deliberately.</>} />
}

/** Complete dark editorial night-school landing page for Framer. */
export function SkillpathLandingNightSchool() {
    return <LandingPage direction="night-school" title={<>Make your late hours<br />count for more.</>} />
}

/** Complete graphic signal-poster landing page for Framer. */
export function SkillpathLandingSignalPoster() {
    return <LandingPage direction="signal-poster" title={<>Skills that <em>move</em><br />you forward.</>} />
}

/** Complete restrained quiet-library landing page for Framer. */
export function SkillpathLandingQuietLibrary() {
    return <LandingPage direction="quiet-library" title={<>A considered place<br />to learn what matters.</>} />
}
