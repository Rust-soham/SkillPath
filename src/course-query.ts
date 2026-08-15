import { QueryClient, type QueryKey } from "@tanstack/react-query"
import type { Result } from "better-result"

import type { CourseApi } from "./course-api"
import type { CourseApiError } from "./course-data"

export const courseQueryKey = ["skillpath", "courses"] as const
export const countryQueryKey = ["skillpath", "country"] as const

/** Convert the Result protocol into TanStack Query's rejection protocol. */
export function unwrapQueryResult<T>(result: Result<T, CourseApiError>): T {
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
            return error.status === 404 || error.status >= 500
        case "RequestAbortedError":
        case "InvalidJsonError":
        case "SchemaMismatchError":
            return false
    }
}

/** Query options shared by both independent assignment API reads. */
export function createQueryOptions<T>(
    queryKey: QueryKey,
    operation: (signal: AbortSignal) => Promise<Result<T, CourseApiError>>
) {
    return {
        queryKey,
        queryFn: async ({ signal }: { readonly signal: AbortSignal }) =>
            unwrapQueryResult(await operation(signal)),
        retry: shouldRetryCourseQuery,
        retryDelay: 300,
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
