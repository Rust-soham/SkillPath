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

import { courseApi, type CourseApi } from "./course-api"
import {
    createCourseQueries,
    createCourseQueryClient,
} from "./course-query"
import {
    formatPrice,
    type Course,
    type PricingCountry,
} from "./course-data"

type SortOrder = "featured" | "price-low" | "price-high"
type VisualDirection = "field-guide" | "ledger" | "night-school"

export type SkillpathCoursesProps = {
    readonly sectionTitle: string
    readonly accentColor: string
    readonly style?: CSSProperties
}

type CourseCatalogueProps = SkillpathCoursesProps & {
    readonly api: CourseApi
    readonly direction: VisualDirection
}

type SkillpathRootStyle = CSSProperties & {
    readonly "--skillpath-accent": string
}

const COMPONENT_STYLES = `
.sp-shell { --sp-ink: #17201e; --sp-muted: #64706c; --sp-paper: #f4f5f0; --sp-card: #fcfdf9; --sp-line: #cfd5cf; --sp-radius: 3px; container-type: inline-size; width: 100%; min-height: 100%; padding: clamp(26px, 4cqi, 58px); overflow: hidden; color: var(--sp-ink); background: var(--sp-paper); font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif; }
.sp-shell * { box-sizing: border-box; }
.sp-shell[data-direction="field-guide"] { background-image: linear-gradient(rgba(23,32,30,.035) 1px, transparent 1px); background-size: 100% 32px; }
.sp-shell[data-direction="ledger"] { --sp-ink: #101318; --sp-muted: #59616d; --sp-paper: #edf1f5; --sp-card: transparent; --sp-line: #101318; --sp-radius: 0px; font-family: "DIN Alternate", "Arial Narrow", sans-serif; }
.sp-shell[data-direction="night-school"] { --sp-ink: #eef7df; --sp-muted: #a9b29f; --sp-paper: #131612; --sp-card: #1b2019; --sp-line: #394136; --sp-radius: 14px; font-family: "Avenir Next", Avenir, sans-serif; }
.sp-heading-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px; margin-bottom: clamp(24px, 4cqi, 48px); }
.sp-kicker { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 11px; color: var(--skillpath-accent); font: 800 11px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .13em; text-transform: uppercase; }
.sp-kicker::before { width: 22px; height: 3px; background: currentColor; content: ""; }
.sp-title { max-width: 820px; margin: 0; font: 650 clamp(35px, 6.2cqi, 76px)/.96 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.046em; text-wrap: balance; }
[data-direction="ledger"] .sp-title { max-width: 920px; font-family: "DIN Alternate", "Arial Narrow", sans-serif; font-weight: 900; letter-spacing: -.055em; text-transform: uppercase; }
[data-direction="night-school"] .sp-title { font-family: "Avenir Next", Avenir, sans-serif; font-weight: 700; }
.sp-count { margin: 0 0 5px; color: var(--sp-muted); font: 650 12px/1.2 "SFMono-Regular", Consolas, monospace; letter-spacing: .06em; white-space: nowrap; }
.sp-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 10px; margin-bottom: 20px; }
.sp-field { width: 100%; height: 48px; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); outline: none; color: var(--sp-ink); background: var(--sp-card); font: inherit; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.sp-search { padding: 0 15px; }
.sp-select { padding: 0 38px 0 14px; cursor: pointer; }
.sp-field:focus-visible { border-color: var(--skillpath-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--skillpath-accent), transparent 72%); }
.sp-notice { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 20px; padding: 13px 15px; border: 1px solid color-mix(in srgb, var(--skillpath-accent), var(--sp-line) 55%); border-radius: var(--sp-radius); color: var(--sp-ink); background: color-mix(in srgb, var(--skillpath-accent), var(--sp-paper) 92%); font-size: 14px; line-height: 1.45; }
.sp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sp-card { position: relative; display: flex; min-width: 0; min-height: 286px; flex-direction: column; padding: 21px; overflow: hidden; border: 1px solid var(--sp-line); border-radius: var(--sp-radius); background: var(--sp-card); transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
.sp-card:hover { z-index: 1; border-color: var(--skillpath-accent); transform: translateY(-3px); box-shadow: 6px 7px 0 color-mix(in srgb, var(--skillpath-accent), transparent 74%); }
[data-direction="ledger"] .sp-grid { gap: 0; border-top: 2px solid var(--sp-line); border-left: 2px solid var(--sp-line); }
[data-direction="ledger"] .sp-card { border-width: 0 2px 2px 0; }
[data-direction="ledger"] .sp-card:hover { color: #fff; background: var(--skillpath-accent); box-shadow: none; transform: none; }
[data-direction="ledger"] .sp-card:hover .sp-category, [data-direction="ledger"] .sp-card:hover .sp-description, [data-direction="ledger"] .sp-card:hover .sp-type { color: rgba(255,255,255,.72); }
[data-direction="night-school"] .sp-card::after { position: absolute; inset: auto 16px 14px auto; width: 7px; height: 7px; border-radius: 50%; background: var(--skillpath-accent); box-shadow: 0 0 18px var(--skillpath-accent); content: ""; }
.sp-card-top { display: flex; min-height: 28px; align-items: start; justify-content: space-between; gap: 10px; margin-bottom: 26px; }
.sp-category { overflow: hidden; color: var(--sp-muted); font: 750 11px/1.25 "SFMono-Regular", Consolas, monospace; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.sp-badge { flex: none; padding: 5px 8px; border: 1px solid currentColor; border-radius: 999px; color: var(--skillpath-accent); font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
[data-direction="ledger"] .sp-badge { border-radius: 0; }
.sp-card-title { margin: 0 0 10px; font: 650 22px/1.12 "Iowan Old Style", "Palatino Linotype", Georgia, serif; letter-spacing: -.025em; }
[data-direction="ledger"] .sp-card-title, [data-direction="night-school"] .sp-card-title { font-family: inherit; font-weight: 800; }
.sp-description { display: -webkit-box; margin: 0; overflow: hidden; color: var(--sp-muted); font-size: 13px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.sp-card-footer { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 26px; }
.sp-price { color: var(--sp-ink); font-size: 24px; font-weight: 800; letter-spacing: -.03em; }
.sp-price-loading { color: var(--sp-muted); font-size: 13px; font-weight: 650; letter-spacing: 0; }
.sp-dual-price { display: flex; flex-wrap: wrap; gap: 3px 10px; font-size: 16px; line-height: 1.3; }
.sp-price-label { color: var(--sp-muted); font: 700 9px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .08em; }
.sp-type { color: var(--sp-muted); font: 650 10px/1 "SFMono-Regular", Consolas, monospace; letter-spacing: .04em; text-transform: uppercase; }
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
@container (max-width: 599px) { .sp-shell { padding: 24px 16px; } .sp-heading-row { grid-template-columns: 1fr; gap: 10px; } .sp-toolbar { grid-template-columns: 1fr; } .sp-grid { grid-template-columns: 1fr; } .sp-card { min-height: 255px; } .sp-notice { align-items: start; flex-direction: column; } }
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

            {coursesQuery.isPending && (
                <div className="sp-grid" aria-label="Loading courses" aria-busy="true">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div className="sp-skeleton" key={index} aria-hidden="true" />
                    ))}
                </div>
            )}

            {coursesQuery.isError && (
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
                    {visibleCourses.map((course) => (
                        <article className="sp-card" key={course.courseCode}>
                            <div className="sp-card-top">
                                <span className="sp-category">{course.mainCategory}</span>
                                {course.refundable && <span className="sp-badge">Refundable</span>}
                            </div>
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
    ...props
}: SkillpathCoursesProps & { readonly direction: VisualDirection }) {
    const [queryClient] = useState(createCourseQueryClient)
    return (
        <QueryClientProvider client={queryClient}>
            <CourseCatalogue api={courseApi} direction={direction} {...props} />
        </QueryClientProvider>
    )
}

/** Editorial field-guide direction. Recommended default for the assignment. */
export function SkillpathCourses(props: SkillpathCoursesProps) {
    return <FramerCourseDirection direction="field-guide" {...props} />
}

/** High-contrast workshop-ledger direction for Framer comparison. */
export function SkillpathCoursesLedger(props: SkillpathCoursesProps) {
    return <FramerCourseDirection direction="ledger" {...props} />
}

/** Dark night-school direction for Framer comparison. */
export function SkillpathCoursesNight(props: SkillpathCoursesProps) {
    return <FramerCourseDirection direction="night-school" {...props} />
}

const DEFAULT_PROPS: SkillpathCoursesProps = {
    sectionTitle: "Build skills that move you forward.",
    accentColor: "#176B52",
}

const PROPERTY_CONTROLS = {
    sectionTitle: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: DEFAULT_PROPS.sectionTitle,
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: DEFAULT_PROPS.accentColor,
    },
} as const

SkillpathCourses.defaultProps = DEFAULT_PROPS
SkillpathCoursesLedger.defaultProps = { ...DEFAULT_PROPS, accentColor: "#125BE4" }
SkillpathCoursesNight.defaultProps = { ...DEFAULT_PROPS, accentColor: "#B7F34A" }

addPropertyControls(SkillpathCourses, PROPERTY_CONTROLS)
addPropertyControls(SkillpathCoursesLedger, PROPERTY_CONTROLS)
addPropertyControls(SkillpathCoursesNight, PROPERTY_CONTROLS)
