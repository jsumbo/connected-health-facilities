import type { BlockerItem } from "./types-public"
import { blockerDisplayLabel } from "./blockers"
import { getBlockerCode } from "./quick-wins"

export function formatBlocker(blocker: BlockerItem | string): string {
  if (typeof blocker === "string") return blockerDisplayLabel(blocker)
  const code = getBlockerCode(blocker) ?? blocker.code
  return blockerDisplayLabel(code, blocker.remediation)
}

export function blockerKey(blocker: BlockerItem | string, index: number): string {
  if (typeof blocker === "string") return `${blocker}-${index}`
  return blocker.code
}
