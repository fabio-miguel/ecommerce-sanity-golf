import {ProductCard, Section} from '~/components';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';
import {useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}) {
  const fetcher = useFetcher();
  const [productsCategory, setProductsCategory] = useState([]);
  const setParamTag = (event) => {
    const collectionCategory = document.querySelectorAll(
      '.collection-category > button',
    );
    collectionCategory.forEach((category) => {
      category.classList.remove('underline');
      category.classList.remove('underline-offset-8');
    });
    event.target.classList.add('underline');
    event.target.classList.add('underline-offset-8');
    fetcher.load(`/?tag=${event.target.dataset.tag}`);
  };

  useEffect(() => {
    if (fetcher.data) {
      setProductsCategory(fetcher.data.featuredProducts?.products?.nodes);
    } else {
      setProductsCategory(products.nodes);
    }
  }, [fetcher]);

  return (
    <Section padding="y" {...props}>
      <h2 className="text-3xl text-center pt-8">{title}</h2>
      <div className="flex gap-5 justify-center mt-5 mb-8 collection-category">
        <button
          className="text-3xl font-light tracking-wide uppercase underline-offset-8"
          data-tag="Premium"
          onClick={setParamTag}
        >
          Premium
        </button>
        <button
          className="text-3xl font-light tracking-wide uppercase underline-offset-8"
          data-tag="Sport"
          onClick={setParamTag}
        >
          Sport
        </button>
        <button
          className="text-3xl font-light tracking-wide uppercase underline-offset-8"
          data-tag="Accessory"
          onClick={setParamTag}
        >
          Accessory
        </button>
      </div>
      {/* | Added Swiper module  | */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={5}
        slidesPerView={4}
        navigation
        pagination={{clickable: true}}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12"
      >
        {productsCategory.map((product) => (
          <SwiperSlide key={`swiperslider-${product.id}`}>
            <ProductCard
              product={product}
              key={product.id}
              className="snap-start w-80"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}
