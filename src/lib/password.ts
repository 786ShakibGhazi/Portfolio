export function validatePassword(password: string, confirm: string): string | null {
  if (password.length < 12) return 'Use at least 12 characters.';
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Include upper-case, lower-case and a number.';
  }
  if (password !== confirm) return 'The passwords do not match.';
  return null;
}
