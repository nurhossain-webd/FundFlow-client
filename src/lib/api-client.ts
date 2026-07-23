import axios from "axios";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL is required");
}

export const apiClient = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
