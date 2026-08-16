import { describe, expect, it, vi } from "vitest"

import { createCourseApi, type FetchLike } from "../src/course-api"
import { COURSE_FIXTURE as COURSE } from "./test-fixtures"

function fetchResponse(response: Response): FetchLike {
    return vi.fn<FetchLike>().mockResolvedValue(response)
}

describe("course HTTP client", () => {
    it("performs one GET and parses valid variable-length course responses", async () => {
        const fetchImplementation = fetchResponse(Response.json([COURSE]))
        const api = createCourseApi(fetchImplementation)

        const result = await api.loadCourses(new AbortController().signal)

        expect(result.isOk() && result.value).toEqual([COURSE])
        expect(fetchImplementation).toHaveBeenCalledTimes(1)
        expect(fetchImplementation).toHaveBeenCalledWith(
            "https://syncsphere-hiv6.onrender.com/assignment/course-data",
            expect.objectContaining({ method: "GET" })
        )

        const emptyApi = createCourseApi(fetchResponse(Response.json([])))
        const empty = await emptyApi.loadCourses(new AbortController().signal)
        expect(empty.isOk() && empty.value).toEqual([])
    })

    it("classifies flaky 500 responses without retrying inside the client", async () => {
        const fetchImplementation = fetchResponse(
            new Response("Internal Server Error", { status: 500 })
        )
        const api = createCourseApi(fetchImplementation)

        const result = await api.loadCourses(new AbortController().signal)

        expect(result.isErr()).toBe(true)
        if (result.isErr() && result.error._tag === "HttpResponseError") {
            expect(result.error.status).toBe(500)
        }
        expect(fetchImplementation).toHaveBeenCalledTimes(1)
    })

    it("distinguishes invalid JSON from schema mismatch", async () => {
        const invalidJsonApi = createCourseApi(
            fetchResponse(new Response("not-json", { status: 200 }))
        )
        const wrongShapeApi = createCourseApi(
            fetchResponse(Response.json({ courses: [COURSE] }))
        )

        const invalidJson = await invalidJsonApi.loadCourses(new AbortController().signal)
        const wrongShape = await wrongShapeApi.loadCourses(new AbortController().signal)

        expect(invalidJson.isErr() && invalidJson.error._tag).toBe("InvalidJsonError")
        expect(wrongShape.isErr() && wrongShape.error._tag).toBe("SchemaMismatchError")
    })

    it("parses supported countries and rejects unsupported country values", async () => {
        const indiaApi = createCourseApi(
            fetchResponse(Response.json({ country_code: "IN" }))
        )
        const unsupportedApi = createCourseApi(
            fetchResponse(Response.json({ country_code: "GB" }))
        )

        const india = await indiaApi.loadPricingCountry(
            new AbortController().signal
        )
        const unsupported = await unsupportedApi.loadPricingCountry(
            new AbortController().signal
        )

        expect(india.isOk() && india.value).toBe("IN")
        expect(unsupported.isErr() && unsupported.error._tag).toBe(
            "SchemaMismatchError"
        )
    })
})
