// @vitest-environment jsdom

import { QueryClientProvider } from "@tanstack/react-query"
import "@testing-library/jest-dom/vitest"
import { Result } from "better-result"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { CourseCatalogue } from "./SkillpathCourses"
import type { CourseApi } from "./course-api"
import { InvalidJsonError } from "./course-data"
import { createCourseQueryClient } from "./course-query"
import { COURSE_FIXTURE } from "./test-fixtures"

afterEach(cleanup)

function renderCatalogue(api: CourseApi) {
    const client = createCourseQueryClient()
    return render(
        <QueryClientProvider client={client}>
            <CourseCatalogue
                api={api}
                direction="field-guide"
                sectionTitle="Choose your next useful skill."
                accentColor="#176B52"
            />
        </QueryClientProvider>
    )
}

describe("course catalogue", () => {
    it("renders validated live-shaped data and filters it", async () => {
        const api: CourseApi = {
            loadCourses: async () => Result.ok([COURSE_FIXTURE]),
            loadPricingCountry: async () => Result.ok("US"),
        }
        renderCatalogue(api)

        expect(await screen.findByText("How To YouTube")).toBeTruthy()
        expect(screen.getByText("$39.99")).toBeTruthy()

        fireEvent.change(screen.getByRole("searchbox"), {
            target: { value: "finance" },
        })
        expect(screen.getByText("No courses match that search.")).toBeTruthy()
    })

    it("keeps courses usable when independent country lookup fails", async () => {
        const api: CourseApi = {
            loadCourses: async () => Result.ok([COURSE_FIXTURE]),
            loadPricingCountry: async () =>
                Result.err(
                    new InvalidJsonError({
                        resource: "country",
                        message: "invalid JSON",
                        cause: undefined,
                    })
                ),
        }
        renderCatalogue(api)

        expect(await screen.findByText("₹1,999")).toBeTruthy()
        expect(screen.getByText("$39.99")).toBeTruthy()
        expect(screen.getByRole("button", { name: "Retry pricing" })).toBeTruthy()
        expect(screen.getByRole("combobox")).toBeDisabled()
    })
})
