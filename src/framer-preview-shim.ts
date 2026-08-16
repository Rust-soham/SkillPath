/** Framer control identifiers needed while rendering the component locally. */
export const ControlType = {
    String: "string",
    Color: "color",
} as const

/**
 * Ignore Framer property-control registration in the local Vite preview.
 * Framer itself continues to resolve the real package when the component is imported there.
 */
export function addPropertyControls(
    component: unknown,
    controls: unknown
): void {
    void component
    void controls
}
