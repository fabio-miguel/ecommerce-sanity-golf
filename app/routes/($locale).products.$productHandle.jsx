import {useRef, Suspense, useState} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import {
  AnalyticsPageType,
  Money,
  ShopPayButton,
  VariantSelector,
  getSelectedProductOptions,
  Image,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {
  Heading,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

import imageUrlBuilder from '@sanity/image-url';
import {client} from '~/lib/sanity/sanity';

import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

export const headers = routeHeaders;

export async function loader({params, request, context}) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Fetch all the products from Sanity
  const allSanityProducts = await context.sanity.fetch('*[_type == "product"]');

  // Find the product that matches the given handle
  const sanityProduct = allSanityProducts.find((sanityProduct) => {
    return sanityProduct.store?.slug?.current === productHandle;
  });

  // Extract the references from productsforcompletethelook for Complete The Look section
  const completethelookReferences =
    sanityProduct.completethelook.productsforcompletethelook;
  const referencedProducts = completethelookReferences.map(
    (reference) => reference.product._ref,
  );

  // Find the matching products in allSanityProducts
  const matchingProducts = allSanityProducts.filter((product) =>
    referencedProducts.includes(product._id),
  );

  // Now, matchingProducts contains the products referenced in productsforcompletethelook

  // console.log(matchingProducts);

  const selectedOptions = getSelectedProductOptions(request);

  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  if (!product.selectedVariant) {
    return redirectToFirstVariant({product, request});
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  const variants = context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const recommended = getRecommendedProducts(context.storefront, product.id);

  // TODO: firstVariant is never used because we will always have a selectedVariant due to redirect
  // Investigate if we can avoid the redirect for product pages with no search params for first variant
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return defer({
    variants,
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    seo,
    sanityProduct,
    matchingProducts,
  });
}

function redirectToFirstVariant({product, request}) {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const firstVariant = product.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  throw redirect(`/products/${product.handle}?${searchParams.toString()}`, 302);
}

export default function Product() {
  const {
    product,
    shop,
    recommended,
    variants,
    sanityProduct,
    matchingProducts,
  } = useLoaderData();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;

  const [isDescriptionVisible1, setIsDescriptionVisible1] = useState(false);
  const [isDescriptionVisible2, setIsDescriptionVisible2] = useState(false);
  const [isDescriptionVisible3, setIsDescriptionVisible3] = useState(false);

  const toggleDescription = (buttonNumber) => {
    switch (buttonNumber) {
      case 1:
        setIsDescriptionVisible1(!isDescriptionVisible1);
        break;
      case 2:
        setIsDescriptionVisible2(!isDescriptionVisible2);
        break;
      case 3:
        setIsDescriptionVisible3(!isDescriptionVisible3);
        break;

      default:
        break;
    }
  };

  return (
    <>
      <Section className="px-0 md:px-8 lg:px-12">
        <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
          <ProductGallery
            media={media.nodes}
            className="w-full lg:col-span-2"
          />
          <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
            <section className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-sm md:px-0">
              <div className="grid gap-2">
                <Heading
                  as="h1"
                  className="whitespace-normal uppercase font-semibold text-4xl"
                >
                  {title}
                </Heading>
                {vendor && (
                  <Text className={'opacity-50 font-medium text-sm'}>
                    {vendor}
                  </Text>
                )}
              </div>
              {/* Variants */}
              <Suspense fallback={<ProductForm variants={[]} />}>
                <Await
                  errorElement="There was a problem loading related products"
                  resolve={variants}
                >
                  {(resp) => (
                    <ProductForm
                      variants={resp.product?.variants.nodes || []}
                    />
                  )}
                </Await>
              </Suspense>
              {/* Shopify Accordion */}
              {/* Shopify Description from Product > Description */}
              <div className="grid gap-4 py-4">
                {descriptionHtml && (
                  <ProductDetail
                    title="Product Details"
                    content={descriptionHtml}
                  />
                )}
                {/* Shopify Shipping Policy from Settings > Policies > Shipping policy*/}
                {shippingPolicy?.body && (
                  <ProductDetail
                    title="Shipping"
                    content={getExcerpt(shippingPolicy.body)}
                    learnMore={`/policies/${shippingPolicy.handle}`}
                  />
                )}
                {/* Shopify Refund Policy from Settings > Policies > Refund policy*/}
                {refundPolicy?.body && (
                  <ProductDetail
                    title="Returns"
                    content={getExcerpt(refundPolicy.body)}
                    learnMore={`/policies/${refundPolicy.handle}`}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </Section>

      {/* Sanity Storytelling */}
      {/* Poster */}

      <div className="w-full">
        {/* Headline Description */}
        <section className="relative my-15 flex w-full flex-col lg:my-32">
          <div className="section-px mx-auto flex max-w-site flex-col items-center gap-5 lg:gap-8 ">
            {sanityProduct.description_headline ? (
              <p className="text-4xl max-w-prose-narrow text-center text-p5 lg:text-p8">
                {sanityProduct.description_headline}
              </p>
            ) : null}
          </div>
        </section>

        {/* Poster */}
        {sanityProduct.poster ? (
          <section className="relative flex w-full flex-col h-screen-nav-half md:h-screen-nav justify-center md:justify-end border-2">
            <div className="absolute inset-0 overflow-clip">
              <img
                src={urlFor(`${sanityProduct.poster.asset._ref}`).url()}
                alt={sanityProduct.attribution}
                style={{
                  inset: '0px',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  width: '100%',
                }}
                sizes="(max-width: 640px) 1000px, 2000px"
              />
            </div>
          </section>
        ) : null}
      </div>

      {/* Description and Accordion */}
      {sanityProduct.accordion1 ? (
        <section className="section-px my-15 lg:my-20">
          <div className="mx-auto max-w-site">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 md:col-span-3 md:pr-12  lg:col-span-4">
                <div className="portable-text max-w-4xl text-lg lg:text-2xl font-normal">
                  <p>{sanityProduct.detailed_description}</p>
                </div>
              </div>

              <div className="col-span-6 mt-6 md:col-span-3 lg:mt-0 lg:col-span-2">
                <div className="w-full border-b">
                  <button
                    className="flex-col w-full justify-between py-6"
                    onClick={() => toggleDescription(1)}
                  >
                    <h3 className="text-left text-h5">
                      {sanityProduct.accordion1.title1}
                    </h3>
                    {isDescriptionVisible1 && (
                      <div className="grid gap-2 pb-6">
                        <div className="portable-text prose-sm text-p4">
                          <ul className="first:mt-0 last:mb-0 my-4 space-y-0.5 list-outside [&>*]:py-1 ">
                            <li className="p-4">
                              {sanityProduct.accordion1.description1}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                <div className="w-full border-b">
                  <button
                    className="flex-col w-full justify-between py-6"
                    onClick={() => toggleDescription(2)}
                  >
                    <h3 className="text-left text-h5">
                      {sanityProduct.accordion2.title2}
                    </h3>
                    {isDescriptionVisible2 && (
                      <div className="grid gap-2 pb-6">
                        <div className="portable-text prose-sm text-p4">
                          <ul className="first:mt-0 last:mb-0 my-4 space-y-0.5 list-outside [&>*]:py-1 ">
                            <li className="p-4">
                              {sanityProduct.accordion2.description2}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                <div className="w-full border-b">
                  <button
                    className="flex-col w-full justify-between py-6"
                    onClick={() => toggleDescription(3)}
                  >
                    <h3 className="text-left text-h5">
                      {sanityProduct.accordion3.title3}
                    </h3>
                    {isDescriptionVisible3 && (
                      <div className="grid gap-2 pb-6">
                        <div className="portable-text prose-sm text-p4">
                          <ul className="first:mt-0 last:mb-0 my-4 space-y-0.5 list-outside [&>*]:py-1 ">
                            <li className="p-4">
                              {sanityProduct.accordion3.description3}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Product Features */}
      {sanityProduct.productfeatures ? (
        <section>
          <div className="section-px my-15 lg:my-20">
            <div className="mx-auto max-w-site">
              <h2 className="mb-6 text-xl font-bold lg:mb-11 lg:text-h6">
                Product Features
              </h2>
              <div className="grid grid-cols-4 gap-8 lg:gap-4">
                <div className="col-span-4 md:col-span-2 lg:col-span-1">
                  <div className="flex flex-col gap-6">
                    <img
                      src={urlFor(
                        `${sanityProduct.productfeatures.productfeaturesfirst.firstproductfeatureimg.asset._ref}`,
                      ).url()}
                      alt={
                        sanityProduct.productfeatures.productfeaturesfirst
                          .firstproductfeaturetitle
                      }
                    />
                    <div className="">
                      <h3 className="mb-2 text-base font-semibold">
                        {
                          sanityProduct.productfeatures.productfeaturesfirst
                            .firstproductfeaturetitle
                        }
                      </h3>
                      <div className="text-sm">
                        <p>
                          {
                            sanityProduct.productfeatures.productfeaturesfirst
                              .firstproductfeaturedescription
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 lg:col-span-1">
                  <div className="flex flex-col gap-6">
                    <img
                      src={urlFor(
                        `${sanityProduct.productfeatures.productfeaturessecond.secondproductfeatureimg.asset._ref}`,
                      ).url()}
                      alt="product feature image"
                    />
                    <div className="">
                      <h3 className="mb-2 text-base font-semibold">
                        {
                          sanityProduct.productfeatures.productfeaturessecond
                            .secondproductfeaturetitle
                        }
                      </h3>
                      <div className="text-sm">
                        <p>
                          {
                            sanityProduct.productfeatures.productfeaturessecond
                              .secondproductfeaturedescription
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-px">
            <hr className="mx-auto max-w-site" />
          </div>
        </section>
      ) : null}

      {/* Complete The Look */}
      {sanityProduct.completethelook ? (
        <section className="section-px my-15 lg:my-20 overflow-hidden">
          <div className="mx-auto flex max-w-site flex-col border-b pb-15 lg:border-0 lg:pb-0">
            <h2 className="mb-5 text-xl font-bold">Complete The Look</h2>
            <div className="flex flex-col gap-5 lg:flex-row">
              {sanityProduct.completethelook.completethelookposterimage.asset
                ._ref ? (
                <div className="relative pt-5 max-h-[1150px]">
                  <div className="top-[calc(var(--height-nav)+5.2rem)] aspect-[4/5] max-h-[1150px] w-full lg:sticky lg:h-screen-no-nav lg:w-auto mb-16 ">
                    <img
                      src={urlFor(
                        `${sanityProduct.completethelook.completethelookposterimage.asset._ref}`,
                      ).url()}
                      alt="complete the look main image"
                    />
                  </div>
                </div>
              ) : null}
              <div className="swimlane hiddenScroll w-full p-0 lg:grid-flow-row lg:grid-cols-2 lg:gap-5 lg:overflow-x-auto lg:pt-5">
                {matchingProducts
                  ? matchingProducts.map((product) => {
                      // console.log(product); // Log the product to the console
                      return (
                        <div className="flex flex-col justify-between gap-2 aspect-[4/5] w-[70vw] snap-center md:w-[50vw] lg:w-full">
                          <Link>
                            <div className="grid gap-4 aspect-[4/5] w-[70vw] snap-center md:w-[50vw] lg:w-full">
                              <div className="card-image group relative aspect-[4/5]">
                                <img
                                  src={product.store.previewImageUrl}
                                  alt="related product look"
                                />
                              </div>
                              <div className="grid gap-1">
                                <h3>{product.store.title}</h3>
                                <div className="flex gap-4">
                                  <span className="flex gap-2 text-p3">
                                    <div>
                                      {`£${product.store.priceRange.maxVariantPrice}`}
                                    </div>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery - set up swiper for.  */}
      <section className="mb-5 text-xl font-bold w-full my-15 lg:my-20 section-px">
        <div className="relative">
          <div className="mx-auto max-w-site">
            <div className="mb-6 flex md:mb-10">
              <h2 className="mb-5 text-xl font-bold">Gallery</h2>
            </div>
            <div className="swiper swiper-overflow swiper-initialized swiper-horizontal swiper-free-mode transition-opacity opacity-100 swiper-backface-hidden">
              <Swiper
                modules={[Navigation, A11y]}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                  },
                }}
                // navigation
                className="swimlane hiddenScroll md:pb-8 font-medium pl-0"
              >
                {sanityProduct.gallery.gallery_images.map((item) => (
                  <SwiperSlide key={`swiperslider-${item._key}`}>
                    <div className="w-full max-w-80 mx-auto ">
                      <img
                        src={urlFor(`${item.asset._ref}`).url()}
                        alt="gallery image by fabio miguel"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Swimlane  */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <ProductSwimlane title="Keep Exploring" products={products} />
          )}
        </Await>
      </Suspense>
    </>
  );
}

export function ProductForm({variants}) {
  const {product, analytics, storeDomain} = useLoaderData();

  const closeRef = useRef(null);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics = {
    ...analytics.products[0],
    quantity: 1,
  };

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <VariantSelector
          handle={product.handle}
          options={product.options}
          variants={variants}
        >
          {({option}) => {
            return (
              <div
                key={option.name}
                className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
              >
                <Heading as="legend" size="lead" className="min-w-[4rem]">
                  {option.name}
                </Heading>
                <div className="flex flex-wrap items-baseline gap-4 ">
                  {option.values.length > 7 ? (
                    <div className="relative w-full">
                      <Listbox>
                        {({open}) => (
                          <>
                            <Listbox.Button
                              ref={closeRef}
                              className={clsx(
                                'flex items-center justify-between w-full py-3 px-4 border border-primary',
                                open
                                  ? 'rounded-b md:rounded-t md:rounded-b-none'
                                  : 'rounded',
                              )}
                            >
                              <span>{option.value}</span>
                              <IconCaret direction={open ? 'up' : 'down'} />
                            </Listbox.Button>
                            <Listbox.Options
                              className={clsx(
                                'border-2 border-black bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b ',
                                open ? 'max-h-48' : 'max-h-0',
                              )}
                            >
                              {option.values
                                .filter((value) => value.isAvailable)
                                .map(({value, to, isActive}) => (
                                  <Listbox.Option
                                    key={`option-${option.name}-${value}`}
                                    value={value}
                                  >
                                    {({active}) => (
                                      <Link
                                        to={to}
                                        className={clsx(
                                          'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                          active && 'bg-primary/10',
                                        )}
                                        onClick={() => {
                                          if (!closeRef?.current) return;
                                          closeRef.current.click();
                                        }}
                                      >
                                        {value}
                                        {isActive && (
                                          <span className="ml-2">
                                            <IconCheck />
                                          </span>
                                        )}
                                      </Link>
                                    )}
                                  </Listbox.Option>
                                ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>
                    </div>
                  ) : (
                    option.values.map(({value, isAvailable, isActive, to}) => (
                      <Link
                        key={option.name + value}
                        to={to}
                        preventScrollReset
                        prefetch="intent"
                        replace
                        className={clsx(
                          'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                          isActive ? 'border-primary/50' : 'border-primary/0',
                          isAvailable ? 'opacity-100' : 'opacity-50',
                        )}
                      >
                        {value}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          }}
        </VariantSelector>
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
                analytics={{
                  products: [productAnalytics],
                  totalValue: parseFloat(productAnalytics.price),
                }}
                className="rounded-full"
              >
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2 "
                >
                  <span>Add to Cart</span> <span>·</span>{' '}
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price}
                    as="span"
                  />
                  {isOnSale && (
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant?.compareAtPrice}
                      as="span"
                      className="opacity-50 strike"
                    />
                  )}
                </Text>
              </AddToCartButton>
            )}
            {/* {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id]}
                storeDomain={storeDomain}
              />
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetail({title, content, learnMore}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between border-t p-4">
              <Text size="lead" as="h4" className={'text-sm'}>
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert p-4"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-primary/30 text-primary/50 p-4 border-b-0"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  query variants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 250) {
        nodes {
          ...ProductVariantFragment
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
