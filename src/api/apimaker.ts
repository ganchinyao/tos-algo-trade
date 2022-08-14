// Modified from https://github.com/Sainglend/tda-api-client/blob/master/src/tdapiinterface.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";
import { getClientID, getRefreshToken } from "../utils";
import qs from "qs";

/**
 * Stores the current Auth data and will append access_token with its expired time.
 * We will read this from memory to check if access_token has expired to avoid unnecessary call to get new access_token.
 */
const localAuthData: IAuthConfig = {
  refresh_token: getRefreshToken(),
  client_id: getClientID(),
};

const instance: AxiosInstance = axios.create({
  baseURL: "https://api.tdameritrade.com",
  headers: {
    Accept: "*/*",
    "Accept-Language": "en-US",
    DNT: 1,
    Host: "api.tdameritrade.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
  },
});

export interface IAuthConfig {
  refresh_token: string;
  client_id: string;
  access_token?: string;
  expires_on?: number; // Will be Date.now() + 30mins.
  expires_in?: number; // Value returned from TD. Will be 1800 for 30 minutes
  code?: string;
  redirect_uri?: string;
}

export interface TacRequestConfig {
  url?: string;
  bodyJSON?: any;
}

export interface IWriteResponse {
  data: any;
  statusCode: number;
  location: string;
}

/**
 * Use this for sending an HTTP GET request to api.tdameritrade.com
 */
export async function apiGet(config: TacRequestConfig): Promise<any> {
  return await apiNoWriteResource(config, "get", false);
}

/**
 * Use this for sending an HTTP POST request to api.tdameritrade.com
 */
export async function apiPost(
  config: TacRequestConfig
): Promise<IWriteResponse> {
  return await apiWriteResource(config, "post", false);
}

/**
 * Use this for sending an HTTP DELETE request to api.tdameritrade.com
 */
export async function apiDelete(config: TacRequestConfig): Promise<any> {
  return await apiNoWriteResource(config, "delete", false);
}

/**
 * Use this for sending an HTTP PATCH request to api.tdameritrade.com
 */
export async function apiPatch(
  config: TacRequestConfig
): Promise<IWriteResponse> {
  return await apiWriteResource(config, "patch", false);
}

/**
 * Use this for sending an HTTP PUT request to api.tdameritrade.com
 */
export async function apiPut(
  config: TacRequestConfig
): Promise<IWriteResponse> {
  return await apiWriteResource(config, "put", false);
}

async function apiNoWriteResource(
  config: TacRequestConfig,
  method: Method,
  skipAuth: boolean
): Promise<any> {
  const requestConfig: AxiosRequestConfig = {
    method,
    url: config.url ?? "",
    headers: {},
  };

  if (!skipAuth) {
    const authResponse = await getAPIAuthentication();
    const token = authResponse.access_token;
    // @ts-ignore
    requestConfig.headers["Authorization"] = `Bearer ${token}`;
  }

  return await performAxiosRequest(requestConfig, true);
}

async function apiWriteResource(
  config: TacRequestConfig,
  method: Method,
  skipAuth: boolean
): Promise<IWriteResponse> {
  const requestConfig = {
    method: method,
    url: config.url,
    headers: {
      "Content-Type": "application/json",
    },
    data: config.bodyJSON,
  };

  if (!skipAuth) {
    const authResponse = await getAPIAuthentication();
    const token = authResponse.access_token;
    // @ts-ignore
    requestConfig.headers["Authorization"] = `Bearer ${token}`;
  }

  return (await performAxiosRequest(requestConfig, false)) as IWriteResponse;
}

/**
 * Use this to get authentication info. Will serve up local copy if not yet expired.
 */
async function getAPIAuthentication(): Promise<IAuthConfig> {
  // We can look at the locally stored copy for expires_on
  if (
    localAuthData.expires_on &&
    localAuthData.access_token &&
    localAuthData.refresh_token &&
    localAuthData.client_id &&
    localAuthData.expires_on > Date.now()
  ) {
    // not refreshing authentication as it has not expired
    return localAuthData;
  } else if (
    !localAuthData.expires_on ||
    localAuthData.expires_on < Date.now()
  ) {
    return await refreshAPIAuthentication();
  } else {
    // not refreshing authentication as it has not expired
    return localAuthData;
  }
}

async function doAuthRequest(data: any): Promise<IAuthConfig> {
  const requestConfig: AxiosRequestConfig = {
    method: "post",
    url: "/v1/oauth2/token",
    data,
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip",
      "Accept-Language": "en-US",
      "Content-Type": "application/x-www-form-urlencoded",
      DNT: 1,
      Host: "api.tdameritrade.com",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
    },
  };
  const result = await performAxiosRequest(requestConfig, true);

  Object.assign(localAuthData, result);
  localAuthData.expires_on =
    Date.now() + (result.expires_in ? result.expires_in * 1000 : 0);

  return localAuthData;
}

/**
 * Use this to force the refresh of the access_token, regardless of whether it is expired.
 * Returns auth info object with the all-important access_token.
 */
async function refreshAPIAuthentication(): Promise<IAuthConfig> {
  return await doAuthRequest(
    qs.stringify({
      grant_type: "refresh_token",
      refresh_token: localAuthData.refresh_token,
      access_type: "",
      code: "",
      client_id: localAuthData.client_id,
      redirect_uri: "",
    })
  );
}

async function performAxiosRequest(
  requestConfig: AxiosRequestConfig,
  expectData: boolean
): Promise<any> {
  return await new Promise<any>((res, rej) => {
    instance
      .request(requestConfig)
      .then(function (response: AxiosResponse) {
        if (expectData) {
          res(response.data);
        } else {
          res({
            data: response.data,
            statusCode: response.status,
            location:
              response.headers.location || response.headers["content-location"],
          });
        }
      })
      .catch(function (error: AxiosError) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          rej(
            `ERROR [${error.response.status}] [${requestConfig.method} ${
              requestConfig.url
            }]: ${JSON.stringify(error.response.data)}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          rej(
            `The request was made but no response was received: ${JSON.stringify(
              error.request
            )}`
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          rej(
            `An error occurred while setting up the request: ${JSON.stringify(
              error.message
            )}`
          );
        }
        rej(error.config);
      });
  });
}
