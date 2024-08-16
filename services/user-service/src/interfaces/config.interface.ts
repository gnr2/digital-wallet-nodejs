export interface Config {
    port: number;
    mongoURI?: string;
    jwtSecret?: string;
    stripeSecretKey?: string;
  }