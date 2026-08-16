import {
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query"
import { addPropertyControls, ControlType } from "framer"
import {
    useMemo,
    useState,
    type CSSProperties,
    type ChangeEvent,
} from "react"

import type { CourseApi } from "./course-api"
import {
    createCourseQueries,
    createCourseQueryClient,
} from "./course-query"
import { liveCourseApi } from "./course-runtime"
import {
    formatPrice,
    type Course,
    type PricingCountry,
} from "./course"

type SortOrder = "featured" | "price-low" | "price-high"
type VisualDirection =
    | "field-guide"
    | "night-school"
    | "signal-poster"
    | "quiet-library"

/** Designer-editable properties exposed by the Framer component. */
export interface SkillpathCoursesProps {
    readonly sectionTitle?: string
    readonly accentColor?: string
    readonly style?: CSSProperties
}

interface CourseCatalogueProps {
    readonly api: CourseApi
    readonly direction: VisualDirection
    readonly sectionTitle: string
    readonly accentColor: string
    readonly style?: CSSProperties
}

type SkillpathRootStyle = CSSProperties & {
    readonly "--skillpath-accent": string
}

const COMPONENT_STYLES = `
.sp-shell { --sp-ink: #17201e; --sp-muted: #64706c; --sp-paper: #f4f5f0; --sp-card: #fcfdf9; --sp-line: #cfd5cf; --sp-radius: 3px; container-type: inline-size; width: 100%; min-height: 100%; padding: clamp(26px, 4cqi, 58px); overflow: hidden; color: var(--sp-ink); background: var(--sp-paper); font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif; }
.sp-shell * { box-sizing: border-box; }
.sp-shell[data-direction="field-guide"] { --sp-ink: #101714; --sp-muted: #46534e; --sp-paper: #edf2eb; --sp-card: #ffffff; --sp-line: #9fac9f; background-image: radial-gradient(circle at 92% 4%, color-mix(in srgb, var(--skillpath-accent), transparent 78%) 0 8cqi, transparent 8.1cqi), linear-gradient(rgba(23,32,30,.055) 1px, transparent 1px); background-size: auto, 100% 32px; }
.sp-shell[data-direction="night-school"] { --sp-ink: #f4f7e9; --sp-muted: #b4bca8; --sp-paper: #131612; --sp-card: #1b2019; --sp-line: #465040; --sp-radius: 14px; font-family: "Gill Sans", "Trebuchet MS", sans-serif; }
.sp-shell[data-direction="signal-poster"] { --sp-ink: #171511; --sp-muted: #625d52; --sp-paper: #f2ead7; --sp-card: #fffaf0; --sp-line: #171511; --sp-radius: 0px; font-family: "Arial Narrow", "Avenir Next Condensed", sans-serif; background-image: radial-gradient(circle at 92% 7%, var(--skillpath-accent) 0 6.5cqi, transparent 6.6cqi), linear-gradient(90deg, transparent 49.9%, rgba(23,21,17,.08) 50%, transparent 50.1%); }
.sp-shell[data-direction="quiet-library"] { --sp-ink: #17160f; --sp-muted: #5e594d; --sp-paper: #ece5d8; --sp-card: #fffdf7; --sp-line: #b7ad9c; --sp-radius: 0px; font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif; }
.sp-heading-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px; margin-bottom: clamp(24px, 4cqi, 48px); }
.sp-kicker { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 11px; color: var(--skillpath-accent); font: 800 11px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .13em; text-transform: uppercase; }
.sp-kicker::before { width: 22px; height: 3px; background: currentColor; content: ""; }
.sp-title { max-width: 820px; margin: 0; font: 650 clamp(35px, 6.2cqi, 76px)/.96 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.046em; text-wrap: balance; }
[data-direction="night-school"] .sp-title { max-width: 850px; font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif; font-weight: 500; font-style: italic; letter-spacing: -.055em; }
[data-direction="signal-poster"] .sp-title { max-width: 900px; font-family: "Arial Black", "Arial Narrow", sans-serif; font-weight: 900; letter-spacing: -.07em; line-height: .86; text-transform: uppercase; }
[data-direction="quiet-library"] .sp-heading-row { align-items: center; margin-bottom: clamp(32px, 6cqi, 72px); text-align: center; }
[data-direction="quiet-library"] .sp-heading-row > div { grid-column: 1 / -1; }
[data-direction="quiet-library"] .sp-kicker { justify-content: center; }
[data-direction="quiet-library"] .sp-title { max-width: 760px; margin-inline: auto; font-weight: 500; letter-spacing: -.04em; }
[data-direction="quiet-library"] .sp-count { position: absolute; right: clamp(26px, 4cqi, 58px); }
.sp-count { margin: 0 0 5px; color: var(--sp-muted); font: 650 12px/1.2 "SFMono-Regular", Consolas, monospace; letter-spacing: .06em; white-space: nowrap; }
.sp-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 10px; margin-bottom: 20px; }
.sp-field { width: 100%; height: 48px; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); outline: none; color: var(--sp-ink); background: var(--sp-card); font: inherit; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.sp-search { padding: 0 15px; }
.sp-select { padding: 0 42px 0 14px; appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--sp-ink) 50%), linear-gradient(135deg, var(--sp-ink) 50%, transparent 50%); background-position: calc(100% - 18px) 21px, calc(100% - 13px) 21px; background-repeat: no-repeat; background-size: 5px 5px, 5px 5px; cursor: pointer; line-height: 46px; }
.sp-field::placeholder { color: var(--sp-muted); opacity: 1; }
[data-direction="field-guide"] .sp-field, [data-direction="field-guide"] .sp-field::placeholder { font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0; }
.sp-field:focus-visible { border-color: var(--skillpath-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--skillpath-accent), transparent 72%); }
.sp-notice { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 20px; padding: 13px 15px; border: 1px solid color-mix(in srgb, var(--skillpath-accent), var(--sp-line) 55%); border-radius: var(--sp-radius); color: var(--sp-ink); background: color-mix(in srgb, var(--skillpath-accent), var(--sp-paper) 92%); font-size: 14px; line-height: 1.45; }
.sp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sp-card { position: relative; display: flex; min-width: 0; min-height: 286px; flex-direction: column; padding: 21px; overflow: hidden; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); background: var(--sp-card); transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
.sp-card:hover { z-index: 1; border-color: var(--skillpath-accent); transform: translateY(-3px); box-shadow: 6px 7px 0 color-mix(in srgb, var(--skillpath-accent), transparent 74%); }
[data-direction="field-guide"] .sp-card { border-width: 1.5px; box-shadow: 5px 6px 0 color-mix(in srgb, var(--skillpath-accent), transparent 72%); }
[data-direction="field-guide"] .sp-card::before { position: absolute; inset: 0 auto 0 0; width: 5px; background: var(--skillpath-accent); content: ""; }
[data-direction="field-guide"] .sp-card:nth-child(3n + 2) { background: color-mix(in srgb, var(--skillpath-accent), white 94%); }
[data-direction="field-guide"] .sp-card:hover { box-shadow: 8px 9px 0 color-mix(in srgb, var(--skillpath-accent), transparent 56%); transform: translate(-2px, -4px); }
[data-direction="field-guide"] .sp-category { color: color-mix(in srgb, var(--skillpath-accent), #17201e 28%); }
[data-direction="signal-poster"] .sp-grid { gap: 10px; }
[data-direction="signal-poster"] .sp-card { min-height: 310px; border-width: 2px; box-shadow: 6px 6px 0 var(--sp-line); }
[data-direction="signal-poster"] .sp-card:nth-child(3n + 2) { background: color-mix(in srgb, var(--skillpath-accent), white 84%); }
[data-direction="signal-poster"] .sp-card:hover { color: #fff; background: var(--skillpath-accent); box-shadow: 10px 10px 0 var(--sp-line); transform: translate(-3px, -3px); }
[data-direction="signal-poster"] .sp-card:hover .sp-category, [data-direction="signal-poster"] .sp-card:hover .sp-description, [data-direction="signal-poster"] .sp-card:hover .sp-type, [data-direction="signal-poster"] .sp-card:hover .sp-price, [data-direction="signal-poster"] .sp-card:hover .sp-index { color: #fff; }
[data-direction="quiet-library"] .sp-grid { gap: 1px; background: var(--sp-line); }
[data-direction="quiet-library"] .sp-card { min-height: 315px; border: 0; padding: 28px 25px; }
[data-direction="quiet-library"] .sp-card::before { position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--skillpath-accent); content: ""; transform: scaleY(.22); transform-origin: bottom; transition: transform .24s ease; }
[data-direction="quiet-library"] .sp-card:hover { z-index: 1; border-color: transparent; box-shadow: 0 12px 34px rgba(54,45,30,.16); transform: translateY(-3px); }
[data-direction="quiet-library"] .sp-card:hover::before { transform: scaleY(1); }
.sp-card-top { display: flex; min-height: 28px; align-items: start; justify-content: space-between; gap: 10px; margin-bottom: 26px; }
.sp-category { overflow: hidden; color: var(--sp-muted); font: 750 11px/1.25 "SFMono-Regular", Consolas, monospace; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.sp-badge { flex: none; padding: 5px 8px; border: 1px solid currentColor; border-radius: 999px; color: var(--skillpath-accent); font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.sp-card-title { margin: 0 0 10px; font: 650 22px/1.12 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.025em; }
[data-direction="night-school"] .sp-card-title { font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif; font-size: 24px; font-weight: 500; }
[data-direction="signal-poster"] .sp-card-title { max-width: 90%; font-family: "Arial Black", "Arial Narrow", sans-serif; font-size: 25px; font-weight: 900; letter-spacing: -.05em; line-height: .98; text-transform: uppercase; }
[data-direction="quiet-library"] .sp-card-title { font-size: 25px; font-weight: 500; line-height: 1.08; }
.sp-description { display: -webkit-box; margin: 0; overflow: hidden; color: var(--sp-muted); font-size: 13px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.sp-card-footer { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 26px; }
.sp-price { color: var(--sp-ink); font-size: 24px; font-weight: 800; letter-spacing: -.03em; }
.sp-price-loading { color: var(--sp-muted); font-size: 13px; font-weight: 650; letter-spacing: 0; }
.sp-dual-price { display: flex; flex-wrap: wrap; gap: 3px 10px; font-size: 16px; line-height: 1.3; }
.sp-price-label { color: var(--sp-muted); font: 700 9px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .08em; }
.sp-type { display: inline-flex; min-height: 25px; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid color-mix(in srgb, var(--skillpath-accent), var(--sp-line) 40%); border-radius: 999px; color: color-mix(in srgb, var(--skillpath-accent), var(--sp-ink) 18%); background: color-mix(in srgb, var(--skillpath-accent), var(--sp-card) 90%); font: 750 9px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.sp-type::before { width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--skillpath-accent); content: ""; }
[data-direction="signal-poster"] .sp-type { border-radius: 0; border-color: var(--sp-ink); color: var(--sp-ink); background: transparent; }
[data-direction="signal-poster"] .sp-card:hover .sp-type { border-color: #fff; color: #fff; background: transparent; }
[data-direction="night-school"] .sp-type { color: var(--sp-ink); background: color-mix(in srgb, var(--skillpath-accent), var(--sp-card) 84%); }
[data-direction="quiet-library"] .sp-type { border-radius: 2px; }
.sp-index { position: absolute; right: 20px; top: 61px; color: color-mix(in srgb, var(--sp-muted), transparent 58%); font: 800 34px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: -.08em; pointer-events: none; }
[data-direction="field-guide"] .sp-index, [data-direction="night-school"] .sp-index { display: none; }
[data-direction="signal-poster"] .sp-index { right: 16px; top: 58px; color: var(--skillpath-accent); font-family: "Arial Black", sans-serif; font-size: 44px; }
[data-direction="quiet-library"] .sp-index { right: 24px; top: 66px; font-family: inherit; font-size: 14px; font-weight: 400; font-style: italic; letter-spacing: 0; }
.sp-button { flex: none; min-height: 40px; padding: 0 15px; border: 1px solid var(--skillpath-accent); border-radius: var(--sp-radius); color: #fff; background: var(--skillpath-accent); cursor: pointer; font: 750 13px/1 inherit; transition: filter .15s ease, transform .15s ease; }
.sp-button:hover { filter: brightness(.9); }
.sp-button:active { transform: translateY(1px) scale(.98); }
.sp-button:disabled { cursor: wait; filter: saturate(.55); opacity: .72; }
.sp-button:focus-visible { outline: 3px solid color-mix(in srgb, var(--skillpath-accent), transparent 62%); outline-offset: 2px; }
.sp-state { display: grid; min-height: 286px; place-items: center; padding: 42px 22px; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); background: var(--sp-card); text-align: center; }
.sp-state-copy { max-width: 450px; }
.sp-state h3 { margin: 0 0 8px; font: 650 28px/1.1 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.025em; }
.sp-state p { margin: 0 0 20px; color: var(--sp-muted); line-height: 1.55; }
.sp-skeleton { min-height: 286px; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); background: linear-gradient(100deg, var(--sp-card) 24%, color-mix(in srgb, var(--skillpath-accent), var(--sp-card) 92%) 43%, var(--sp-card) 62%); background-size: 300% 100%; animation: sp-shimmer 1.25s infinite linear; }
@keyframes sp-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .sp-shell *, .sp-shell *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
@container (max-width: 899px) { .sp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 599px) { .sp-shell { padding: 24px 16px; } .sp-heading-row { grid-template-columns: 1fr; gap: 10px; } .sp-toolbar { grid-template-columns: 1fr; } .sp-grid { grid-template-columns: 1fr; } .sp-card { min-height: 255px; } .sp-notice { align-items: start; flex-direction: column; } [data-direction="quiet-library"] .sp-count { position: static; } }
`

function parseSortOrder(value: string): SortOrder {
    switch (value) {
        case "price-low":
        case "price-high":
            return value
        default:
            return "featured"
    }
}

function comparePrice(
    left: Course,
    right: Course,
    country: PricingCountry,
    order: SortOrder
): number {
    if (order === "featured") return 0
    const leftPrice = country === "US" ? left.priceUsdCents : left.pricePaise
    const rightPrice = country === "US" ? right.priceUsdCents : right.pricePaise
    return order === "price-low"
        ? leftPrice - rightPrice
        : rightPrice - leftPrice
}

function CoursePrice({
    course,
    country,
    isLoading,
}: {
    readonly course: Course
    readonly country: PricingCountry | undefined
    readonly isLoading: boolean
}) {
    if (isLoading) {
        return <div className="sp-price sp-price-loading">Finding your price</div>
    }

    if (country !== undefined) {
        return <div className="sp-price">{formatPrice(course, country)}</div>
    }

    return (
        <div className="sp-price sp-dual-price" aria-label="Price in INR and USD">
            <span>
                {formatPrice(course, "IN")} <span className="sp-price-label">INR</span>
            </span>
            <span>
                {formatPrice(course, "US")} <span className="sp-price-label">USD</span>
            </span>
        </div>
    )
}

/** Shared course experience used by every Framer visual direction. */
export function CourseCatalogue({
    api,
    direction,
    sectionTitle,
    accentColor,
    style,
}: CourseCatalogueProps) {
    const queries = useMemo(() => createCourseQueries(api), [api])
    const coursesQuery = useQuery(queries.courses)
    const countryQuery = useQuery(queries.country)
    const [search, setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState<SortOrder>("featured")

    const visibleCourses = useMemo(() => {
        const courses = coursesQuery.data ?? []
        const normalizedSearch = search.trim().toLocaleLowerCase()
        const filtered = courses.filter((course) =>
            `${course.courseName} ${course.description} ${course.mainCategory}`
                .toLocaleLowerCase()
                .includes(normalizedSearch)
        )
        const country = countryQuery.data
        return country === undefined
            ? filtered
            : [...filtered].sort((left, right) =>
                  comparePrice(left, right, country, sortOrder)
              )
    }, [countryQuery.data, coursesQuery.data, search, sortOrder])

    const rootStyle: SkillpathRootStyle = {
        ...style,
        "--skillpath-accent": accentColor,
    }
    const courses = coursesQuery.data
    const showCatalogue = courses !== undefined && courses.length > 0
    const coursesAreRecovering =
        coursesQuery.isFetching && coursesQuery.failureCount > 0
    const countryIsRecovering =
        countryQuery.isFetching && countryQuery.failureCount > 0
    const onSortChange = (event: ChangeEvent<HTMLSelectElement>) =>
        setSortOrder(parseSortOrder(event.currentTarget.value))

    return (
        <section className="sp-shell" data-direction={direction} style={rootStyle}>
            <style>{COMPONENT_STYLES}</style>
            <header className="sp-heading-row">
                <div>
                    <p className="sp-kicker">Explore Skillpath</p>
                    <h2 className="sp-title">{sectionTitle}</h2>
                </div>
                {courses !== undefined && (
                    <p className="sp-count" aria-live="polite">
                        {courses.length.toString().padStart(2, "0")} courses
                    </p>
                )}
            </header>

            {showCatalogue && (
                <div className="sp-toolbar">
                    <input
                        className="sp-field sp-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search skills, courses, or categories"
                        aria-label="Search courses"
                    />
                    <select
                        className="sp-field sp-select"
                        value={sortOrder}
                        onChange={onSortChange}
                        disabled={countryQuery.data === undefined}
                        aria-label="Sort courses"
                    >
                        <option value="featured">Featured order</option>
                        <option value="price-low">Price: low to high</option>
                        <option value="price-high">Price: high to low</option>
                    </select>
                </div>
            )}

            {showCatalogue && countryQuery.isError && (
                <div className="sp-notice" role="status">
                    <span>Region lookup failed. Prices remain visible in both INR and USD.</span>
                    <button
                        className="sp-button"
                        type="button"
                        disabled={countryQuery.isFetching}
                        onClick={() => void countryQuery.refetch()}
                    >
                        {countryQuery.isFetching ? "Retrying pricing" : "Retry pricing"}
                    </button>
                </div>
            )}

            {showCatalogue && countryIsRecovering && (
                <div className="sp-notice" role="status" aria-live="polite">
                    <span>Detecting currency… Automatic retry in progress.</span>
                </div>
            )}

            {showCatalogue && coursesAreRecovering && (
                <div className="sp-notice" role="status" aria-live="polite">
                    <span>Refreshing courses… Automatic retry in progress.</span>
                </div>
            )}

            {showCatalogue && coursesQuery.isError && !coursesQuery.isFetching && (
                <div className="sp-notice" role="status">
                    <span>We couldn’t refresh the catalogue. Your loaded courses are still available.</span>
                    <button
                        className="sp-button"
                        type="button"
                        onClick={() => void coursesQuery.refetch()}
                    >
                        Retry refresh
                    </button>
                </div>
            )}

            {coursesQuery.isPending && (
                <div
                    className="sp-grid"
                    aria-label={coursesAreRecovering ? "Retrying courses" : "Loading courses"}
                    aria-busy="true"
                >
                    {Array.from({ length: 6 }, (_, index) => (
                        <div className="sp-skeleton" key={index} aria-hidden="true" />
                    ))}
                </div>
            )}

            {coursesQuery.isError && courses === undefined && (
                <div className="sp-state" role="alert">
                    <div className="sp-state-copy">
                        <h3>Courses took a detour.</h3>
                        <p>The course service is temporarily unavailable. Your place is safe.</p>
                        <button
                            className="sp-button"
                            type="button"
                            disabled={coursesQuery.isFetching}
                            onClick={() => void coursesQuery.refetch()}
                        >
                            {coursesQuery.isFetching ? "Trying again" : "Try again"}
                        </button>
                    </div>
                </div>
            )}

            {courses !== undefined && courses.length === 0 && (
                <div className="sp-state">
                    <div className="sp-state-copy">
                        <h3>New courses are being prepared.</h3>
                        <p>There are no courses to show yet. Check back soon.</p>
                        <button className="sp-button" type="button" onClick={() => void coursesQuery.refetch()}>
                            Refresh courses
                        </button>
                    </div>
                </div>
            )}

            {showCatalogue && visibleCourses.length === 0 && (
                <div className="sp-state">
                    <div className="sp-state-copy">
                        <h3>No courses match that search.</h3>
                        <p>Try a broader phrase or return to the complete catalogue.</p>
                        <button className="sp-button" type="button" onClick={() => setSearch("")}>
                            Clear search
                        </button>
                    </div>
                </div>
            )}

            {visibleCourses.length > 0 && (
                <div className="sp-grid">
                    {visibleCourses.map((course, index) => (
                        <article className="sp-card" key={course.courseCode}>
                            <div className="sp-card-top">
                                <span className="sp-category">{course.mainCategory}</span>
                                {course.refundable && <span className="sp-badge">Refundable</span>}
                            </div>
                            <span className="sp-index" aria-hidden="true">
                                {(index + 1).toString().padStart(2, "0")}
                            </span>
                            <h3 className="sp-card-title">{course.courseName}</h3>
                            <p className="sp-description">{course.description}</p>
                            <footer className="sp-card-footer">
                                <CoursePrice
                                    course={course}
                                    country={countryQuery.data}
                                    isLoading={countryQuery.isPending}
                                />
                                <span className="sp-type">{course.courseType}</span>
                            </footer>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

function FramerCourseDirection({
    direction,
    sectionTitle,
    accentColor,
    style,
}: {
    readonly direction: VisualDirection
    readonly sectionTitle: string
    readonly accentColor: string
    readonly style: CSSProperties | undefined
}) {
    const [queryClient] = useState(createCourseQueryClient)
    return (
        <QueryClientProvider client={queryClient}>
            <CourseCatalogue
                api={liveCourseApi}
                direction={direction}
                sectionTitle={sectionTitle}
                accentColor={accentColor}
                {...(style === undefined ? {} : { style })}
            />
        </QueryClientProvider>
    )
}

/** Editorial field-guide direction. Recommended default for the assignment. */
export function SkillpathCourses({
    sectionTitle = "Build skills that move you forward.",
    accentColor = "#176B52",
    style,
}: SkillpathCoursesProps = {}) {
    return <FramerCourseDirection direction="field-guide" sectionTitle={sectionTitle} accentColor={accentColor} style={style} />
}

/** Dark night-school direction for Framer comparison. */
export function SkillpathCoursesNight({
    sectionTitle = "Build skills that move you forward.",
    accentColor = "#B7F34A",
    style,
}: SkillpathCoursesProps = {}) {
    return <FramerCourseDirection direction="night-school" sectionTitle={sectionTitle} accentColor={accentColor} style={style} />
}

/** Bold poster-school direction inspired by contemporary Framer editorial work. */
export function SkillpathCoursesSignal({
    sectionTitle = "Build skills that move you forward.",
    accentColor = "#E3452F",
    style,
}: SkillpathCoursesProps = {}) {
    return <FramerCourseDirection direction="signal-poster" sectionTitle={sectionTitle} accentColor={accentColor} style={style} />
}

/** Restrained reading-room direction with bookish typography and precise rules. */
export function SkillpathCoursesLibrary({
    sectionTitle = "Build skills that move you forward.",
    accentColor = "#3C684F",
    style,
}: SkillpathCoursesProps = {}) {
    return <FramerCourseDirection direction="quiet-library" sectionTitle={sectionTitle} accentColor={accentColor} style={style} />
}

const DEFAULT_SECTION_TITLE = "Build skills that move you forward."

function createPropertyControls(accentColor: string) {
    return {
        sectionTitle: {
            type: ControlType.String,
            title: "Heading",
            defaultValue: DEFAULT_SECTION_TITLE,
        },
        accentColor: {
            type: ControlType.Color,
            title: "Accent",
            defaultValue: accentColor,
        },
    } as const
}

addPropertyControls(SkillpathCourses, createPropertyControls("#176B52"))
addPropertyControls(SkillpathCoursesNight, createPropertyControls("#B7F34A"))
addPropertyControls(SkillpathCoursesSignal, createPropertyControls("#E3452F"))
addPropertyControls(SkillpathCoursesLibrary, createPropertyControls("#3C684F"))
