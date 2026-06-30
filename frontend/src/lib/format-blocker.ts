import type { BlockerItem } from "./types-public"
import { blockerShortLabel } from "./blockers"
import { getBlockerCode } from "./quick-wins"

export function formatBlocker(blocker: BlockerItem | string): string {
  if (typeof blocker === "string") return blockerShortLabel(blocker)
  const code = getBlockerCode(blocker) ?? blocker.code
  return blockerShortLabel(code, blocker.remediation)
}

export function blockerKey(blocker: BlockerItem | string, index: number): string {
  if (typeof blocker === "string") return `${blocker}-${index}`
  return blocker.code
}
