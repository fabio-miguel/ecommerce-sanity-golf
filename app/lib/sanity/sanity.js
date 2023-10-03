import {createClient} from '@sanity/client';

export const projectId = 'i1fhnssa';
export const dataset = 'production';
const apiVersion = '2023-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
