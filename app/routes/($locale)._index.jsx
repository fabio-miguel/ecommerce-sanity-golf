import {defer, json} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {AnalyticsPageType} from '@shopify/hydrogen';

import {ProductSwimlane, FeaturedCollections, Hero, Link} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

import imageUrlBuilder from '@sanity/image-url';
import {client} from '~/lib/sanity/sanity';

const builder = imageUrlBuilder(client);

export const headers = routeHeaders;

function urlFor(source) {
  return builder.image(source);
}

// Request arguement in LoaderArgs for filetering on featuredProducts
export async function loader({request, params, context}) {
  const {language, country} = context.storefront.i18n;

  const homepage = await context.sanity.fetch(`*[_type == "home"]`); // Sanity data from homepage

  console.log(homepage);
  // Filtering variables for featuredProducts
  const searchParams = new URLSearchParams(new URL(request.url).searchParams);
  const tagfilter = searchParams.get(`tag`)
    ? `tag:${searchParams.get('tag')}`
    : `tag:Sport`;

  // Default Hydrogen Logic
  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }
  // The primary hero derived from a created collection on shopify
  // using meta data that mathes COLLECTION_CONTENT_FRAGMENT in shopify
  // handle can be reassigned (e.g. "hero") so long as it mathes shopify collection.
  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'featured'},
  });

  const seo = seoPayload.home();

  return defer({
    shop,
    primaryHero: hero,
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    featuredProducts: context.storefront.query(
      HOMEPAGE_FEATURED_PRODUCTS_QUERY,
      {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          // | Added tagfilter: tagfilter, | //
          tagfilter: tagfilter,
          country,
          language,
        },
      },
    ),
    secondaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'backcountry',
        country,
        language,
      },
    }),
    featuredCollections: context.storefront.query(FEATURED_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    }),
    tertiaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'winter-2022',
        country,
        language,
      },
    }),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    seo,
    homepage,
  });
}

export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
    homepage,
  } = useLoaderData();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);
  // console.log(homeContent);
  // console.log(homeContent[0].modules[0].content[0].asset._ref);

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}
      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections}
                  title="Categories"
                />
              );
            }}
          </Await>
        </Suspense>
      )}
      {/* assets from sanity here: */}

      <section className="relative flex w-full flex-col h-screen md:h-screen justify-center md:justify-end ">
        <div className="absolute inset-0 overflow-clip h-auto">
          <img
            src={urlFor(
              `${homepage[0].modules[0].content[0].asset._ref}`,
            ).url()}
            alt="Test"
            style={{
              inset: '0px',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              width: '100%',
            }}
            className="w-full h-auto"
          />
        </div>
        <div className="section-px z-10 py-10 h-screen-nav-half md:h-screen-nav flex items-center bg-gradient-to-t from-dark/30 to-dark/30 md:h-auto md:items-end md:from-dark/40 md:to-transparent">
          <div className="mx-auto flex w-full max-w-site flex-col-reverse gap-8 space-y-8 md:flex-col md:gap-0">
            <div className="mx-auto flex w-full max-w-site flex-col items-center gap-7 px-4 md:flex-row md:items-end md:justify-between md:border-b md:border-white/50 md:pb-8">
              <div className="flex flex-col gap-15 text-center md:text-left">
                <h2 className="text-white mx-auto max-w-[75%] uppercase font-bold md:mx-0 text-5xl">
                  {homepage[0].modules[0].body}
                </h2>
              </div>
              <Link
                to="/pages/about"
                className="flex justify-center gap-2 items-center rounded-3xl uppercase text-button text-center py-3 px-6  xs:py-4 xs:px-8 hover:roll-activate focus:roll-activate disabled:text-opacity-50 group whitespace-nowrap bg-white text-dark w-auto"
              >
                {homepage[0].modules[0].title}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products}
                  title="Featured Products"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

// | Added $tagfilter: String! & query: $tagfilter | //
// @see: https://shopify.dev/api/storefront/2023-07/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode, $tagfilter: String!)
  @inContext(country: $country, language: $language) {
    products(first: 8, query: $tagfilter) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-07/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
