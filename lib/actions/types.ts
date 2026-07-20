import type { ZodError } from 'zod'

export type ActionResult =
  | { success: true }
  | { success: false; fieldErrors: Record<string, string[]> }

export type SimpleActionResult =
  | { success: true }
  | { success: false; message: string }

export function zodIssuesToFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return fieldErrors
}
