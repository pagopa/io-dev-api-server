export const loginSessionToken: string = "ABCDEF12345";
export const loginLolliPopRedirect: string = "/idp-login";
const redirectUrl: string = "/profile.html?token=";
export const errorRedirectUrl: string = "/error.html?errorCode=";
export const loginWithToken = `${redirectUrl}${loginSessionToken}`;
