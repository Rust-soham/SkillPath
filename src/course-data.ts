import { Result, TaggedError, type Result as ResultType } from "better-result"
import { z } from "zod"

export const CourseSchema = z.object({
    courseName: z.string().min(1),
    courseCode: z.string().min(1),
    description: z.string(),
    mainCategory: z.string().min(1),
    shortCourse: z.string().min(1),
    courseType: z.string().min(1),
    pricePaise: z.number().int().nonnegative().finite(),
    priceUsdCents: z.number().int().nonnegative().finite(),
    mangoId: z.string().min(1),
    refundable: z.boolean(),
})

export const CoursesSchema = z.array(CourseSchema)
export const PricingCountryResponseSchema = z.object({
    country_code: z.enum(["IN", "US"]),
})

/** A course validated at the assignment API boundary. */
export type Course = z.infer<typeof CourseSchema>

/** A supported pricing country returned by the assignment API. */
export type PricingCountry = z.infer<
    typeof PricingCountryResponseSchema
>["country_code"]

/** The assignment API resource involved in a failure. */
export type ApiResource = "courses" | "country"

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

/** Parse unknown JSON into validated course values. */
export function parseCourses(
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

/** Parse unknown JSON into a supported pricing country. */
export function parsePricingCountry(
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

/** Format integer minor units as a localized learner-facing price. */
export function formatPrice(
    course: Course,
    country: PricingCountry
): string {
    const currency = country === "IN" ? "INR" : "USD"
    const minorUnits =
        country === "IN" ? course.pricePaise : course.priceUsdCents

    return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(minorUnits / 100)
}
