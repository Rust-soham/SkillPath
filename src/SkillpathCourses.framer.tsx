import { addPropertyControls, ControlType } from "framer"
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"

type Country = "IN" | "US"
type Course = {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

type Props = {
    heading: string
    accent: string
    style?: CSSProperties
}

const API = "https://syncsphere-hiv6.onrender.com/assignment"

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseCourse(value: unknown): Course {
    if (!isRecord(value)) throw new Error("Course response is not an object")
    const strings = ["courseName", "courseCode", "description", "mainCategory", "shortCourse", "courseType", "mangoId"] as const
    for (const key of strings) if (typeof value[key] !== "string") throw new Error(`Invalid ${key}`)
    if (!Number.isInteger(value.pricePaise) || (value.pricePaise as number) < 0) throw new Error("Invalid pricePaise")
    if (!Number.isInteger(value.priceUsdCents) || (value.priceUsdCents as number) < 0) throw new Error("Invalid priceUsdCents")
    if (typeof value.refundable !== "boolean") throw new Error("Invalid refundable")
    return value as Course
}

function parseCourses(value: unknown): Course[] {
    if (!Array.isArray(value)) throw new Error("Course response is not an array")
    return value.map(parseCourse)
}

function parseCountry(value: unknown): Country {
    if (!isRecord(value) || (value.country_code !== "IN" && value.country_code !== "US")) throw new Error("Invalid country response")
    return value.country_code
}

async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(`${API}/${path}`, { signal })
            if (!response.ok) throw new Error(`Request failed (${response.status})`)
            return await response.json()
        } catch (error) {
            if (signal.aborted) throw error
            lastError = error
            if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 350 * 2 ** attempt))
        }
    }
    throw lastError
}

function money(course: Course, country: Country): string {
    const amount = country === "IN" ? course.pricePaise : course.priceUsdCents
    return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
        style: "currency",
        currency: country === "IN" ? "INR" : "USD",
        maximumFractionDigits: 2,
    }).format(amount / 100)
}

