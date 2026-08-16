import { createRoot } from "react-dom/client"

import { SkillpathLandingFieldGuide } from "./SkillpathLandingPages"
import "./preview.css"

function PreviewApp() {
    return <SkillpathLandingFieldGuide />
}

const rootElement = document.getElementById("root")
if (rootElement === null) {
    throw new Error("Preview root element is missing")
}

createRoot(rootElement).render(<PreviewApp />)
