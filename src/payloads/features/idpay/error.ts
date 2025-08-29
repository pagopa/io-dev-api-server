type ErrorCodes = 400 | 401 | 403 | 404;

export type ErrorDTO = {
  code: number;
  message?: string;
};

export const getIdPayError = (
  code: ErrorCodes,
  message: string = ""
): ErrorDTO => ({
  code,
  message
});