const CSS = `
.sp{--ink:#101714;--muted:#46534e;--paper:#edf2eb;--card:#fff;--line:#9fac9f;container-type:inline-size;position:relative;width:100%;min-height:400px;padding:clamp(28px,5vw,76px);overflow:hidden;color:var(--ink);background:var(--paper);font-family:Inter,Arial,sans-serif;background-image:radial-gradient(circle at 94% 4%,color-mix(in srgb,var(--accent),transparent 80%) 0 70px,transparent 71px),linear-gradient(rgba(23,32,30,.055) 1px,transparent 1px);background-size:auto,100% 32px}
.sp *{box-sizing:border-box}.sp-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:24px;margin-bottom:42px}.sp-kicker{display:flex;align-items:center;gap:9px;margin:0 0 12px;color:var(--accent);font:800 11px/1 monospace;letter-spacing:.13em;text-transform:uppercase}.sp-kicker:before{width:22px;height:3px;background:currentColor;content:""}.sp h2{max-width:820px;margin:0;font:500 clamp(40px,6vw,76px)/.96 Georgia,serif;letter-spacing:-.05em;text-wrap:balance}.sp-count{margin:0 0 7px;color:var(--muted);font:700 12px/1 monospace;letter-spacing:.06em}.sp-tools{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:10px;margin-bottom:20px}.sp-field{width:100%;height:48px;padding:0 15px;border:1px solid var(--line);border-radius:3px;outline:0;color:var(--ink);background:#fff;font:600 14px/1 "Public Sans",Arial,sans-serif}.sp-field:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent),transparent 72%)}.sp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.sp-card{position:relative;display:flex;min-width:0;min-height:286px;flex-direction:column;padding:22px 21px 20px 25px;overflow:hidden;border:1.5px solid var(--line);border-radius:3px;background:#fff;box-shadow:5px 6px 0 color-mix(in srgb,var(--accent),transparent 72%);transition:.18s ease}.sp-card:before{position:absolute;inset:0 auto 0 0;width:5px;background:var(--accent);content:""}.sp-card:nth-child(3n+2){background:color-mix(in srgb,var(--accent),white 94%)}.sp-card:hover{border-color:var(--accent);box-shadow:8px 9px 0 color-mix(in srgb,var(--accent),transparent 56%);transform:translate(-2px,-4px)}.sp-top{display:flex;min-height:28px;align-items:start;justify-content:space-between;gap:10px;margin-bottom:25px}.sp-category{overflow:hidden;color:color-mix(in srgb,var(--accent),#17201e 28%);font:750 11px/1.25 monospace;letter-spacing:.08em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap}.sp-badge{flex:none;padding:5px 8px;border:1px solid currentColor;border-radius:999px;color:var(--accent);font-size:10px;font-weight:800;text-transform:uppercase}.sp-card h3{margin:0 0 10px;font:600 23px/1.12 Georgia,serif;letter-spacing:-.025em}.sp-desc{display:-webkit-box;margin:0;overflow:hidden;color:var(--muted);font-size:13px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2}.sp-bottom{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:auto;padding-top:26px}.sp-price{font-size:24px;font-weight:800;letter-spacing:-.03em}.sp-type{display:inline-flex;min-height:25px;align-items:center;gap:6px;padding:0 9px;border:1px solid color-mix(in srgb,var(--accent),var(--line) 40%);border-radius:999px;color:var(--accent);background:color-mix(in srgb,var(--accent),white 90%);font:750 9px/1 monospace;letter-spacing:.06em;text-transform:uppercase}.sp-type:before{width:6px;height:6px;border-radius:50%;background:var(--accent);content:""}.sp-state{display:grid;min-height:286px;place-items:center;padding:42px 22px;border:1px solid var(--line);background:#fff;text-align:center}.sp-state h3{margin:0 0 8px;font:600 28px/1.1 Georgia,serif}.sp-state p{max-width:440px;margin:0 0 18px;color:var(--muted);line-height:1.5}.sp-button{height:42px;padding:0 16px;border:0;border-radius:3px;color:#fff;background:var(--accent);font-weight:800;cursor:pointer}.sp-note{margin:0 0 20px;padding:12px 14px;border:1px solid color-mix(in srgb,var(--accent),var(--line) 55%);background:color-mix(in srgb,var(--accent),var(--paper) 92%);font-size:13px}.sp-skeleton{min-height:286px;border:1px solid var(--line);background:linear-gradient(100deg,#fff 24%,color-mix(in srgb,var(--accent),#fff 91%) 43%,#fff 62%);background-size:300% 100%;animation:shimmer 1.25s infinite linear}@keyframes shimmer{to{background-position:-100% 0}}@container(max-width:899px){.sp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@container(max-width:599px){.sp{padding:50px 18px}.sp-head,.sp-tools{grid-template-columns:1fr}.sp-head{gap:12px;margin-bottom:28px}.sp-grid{grid-template-columns:1fr}.sp-card{min-height:255px}}
.sp-tools{grid-template-columns:minmax(0,1fr) 168px}.sp-field,.sp-button,.sp-note button{font-family:inherit}.sp-control{display:flex;min-width:0;flex-direction:column;gap:8px}.sp-control-label{color:var(--muted);font:700 10px/1 monospace;letter-spacing:.08em;text-transform:uppercase}.sp-field{font-size:14px;font-weight:500}.sp-sort{appearance:none;padding:0 32px 0 12px;text-align:center;text-indent:4px;background-color:#fff;background-image:linear-gradient(45deg,transparent 50%,var(--ink) 50%),linear-gradient(135deg,var(--ink) 50%,transparent 50%);background-position:calc(50% + 39px) 21px,calc(50% + 44px) 21px;background-repeat:no-repeat;background-size:5px 5px;line-height:46px}.sp-note button{margin-left:6px;padding:3px 9px;border:1px solid var(--accent);border-radius:3px;color:var(--ink);background:#fff;font-size:13px;font-weight:600;line-height:1.1;cursor:pointer}@container(max-width:599px){.sp-tools{grid-template-columns:1fr;gap:16px;margin-bottom:24px}.sp-control:last-child{width:168px;justify-self:end}}
`

