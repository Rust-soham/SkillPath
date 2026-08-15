import { describe, expect, it } from "vitest"

import {
    SchemaMismatchError,
    formatPrice,
    parseCourses,
    parsePricingCountry,
} from "./course-data"
import { COURSE_FIXTURE as COURSE } from "./test-fixtures"

describe("course API boundary", () => {
    it("accepts valid variable-length course arrays, including zero results", () => {
        const empty = parseCourses([])
        const populated = parseCourses([COURSE])

        expect(empty.isOk() && empty.value).toEqual([])
        expect(populated.isOk() && populated.value).toEqual([COURSE])
    })

    it("returns a typed schema failure for malformed course data", () => {
        const result = parseCourses([{ ...COURSE, pricePaise: "199900" }])

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
            expect(SchemaMismatchError.is(result.error)).toBe(true)
            expect(result.error.resource).toBe("courses")
            expect(result.error.issues).not.toHaveLength(0)
        }
    })

    it("only accepts supported pricing countries", () => {
        const india = parsePricingCountry({ country_code: "IN" })
        const unsupported = parsePricingCountry({ country_code: "GB" })

        expect(india.isOk() && india.value).toBe("IN")
        expect(unsupported.isErr()).toBe(true)
    })
})

describe("price formatting", () => {
    it("converts paise to rupees", () => {
        expect(formatPrice(COURSE, "IN")).toBe("₹1,999")
    })

    it("converts cents to dollars", () => {
        expect(formatPrice(COURSE, "US")).toBe("$39.99")
    })
})
