export type FieldErrors = Record<string, string>

type ErrorWithDetails = {
  message?: string
  details?: string
  hint?: string
  code?: string
}

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!error || typeof error !== 'object') return {}
  const candidate = error as { response?: { data?: unknown }; details?: unknown }
  const data = candidate.response?.data
  if (!data || typeof data !== 'object') return {}
  const errors: FieldErrors = {}
  for (const [field, detail] of Object.entries(data)) {
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof (detail as { message: unknown }).message === 'string'
    ) {
      errors[field] = (detail as { message: string }).message
    }
  }
  return errors
}

export function getErrorMessage(error: unknown): string {
  const messages = Object.values(extractFieldErrors(error))
  if (messages.length > 0) return messages.join(' ')
  if (error && typeof error === 'object') {
    const { message, details, hint } = error as ErrorWithDetails
    return message || details || hint || 'Ocorreu um erro inesperado.'
  }
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}
