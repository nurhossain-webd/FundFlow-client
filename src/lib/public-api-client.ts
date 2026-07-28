import axios from "axios";

import { getApiBaseURL } from "./api-url";

const apiURL = getApiBaseURL(process.env.NEXT_PUBLIC_API_URL);

export const publicApiClient = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});
