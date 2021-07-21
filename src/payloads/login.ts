export const loginSessionToken: string = "ABCDEF12345";
const redirectUrl: string = "/profile.html?token=";
export const errorRedirectUrl: string = "/error.html?errorCode=";
export const loginWithToken = `${redirectUrl}${loginSessionToken}`;
