import { describe, expect, it } from "vitest"

import { Result } from "better-result"

import {
    HttpResponseError,
    InvalidJsonError,
    NetworkError,
    RequestAbortedError,
    SchemaMismatchError,
    type CourseApi,
} from "../src/course-api"
import { createCourseQueries, shouldRetryCourseQuery } from "../src/course-query"
import { COURSE_FIXTURE } from "./test-fixtures"

describe("TanStack Query handoff", () => {
    it("hands Ok values and typed Err values to TanStack's query protocol", async () => {
        const error = new NetworkError({
            resource: "courses",
            message: "offline",
            cause: new TypeError("fetch failed"),
        })
        const successfulApi: CourseApi = {
            loadCourses: async () => Result.ok([COURSE_FIXTURE]),
            loadPricingCountry: async () => Result.ok("IN"),
        }
        const failingApi: CourseApi = {
            loadCourses: async () => Result.err(error),
            loadPricingCountry: async () => Result.ok("IN"),
        }
        const signal = new AbortController().signal

        await expect(
            createCourseQueries(successfulApi).courses.queryFn({ signal })
        ).resolves.toEqual([COURSE_FIXTURE])
        await expect(
            createCourseQueries(failingApi).courses.queryFn({ signal })
        ).rejects.toBe(error)
    })

    it("retries observed transient failures once", () => {
        const network = new NetworkError({ resource: "courses", message: "offline", cause: undefined })
        const notFound = new HttpResponseError({ resource: "courses", status: 404, message: "flaky" })
        const server = new HttpResponseError({ resource: "courses", status: 500, message: "flaky" })
        const otherServer = new HttpResponseError({ resource: "courses", status: 503, message: "unobserved" })

        expect(shouldRetryCourseQuery(0, network)).toBe(true)
        expect(shouldRetryCourseQuery(0, notFound)).toBe(true)
        expect(shouldRetryCourseQuery(0, server)).toBe(true)
        expect(shouldRetryCourseQuery(1, server)).toBe(false)
        expect(shouldRetryCourseQuery(0, otherServer)).toBe(false)
    })

    it("does not retry contract failures or other client errors", () => {
        const invalidJson = new InvalidJsonError({ resource: "courses", message: "invalid JSON", cause: undefined })
        const unauthorized = new HttpResponseError({ resource: "courses", status: 401, message: "unauthorized" })
        const aborted = new RequestAbortedError({ resource: "courses", message: "cancelled" })
        const invalidShape = new SchemaMismatchError({ resource: "courses", message: "invalid shape", issues: [] })

        expect(shouldRetryCourseQuery(0, invalidJson)).toBe(false)
        expect(shouldRetryCourseQuery(0, unauthorized)).toBe(false)
        expect(shouldRetryCourseQuery(0, aborted)).toBe(false)
        expect(shouldRetryCourseQuery(0, invalidShape)).toBe(false)
    })
})
