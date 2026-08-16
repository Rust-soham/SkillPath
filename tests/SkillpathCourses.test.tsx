// @vitest-environment jsdom

import { QueryClientProvider } from "@tanstack/react-query"
import "@testing-library/jest-dom/vitest"
import { Result } from "better-result"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CourseCatalogue } from "../src/SkillpathCourses"
import type { CourseApi } from "../src/course-api"
import { HttpResponseError, InvalidJsonError, NetworkError } from "../src/course-api"
import { COURSE_RETRY_DELAY_MS } from "../src/course-query"
import { createCourseQueryClient } from "../src/course-query"
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

async function settleQueryUpdates() {
    await act(async () => {
        for (let index = 0; index < 4; index += 1) {
            await Promise.resolve()
            await vi.advanceTimersByTimeAsync(1)
        }
    })
}

describe("bounded automatic recovery", () => {
    afterEach(() => vi.useRealTimers())

    it("retries courses once, exposes progress, and recovers", async () => {
        vi.useFakeTimers()
        let courseAttempts = 0
        const api: CourseApi = {
            loadCourses: async () => {
                courseAttempts += 1
                return courseAttempts === 1
                    ? Result.err(new NetworkError({ resource: "courses", message: "offline", cause: undefined }))
                    : Result.ok([COURSE_FIXTURE])
            },
            loadPricingCountry: async () => Result.ok("US"),
        }

        renderCatalogue(api)
        await settleQueryUpdates()

        expect(courseAttempts).toBe(1)
        expect(screen.getByLabelText("Retrying courses")).toBeTruthy()

        await act(async () => {
            await vi.advanceTimersByTimeAsync(COURSE_RETRY_DELAY_MS)
        })
        await settleQueryUpdates()

        expect(courseAttempts).toBe(2)
        expect(screen.getByText("How To YouTube")).toBeTruthy()
        expect(screen.queryByRole("alert")).toBeNull()
    })

    it("retries pricing independently while keeping loaded courses visible", async () => {
        vi.useFakeTimers()
        let pricingAttempts = 0
        const api: CourseApi = {
            loadCourses: async () => Result.ok([COURSE_FIXTURE]),
            loadPricingCountry: async () => {
                pricingAttempts += 1
                return pricingAttempts === 1
                    ? Result.err(new HttpResponseError({ resource: "country", status: 500, message: "flaky" }))
                    : Result.ok("US")
            },
        }

        renderCatalogue(api)
        await settleQueryUpdates()

        expect(screen.getByText("How To YouTube")).toBeTruthy()
        expect(screen.getByText("Detecting currency… Automatic retry in progress.")).toBeTruthy()

        await act(async () => {
            await vi.advanceTimersByTimeAsync(COURSE_RETRY_DELAY_MS)
        })
        await settleQueryUpdates()

        expect(pricingAttempts).toBe(2)
        expect(screen.getByText("How To YouTube")).toBeTruthy()
        expect(screen.getByText("$39.99")).toBeTruthy()
    })

    it("stops after one automatic retry and manual retry remains reachable", async () => {
        vi.useFakeTimers()
        let courseAttempts = 0
        const api: CourseApi = {
            loadCourses: async () => {
                courseAttempts += 1
                return courseAttempts <= 2
                    ? Result.err(new HttpResponseError({ resource: "courses", status: 404, message: "flaky" }))
                    : Result.ok([COURSE_FIXTURE])
            },
            loadPricingCountry: async () => Result.ok("IN"),
        }

        renderCatalogue(api)
        await settleQueryUpdates()
        await act(async () => {
            await vi.advanceTimersByTimeAsync(COURSE_RETRY_DELAY_MS)
        })
        await settleQueryUpdates()

        expect(courseAttempts).toBe(2)
        expect(screen.getByRole("alert")).toBeTruthy()
        const retryButton = screen.getByRole("button", { name: "Try again" })

        fireEvent.click(retryButton)
        await settleQueryUpdates()

        expect(courseAttempts).toBe(3)
        expect(screen.getByText("How To YouTube")).toBeTruthy()
    })
})
