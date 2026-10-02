/**
 * Login error codes shared by `lib/auth.ts` (server) and the login form (client).
 *
 * NextAuth v5 turns any error thrown in `authorize` into `error=Configuration` and hides its
 * message, except a `CredentialsSignin` subclass, whose `code` reaches the client as
 * `signIn(...).code`. The code is put in a URL, so it carries no detail beyond what the
 * login form shows anyway (never whether the username exists).
 */
export const LOGIN_CODE = {
  invalid: 'invalid_credentials',
  banned: 'banned',
  /** Sent as `rate_limited:<minutes>`. */
  rateLimited: 'rate_limited',
} as const;

export function rateLimitedCode(minutes: number): string {
  return `${LOGIN_CODE.rateLimited}:${minutes}`;
}

/** Vietnamese message for a `signIn` result's `code`. */
export function loginErrorMessage(code: string | undefined | null): string {
  if (code === LOGIN_CODE.banned) {
    return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
  }
  if (code?.startsWith(`${LOGIN_CODE.rateLimited}:`)) {
    const minutes = Number.parseInt(code.slice(LOGIN_CODE.rateLimited.length + 1), 10);
    const wait = Number.isFinite(minutes) && minutes > 0 ? `${minutes} phút` : 'ít phút';
    return `Bạn đã nhập sai quá nhiều lần. Vui lòng đợi ${wait} rồi thử lại.`;
  }
  if (code === LOGIN_CODE.invalid || code === 'credentials') {
    return 'Tên tài khoản hoặc mật khẩu không đúng.';
  }
  return 'Không đăng nhập được do lỗi máy chủ. Vui lòng thử lại sau ít phút.';
}
