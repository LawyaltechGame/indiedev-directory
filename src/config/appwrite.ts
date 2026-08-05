import { Client, Account, Databases, Teams, ID, Query } from 'appwrite';

// Safe env getter that works in both Vite (browser) and Node.js (CLI scripts)
const getEnv = (key: string, fallback: string): string => {
  // Vite browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  // Node.js environment
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

const client = new Client()
  .setEndpoint(getEnv('VITE_APPWRITE_ENDPOINT', 'https://fra.cloud.appwrite.io/v1'))
  .setProject(getEnv('VITE_APPWRITE_PROJECT_ID', '6a71f754000631bfb4a4'));

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);
export { ID, Query };

export default client;
