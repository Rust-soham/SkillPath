import { QueryClient, type QueryKey } from "@tanstack/react-query"
import type { Result } from "better-result"

import type { CourseApi, CourseApiError } from "./course-api"

const courseQueryKey = ["skillpath", "courses"] as const
const countryQueryKey = ["skillpath", "country"] as const

export const COURSE_RETRY_DELAY_MS = 300

function unwrapQueryResult<T>(result: Result<T, CourseApiError>): T {
    if (result.isErr()) throw result.error
    return result.value
}

/** Retry only the transient failures observed in the intentionally flaky API. */
export function shouldRetryCourseQuery(
    failureCount: number,
    error: CourseApiError
): boolean {
    if (failureCount >= 1) return false

    switch (error._tag) {
        case "NetworkError":
            return true
        case "HttpResponseError":
            return error.status === 404 || error.status === 500
        case "RequestAbortedError":
        case "InvalidJsonError":
        case "SchemaMismatchError":
            return false
    }
}

function createQueryOptions<T>(
    queryKey: QueryKey,
    operation: (signal: AbortSignal) => Promise<Result<T, CourseApiError>>
) {
    return {
        queryKey,
        queryFn: async ({ signal }: { readonly signal: AbortSignal }) =>
            unwrapQueryResult(await operation(signal)),
        retry: shouldRetryCourseQuery,
        retryDelay: COURSE_RETRY_DELAY_MS,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    } as const
}

/** Build query options for a concrete assignment API client. */
export function createCourseQueries(api: CourseApi) {
    return {
        courses: createQueryOptions(courseQueryKey, api.loadCourses),
        country: createQueryOptions(countryQueryKey, api.loadPricingCountry),
    }
}

/** Create an isolated cache for one Framer component instance. */
export function createCourseQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
}
