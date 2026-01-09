export function getCreateUserErrorMessage(
  error: unknown,
  t: (key: string) => string
): string {
  if (error && typeof error === 'object') {
    const err = error as { name?: string; message?: string };
    if (err.message === 'USERNAME_EXISTS' || err.name === 'ConstraintError') {
      return t('errors.userExists');
    }
  }

  return t('errors.userCreateFailed');
}
