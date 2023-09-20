import {json} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigation} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {PageHeader} from '~/components';
import ContactForm from '~/custom_pages/ContactForm';

import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {useLocation} from 'react-use';

export const headers = routeHeaders;

export async function loader({request, params, context}) {
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({page, seo});
}

export default function Page() {
  const {page} = useLoaderData();
  const location = useLocation();
  const {state} = useNavigation();
  return (
    <>
      {state === 'loading' ? (
        <>
          <h1>Loading...</h1>
        </>
      ) : (
        <PageHeader heading={page.title}>
          {location.pathname === '/pages/contact' ? (
            <ContactForm />
          ) : (
            <div
              dangerouslySetInnerHTML={{__html: page.body}}
              className="prose dark:prose-invert"
            />
          )}
        </PageHeader>
      )}
    </>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
