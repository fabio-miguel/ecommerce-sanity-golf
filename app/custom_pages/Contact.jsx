import {client} from '~/lib/sanity/sanity';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const Contact = (pageContentSanity) => {
  console.log(pageContentSanity);
  return (
    <>
      <section className="relative flex w-full flex-col h-screen md:h-screen justify-center md:justify-end">
        {/* Hero */}
        <div className="absolute inset-0 overflow-clip">
          <img
            src={urlFor(
              `${pageContentSanity.data[0].hero.content[0].image.asset._ref}`,
            ).url()}
            alt=""
            sizes="(max-width: 640px) 1000px, 2000px"
            style={{
              inset: 0,
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              width: '100%',
            }}
          />
        </div>

        {/* Hero text */}
        <div className="section-px z-10 py-10 h-screen md:h-screen flex items-center bg-gradient-to-t from-dark/30 to-dark/30 md:items-end md:from-dark/40 md:to-transparent pb-20">
          <div className="mx-auto flex w-full max-w-site flex-col-reverse gap-8 space-y-8 md:flex-col md:gap-0">
            <div className="mx-auto flex w-full max-w-site flex-col items-center gap-7 px-4 md:flex-row md:items-end md:justify-between md:border-b md:border-white/50 md:pb-8">
              <div className="flex flex-col gap-15 text-center md:text-left">
                <h2 className="text-white mx-auto uppercase font-bold md:mx-0 text-2xl">
                  PLEASE CONTACT INFO@FABIOMIGUEL.COM FOR ECOMMERCE ENQUIRIES
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Contact;
