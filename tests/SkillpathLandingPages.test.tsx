import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
    SkillpathLandingFieldGuide,
    SkillpathLandingNightSchool,
    SkillpathLandingQuietLibrary,
    SkillpathLandingSignalPoster,
} from "../src/SkillpathLandingPages"

const DIRECTIONS = [
    ["field guide", SkillpathLandingFieldGuide],
    ["night school", SkillpathLandingNightSchool],
    ["signal poster", SkillpathLandingSignalPoster],
    ["quiet library", SkillpathLandingQuietLibrary],
] as const

describe.each(DIRECTIONS)("%s landing page", (_name, LandingPage) => {
    it("contains the required hero, live-course boundary, and three-link footer", () => {
        const markup = renderToStaticMarkup(<LandingPage />)

        expect(markup).toContain("Explore courses")
        expect(markup).toContain('id="courses"')
        expect(markup).toContain("Loading courses")
        expect(markup).toContain("Courses</a>")
        expect(markup).toContain("About Skillpath</a>")
        expect(markup).toContain("Contact</a>")
    })
})
