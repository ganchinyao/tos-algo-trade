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
