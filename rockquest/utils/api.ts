// utils/api.ts
import axios, { AxiosHeaders } from "axios";
import Constants from "expo-constants";
import { FIREBASE_AUTH } from "./firebase";

const PROD_URL = "https://rockquest-app-412827412582.us-central1.run.app";

// ✅ Always prefer env/app.json if present, otherwise ALWAYS use Cloud Run.
// (No more localhost/172.* fallbacks.)
export const BASE_URL =
  (process as any)?.env?.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig as any)?.extra?.API_URL ||
  PROD_URL;

console.log(`[api] BASE_URL = ${BASE_URL}`);

type MakeApiOpts = { json?: boolean; timeout?: number };
export const makeApi = (opts: MakeApiOpts = {}) => {
  const { json = true, timeout = 15000 } = opts;
  const instance = axios.create({ baseURL: BASE_URL, timeout });

  instance.interceptors.request.use(async (config) => {
    if (!config.headers) config.headers = new AxiosHeaders();
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const token = await user.getIdToken();
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
    if (json && !(config.data instanceof FormData)) {
      (config.headers as AxiosHeaders).set("Content-Type", "application/json");
    }
    (config.headers as AxiosHeaders).set("Accept", "application/json");

    const full = `${config.baseURL || BASE_URL}${config.url}`;
    console.log(`[api] → ${config.method?.toUpperCase()} ${full}`);
    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      console.log(`[api] ← ${res.status} ${res.config.url}`);
      return res;
    },
    (err) => {
      if (err?.response) {
        console.log(
          `[api] ← ${err.response.status} ${err.config?.url}`,
          err.response.data
        );
      } else {
        console.log(`[api] ✖ network error: ${err?.message}`);
      }
      return Promise.reject(err);
    }
  );

  return instance;
};

export const api = makeApi({ json: true, timeout: 15000 });
export const apiForm = makeApi({ json: false, timeout: 60000 });
