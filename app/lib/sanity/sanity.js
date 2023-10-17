import {createClient} from '@sanity/client';

export const projectId = 'i1fhnssa';
export const dataset = 'production';
const apiVersion = '2023-03-30';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
