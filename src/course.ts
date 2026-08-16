import { z } from "zod"

/** Runtime schema for one course returned by the assignment API. */
export const CourseSchema = z.object({
    courseName: z.string().min(1),
    courseCode: z.string().min(1),
    description: z.string(),
    mainCategory: z.string().min(1),
    shortCourse: z.string().min(1),
    courseType: z.string().min(1),
    pricePaise: z.number().int().nonnegative(),
    priceUsdCents: z.number().int().nonnegative(),
    mangoId: z.string().min(1),
    refundable: z.boolean(),
})

/** Runtime schema for the variable-length course collection. */
export const CoursesSchema = z.array(CourseSchema)

/** Runtime schema for the independent country response. */
export const PricingCountryResponseSchema = z.object({
    country_code: z.enum(["IN", "US"]),
})

/** A course parsed from the assignment API contract. */
export type Course = z.infer<typeof CourseSchema>

/** A supported pricing country returned by the assignment API. */
export type PricingCountry = z.infer<
    typeof PricingCountryResponseSchema
>["country_code"]

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
