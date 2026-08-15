import { describe, expect, it, vi } from "vitest"

import { createCourseApi, type FetchLike } from "./course-api"
import { COURSE_FIXTURE as COURSE } from "./test-fixtures"

function fetchResponse(response: Response): FetchLike {
    return vi.fn<FetchLike>().mockResolvedValue(response)
}

describe("course HTTP client", () => {
    it("performs one GET and parses a valid course response", async () => {
        const fetchImplementation = fetchResponse(Response.json([COURSE]))
        const api = createCourseApi(fetchImplementation)

        const result = await api.loadCourses(new AbortController().signal)

        expect(result.isOk() && result.value).toEqual([COURSE])
        expect(fetchImplementation).toHaveBeenCalledTimes(1)
        expect(fetchImplementation).toHaveBeenCalledWith(
            "https://syncsphere-hiv6.onrender.com/assignment/course-data",
            expect.objectContaining({ method: "GET" })
        )
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
})
