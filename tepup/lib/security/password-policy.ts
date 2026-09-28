// Shared by the API routes and the sign-up / change-password forms.
export const PASSWORD_MIN_LENGTH = 10;
// bcrypt only uses the first 72 bytes; the cap also stops oversized inputs.
export const PASSWORD_MAX_LENGTH = 128;
