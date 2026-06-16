import type { BlockerItem } from "./types-public"

export function formatBlocker(blocker: BlockerItem | string): string {
  if (typeof blocker === "string") return blocker
  return `${blocker.code} — ${blocker.remediation}`
}

export function blockerKey(blocker: BlockerItem | string, index: number): string {
  if (typeof blocker === "string") return `${blocker}-${index}`
  return blocker.code
}
