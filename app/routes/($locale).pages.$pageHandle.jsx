import {json} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigation} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {PageHeader} from '~/components';
import ContactForm from '~/custom_pages/ContactForm';

import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {useLocation} from 'react-use';

import {client} from '~/lib/sanity/sanity';
import imageUrlBuilder from '@sanity/image-url';
import About from '~/custom_pages/About';
import Contact from '~/custom_pages/Contact';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

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

  // Sanity query for all schema on home
  const pageContentSanity = await context.sanity.fetch(`*[_type == 'page']`); // Sanity data from homepage

  const seo = seoPayload.page({page, url: request.url});

  return json({page, seo, pageContentSanity});
}

export default function Page() {
  const {page, pageContentSanity} = useLoaderData();
  const location = useLocation();
  const {state} = useNavigation();
  const isAboutPage = location.pathname === '/pages/about';
  const isContactPage = location.pathname === '/pages/contact';
  // console.log(pageContentSanity);
  return (
    <>
      {state === 'loading' ? (
        <div></div>
      ) : (
        <>
          {/* <PageHeader heading={isAboutPage ? 'About' : page.title}></PageHeader> */}
          <div className="w-full">
            {isAboutPage ? (
              <About data={pageContentSanity} />
            ) : isContactPage ? (
              // <ContactForm />
              <Contact data={pageContentSanity} />
            ) : (
              <div
                dangerouslySetInnerHTML={{__html: page.body}}
                className="prose dark:prose-invert"
              />
            )}
          </div>
        </>
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
