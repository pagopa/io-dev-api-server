export type ErrorDto = {
  code: number | string;
  message?: string;
};

type ErrorCodes = 400 | 401 | 403 | 404;

export const getIdPayError = (
  code: ErrorCodes,
  message: string = ""
): ErrorDto => ({
  code,
  message
});
