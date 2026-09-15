import { GLOSSARY } from './glossary'
import './contextHelp.css'

export type GlossaryTopic = keyof typeof GLOSSARY

/** One contextual entry point at the first meaningful use of a complex term. */
export function ContextHelpTerm({ topic }: { topic: GlossaryTopic }) {
  const item = GLOSSARY[topic]
  return <details className="context-help-term"><summary aria-label={`Объяснить термин: ${item.label}`}>i</summary><span><strong>{item.label}</strong>{item.simple}</span></details>
}
