var EMPLOYER_ACCESS_KEY = "dz_employer_access_granted";

export function grantEmployerAccess() {
  try {
    sessionStorage.setItem(EMPLOYER_ACCESS_KEY, "1");
  } catch (e) {}
}

export function isEmployerAccessGranted() {
  try {
    return sessionStorage.getItem(EMPLOYER_ACCESS_KEY) === "1";
  } catch (e) {
    return false;
  }
}
