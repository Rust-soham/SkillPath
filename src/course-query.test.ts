import { Result } from "better-result"
import { describe, expect, it } from "vitest"

import { HttpResponseError, InvalidJsonError, NetworkError } from "./course-data"
import { shouldRetryCourseQuery, unwrapQueryResult } from "./course-query"

describe("TanStack Query handoff", () => {
    it("returns Ok values and rejects typed Err values", () => {
        expect(unwrapQueryResult(Result.ok("courses"))).toBe("courses")
        const error = new NetworkError({
            resource: "courses",
            message: "offline",
            cause: new TypeError("fetch failed"),
        })

        expect(() => unwrapQueryResult(Result.err(error))).toThrow("offline")
    })

    it("retries observed transient failures once", () => {
        const network = new NetworkError({ resource: "courses", message: "offline", cause: undefined })
        const notFound = new HttpResponseError({ resource: "courses", status: 404, message: "flaky" })
        const server = new HttpResponseError({ resource: "courses", status: 500, message: "flaky" })

        expect(shouldRetryCourseQuery(0, network)).toBe(true)
        expect(shouldRetryCourseQuery(0, notFound)).toBe(true)
        expect(shouldRetryCourseQuery(0, server)).toBe(true)
        expect(shouldRetryCourseQuery(1, server)).toBe(false)
    })

    it("does not retry contract failures or other client errors", () => {
        const invalidJson = new InvalidJsonError({ resource: "courses", message: "invalid JSON", cause: undefined })
        const unauthorized = new HttpResponseError({ resource: "courses", status: 401, message: "unauthorized" })

        expect(shouldRetryCourseQuery(0, invalidJson)).toBe(false)
        expect(shouldRetryCourseQuery(0, unauthorized)).toBe(false)
    })
})
