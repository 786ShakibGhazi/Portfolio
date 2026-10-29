interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

/** Converts Supabase / Postgres / network errors into a short, user-friendly message. */
export function toMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as ErrorLike;
    switch (e.code) {
      case '42501':
        return 'You are not authorised to perform this action.';
      case '23505':
        return 'That item already exists.';
      case '23514':
        return 'A value is not allowed (check length and format).';
      case '23503':
        return 'This item is still referenced by other content.';
      case '22001':
        return 'A value is too long.';
      default:
        break;
    }
    if (e.message === 'profile_missing') return 'Save your profile details before publishing.';
    if (e.message === 'not_authorized') return 'You are not authorised to perform this action.';
    if (e.message && /failed to fetch|networkerror|load failed/i.test(e.message)) {
      return 'Network error. Check your connection and try again.';
    }
    if (e.message) return e.message;
  }
  if (typeof error === 'string' && error) return error;
  return 'Something went wrong. Please try again.';
}
