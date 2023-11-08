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
      <h2 className="text-2xl font-semibold text-center pt-8 lg:mt-4">
        {title}
      </h2>
      <div className="flex gap-5 justify-center mt-5 mb-8 collection-category">
        <button
          className="text-base font-light tracking-wide uppercase underline-offset-8"
          data-tag="Premium"
          onClick={setParamTag}
        >
          Premium
        </button>
        <button
          className="text-base font-light tracking-wide uppercase underline-offset-8"
          data-tag="Sport"
          onClick={setParamTag}
        >
          Sport
        </button>
        <button
          className="text-base font-light tracking-wide uppercase underline-offset-8"
          data-tag="Accessory"
          onClick={setParamTag}
        >
          New
        </button>
      </div>
      {/* Added Swiper module  */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          992: {
            slidesPerView: 4,
            spaceBetween: 40,
          },
        }}
        navigation
        pagination={{clickable: true}}
        className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12 font-medium"
      >
        {productsCategory.map((product) => (
          <SwiperSlide key={`swiperslider-${product.id}`}>
            <div className="w-full max-w-80 mx-auto ">
              <ProductCard product={product} key={product.id} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}
