import { Result, type Result as ResultType } from "better-result"

import {
    HttpResponseError,
    InvalidJsonError,
    NetworkError,
    RequestAbortedError,
    type ApiResource,
    type Course,
    type CourseApiError,
    type PricingCountry,
    parseCourses,
    parsePricingCountry,
} from "./course-data"

const API_BASE_URL = "https://syncsphere-hiv6.onrender.com"

export type FetchLike = (
    input: RequestInfo | URL,
    init?: RequestInit
) => Promise<Response>

/** The two independent reads used by the course catalogue. */
export type CourseApi = {
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

async function getJsonOnce(
    fetchImplementation: FetchLike,
    path: string,
    resource: ApiResource,
    signal: AbortSignal
): Promise<ResultType<unknown, CourseApiError>> {
    const responseResult = await Result.tryPromise({
        try: () =>
            fetchImplementation(`${API_BASE_URL}${path}`, {
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

/** Create a one-attempt assignment API client. Retry policy belongs to TanStack Query. */
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

/** Live assignment API client used by the Framer component. */
export const courseApi = createCourseApi(globalThis.fetch.bind(globalThis))
