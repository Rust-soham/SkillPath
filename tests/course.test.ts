import { describe, expect, it } from "vitest"

import { formatPrice } from "../src/course"
import { COURSE_FIXTURE as COURSE } from "./test-fixtures"

describe("price formatting", () => {
    it("converts paise to rupees", () => {
        expect(formatPrice(COURSE, "IN")).toBe("₹1,999")
    })

    it("converts cents to dollars", () => {
        expect(formatPrice(COURSE, "US")).toBe("$39.99")
    })
})
