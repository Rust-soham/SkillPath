import { createCourseApi } from "./course-api"

/** Live browser API adapter composed for the Framer entrypoint. */
export const liveCourseApi = createCourseApi(globalThis.fetch.bind(globalThis))
