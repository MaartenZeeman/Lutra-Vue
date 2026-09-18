export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  [key: string]: unknown
}

async function readProblemDetails(response: Response): Promise<ProblemDetails | null> {
  try {
    const text = await response.text()
    if (text.length === 0) {
      return null
    }

    const parsed: unknown = JSON.parse(text)
    if (parsed !== null && typeof parsed === 'object') {
      return parsed as ProblemDetails
    }

    return null
  } catch {
    return null
  }
}

export class ApiError extends Error {
  override readonly name = 'ApiError'

  readonly status: number

  readonly problem: ProblemDetails | null

  constructor(status: number, message: string, problem: ProblemDetails | null = null) {
    super(message)
    this.status = status
    this.problem = problem
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const problem = await readProblemDetails(response)
    const message =
      problem?.detail ?? problem?.title ?? `Het verzoek is mislukt met status ${response.status}.`

    return new ApiError(response.status, message, problem)
  }
}

/** Turns an unknown thrown value into a message that is safe to show to the user. */
export function foutmelding(fout: unknown): string {
  if (fout instanceof ApiError) {
    return fout.message
  }

  if (fout instanceof Error && fout.message.length > 0) {
    return fout.message
  }

  return 'Er is iets misgegaan. Probeer het opnieuw.'
}
