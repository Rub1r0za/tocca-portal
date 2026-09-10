export type MutationResult = { ok: boolean; error?: string }

export function mutationFailure(operation: string, error: unknown): MutationResult {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
  console.error(`[portal:${operation}]`, { code, message: error instanceof Error ? error.message : String(error && typeof error === 'object' && 'message' in error ? error.message : error) })
  return { ok: false, error: 'save_failed' }
}
