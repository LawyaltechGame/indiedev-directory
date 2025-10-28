import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68ff22d10031bb19f314');

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

export default client;