/** @framerSupportedLayoutWidth any-prefer-fixed */
/** @framerSupportedLayoutHeight auto */
export default function SkillpathCourses({ heading, accent, style }: Props) {
    const [courses, setCourses] = useState<Course[] | null>(null)
    const [country, setCountry] = useState<Country | null>(null)
    const [courseError, setCourseError] = useState("")
    const [countryError, setCountryError] = useState("")
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState("featured")
    const [reload, setReload] = useState(0)

    const load = useCallback(() => setReload(value => value + 1), [])

    useEffect(() => {
        const controller = new AbortController()
        setCourses(null); setCountry(null); setCourseError(""); setCountryError("")
        getJson("course-data", controller.signal).then(parseCourses).then(setCourses).catch(error => { if (!controller.signal.aborted) setCourseError(error instanceof Error ? error.message : "Could not load courses") })
        getJson("country-code", controller.signal).then(parseCountry).then(setCountry).catch(error => { if (!controller.signal.aborted) setCountryError(error instanceof Error ? error.message : "Could not load your region") })
        return () => controller.abort()
    }, [reload])

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase()
        const filtered = (courses ?? []).filter(course => `${course.courseName} ${course.description} ${course.mainCategory}`.toLowerCase().includes(query))
        if (!country || sort === "featured") return filtered
        return [...filtered].sort((a, b) => {
            const left = country === "IN" ? a.pricePaise : a.priceUsdCents
            const right = country === "IN" ? b.pricePaise : b.priceUsdCents
            return sort === "low" ? left - right : right - left
        })
    }, [courses, country, search, sort])

    return <section className="sp" style={{ ...style, "--accent": accent } as CSSProperties}>
        <style>{CSS}</style>
        <header className="sp-head"><div><p className="sp-kicker">Explore Skillpath</p><h2>{heading}</h2></div>{courses && <p className="sp-count">{String(courses.length).padStart(2, "0")} courses</p>}</header>
        {courses && courses.length > 0 && <><div className="sp-tools"><label className="sp-control"><span className="sp-control-label">Search courses</span><input className="sp-field" type="search" value={search} onChange={event => setSearch(event.currentTarget.value)} placeholder="Skills, courses, or categories"/></label><label className="sp-control"><span className="sp-control-label">Sort courses</span><select className="sp-field sp-sort" value={sort} onChange={event => setSort(event.currentTarget.value)} disabled={!country}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>{countryError && <p className="sp-note">Regional pricing is unavailable, so both currencies are shown. <button onClick={load}>Retry</button></p>}</>}
        {courseError ? <div className="sp-state"><div><h3>Courses took a detour.</h3><p>{courseError}. The service can be temperamental, so one more try may do it.</p><button className="sp-button" onClick={load}>Try again</button></div></div> : courses === null ? <div className="sp-grid">{Array.from({ length: 6 }, (_, index) => <div className="sp-skeleton" key={index}/>)}</div> : courses.length === 0 ? <div className="sp-state"><div><h3>No courses today.</h3><p>The catalogue returned zero items. Please check again soon.</p><button className="sp-button" onClick={load}>Refresh</button></div></div> : visible.length === 0 ? <div className="sp-state"><div><h3>No matching path.</h3><p>Try a broader course, skill, or category search.</p></div></div> : <div className="sp-grid">{visible.map(course => <article className="sp-card" key={course.mangoId || course.courseCode}><div className="sp-top"><span className="sp-category">{course.mainCategory}</span>{course.refundable && <span className="sp-badge">Refundable</span>}</div><h3>{course.courseName}</h3><p className="sp-desc">{course.description}</p><div className="sp-bottom"><span className="sp-price">{country ? money(course, country) : <>{money(course, "IN")} / {money(course, "US")}</>}</span><span className="sp-type">{course.courseType}</span></div></article>)}</div>}
    </section>
}

addPropertyControls(SkillpathCourses, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Choose your next useful skill." },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#176B52" },
})
