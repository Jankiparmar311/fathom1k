const conf = {
  APIUrl: String(import.meta.env.VITE_REACT_APP_API_URL),
  cookiePath: String(import.meta.env.VITE_REACT_APP_COOKIE_PATH),
  cookieDomain: String(import.meta.env.VITE_REACT_APP_COOKIE_DOMAIN),
  cookieExpires: String(import.meta.env.VITE_REACT_APP_COOKIE_EXPIRES),
};
export default conf;

export const priceEnum = {
  masterPrice: 0,
  dayWisePrice: 1,
  slotWisePrice: 2,
};

export const localStorageKeys = {
  SELECTED_DATE: "selected-date",
  AVAILABILITY_ID: "availabilityId",
  MONTH: "month",
  YEAR: "year",
  COMPANY_NAME: "companyName",
};
