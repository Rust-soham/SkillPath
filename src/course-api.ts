import { Result, TaggedError, type Result as ResultType } from "better-result"
import type { z } from "zod"

import {
    CoursesSchema,
    PricingCountryResponseSchema,
    type Course,
    type PricingCountry,
} from "./course"

const SKILLPATH_BASE_URL = "https://syncsphere-hiv6.onrender.com"

/** The assignment API resource involved in a failure. */
export type ApiResource = "courses" | "country"

/** Fetch-compatible function accepted by the HTTP adapter. */
export type FetchLike = (
    input: RequestInfo | URL,
    init?: RequestInit
) => Promise<Response>

/** A request that could not reach the API. */
export class NetworkError extends TaggedError("NetworkError")<{
    readonly resource: ApiResource
    readonly message: string
    readonly cause: unknown
}> {}

/** A request cancelled because its consumer no longer needs it. */
export class RequestAbortedError extends TaggedError("RequestAbortedError")<{
    readonly resource: ApiResource
    readonly message: string
}> {}

/** A non-success HTTP response returned by the API. */
export class HttpResponseError extends TaggedError("HttpResponseError")<{
    readonly resource: ApiResource
    readonly status: number
    readonly message: string
}> {}

/** A successful HTTP response whose body is not JSON. */
export class InvalidJsonError extends TaggedError("InvalidJsonError")<{
    readonly resource: ApiResource
    readonly message: string
    readonly cause: unknown
}> {}

/** JSON that does not satisfy the assignment's runtime contract. */
export class SchemaMismatchError extends TaggedError("SchemaMismatchError")<{
    readonly resource: ApiResource
    readonly message: string
    readonly issues: ReadonlyArray<z.core.$ZodIssue>
}> {}

/** Every expected failure exposed by the assignment HTTP client. */
export type CourseApiError =
    | NetworkError
    | RequestAbortedError
    | HttpResponseError
    | InvalidJsonError
    | SchemaMismatchError

/** The two independent reads used by the course catalogue. */
export interface CourseApi {
    readonly loadCourses: (
        signal: AbortSignal
    ) => Promise<ResultType<ReadonlyArray<Course>, CourseApiError>>
    readonly loadPricingCountry: (
        signal: AbortSignal
    ) => Promise<ResultType<PricingCountry, CourseApiError>>
}

function isAbortError(cause: unknown): boolean {
    return cause instanceof DOMException && cause.name === "AbortError"
}

function parseCourses(
    input: unknown
): ResultType<ReadonlyArray<Course>, SchemaMismatchError> {
    const parsed = CoursesSchema.safeParse(input)
    return parsed.success
        ? Result.ok(parsed.data)
        : Result.err(
              new SchemaMismatchError({
                  resource: "courses",
                  message: "Course data did not match the expected contract",
                  issues: parsed.error.issues,
              })
          )
}

function parsePricingCountry(
    input: unknown
): ResultType<PricingCountry, SchemaMismatchError> {
    const parsed = PricingCountryResponseSchema.safeParse(input)
    return parsed.success
        ? Result.ok(parsed.data.country_code)
        : Result.err(
              new SchemaMismatchError({
                  resource: "country",
                  message: "Country data did not match the expected contract",
                  issues: parsed.error.issues,
              })
          )
}

async function getJsonOnce(
    fetchImplementation: FetchLike,
    path: string,
    resource: ApiResource,
    signal: AbortSignal
): Promise<ResultType<unknown, CourseApiError>> {
    const responseResult = await Result.tryPromise({
        try: () =>
            fetchImplementation(`${SKILLPATH_BASE_URL}${path}`, {
                method: "GET",
                signal,
                headers: { Accept: "application/json" },
            }),
        catch: (cause) =>
            isAbortError(cause)
                ? new RequestAbortedError({
                      resource,
                      message: `The ${resource} request was cancelled`,
                  })
                : new NetworkError({
                      resource,
                      message: `The ${resource} request did not reach the API`,
                      cause,
                  }),
    })

    if (responseResult.isErr()) return responseResult

    const response = responseResult.value
    if (!response.ok) {
        return Result.err(
            new HttpResponseError({
                resource,
                status: response.status,
                message: `The ${resource} API returned HTTP ${response.status}`,
            })
        )
    }

    return Result.tryPromise({
        try: async (): Promise<unknown> => response.json(),
        catch: (cause) =>
            new InvalidJsonError({
                resource,
                message: `The ${resource} API did not return valid JSON`,
                cause,
            }),
    })
}

/** Create a one-attempt assignment API adapter. Retry policy belongs to TanStack Query. */
export function createCourseApi(fetchImplementation: FetchLike): CourseApi {
    return {
        async loadCourses(signal) {
            const response = await getJsonOnce(
                fetchImplementation,
                "/assignment/course-data",
                "courses",
                signal
            )
            return response.isErr() ? response : parseCourses(response.value)
        },
        async loadPricingCountry(signal) {
            const response = await getJsonOnce(
                fetchImplementation,
                "/assignment/country-code",
                "country",
                signal
            )
            return response.isErr()
                ? response
                : parsePricingCountry(response.value)
        },
    }
}
