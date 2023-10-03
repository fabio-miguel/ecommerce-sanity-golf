import {client} from '~/lib/sanity/sanity';
import imageUrlBuilder from '@sanity/image-url';
import {Image} from '@shopify/hydrogen';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const About = (pageContentSanity) => {
  console.log(pageContentSanity);
  return (
    <>
      <section className="relative flex w-full flex-col h-screen md:h-screen justify-center md:justify-end">
        <div className="absolute inset-0 overflow-clip">
          <Image
            src={urlFor(
              `${pageContentSanity.data[1].hero.content[0].image.asset._ref}`,
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
        <div className="section-px z-10 py-10 h-screen-nav-half md:h-screen-nav flex items-center bg-gradient-to-t from-dark/30 to-dark/30 md:h-auto md:items-end md:from-dark/40 md:to-transparent pb-20">
          <div className="mx-auto flex w-full max-w-[110rem] flex-col-reverse gap-8 space-y-8 md:flex-col md:gap-0">
            <div className="mx-auto flex w-full max-w-[110rem] flex-col items-center gap-7 px-4 md:flex-row md:items-end md:justify-between md:border-b md:border-white/50 md:pb-8">
              <div className="flex flex-col gap-15 text-center md:text-left">
                <h2 className="text-white mx-auto max-w-[75%] uppercase font-bold md:mx-0 text-5xl">
                  {pageContentSanity.data[1].hero.title}
                </h2>
              </div>
              <button className="w-auto">
                <span className="block roll"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative my-15 flex w-full flex-col justify-end md:my-20">
        <div className="section-px z-10">
          <div className="mx-auto max-w-[110rem]">
            <div className="flex flex-col-reverse items-center gap-10 md:grid md:grid-cols-2">
              <Image
                src={urlFor(
                  `${pageContentSanity.data[1].body[0].modules[0].image.asset._ref}`,
                ).url()}
                alt=""
                className="fadeIn"
                sizes="(max-width: 640px) 550px, 880px"
                style={{
                  width: '100%',
                }}
              />
              <div className="max-w-[56ch] space-y-8 md:space-y-10 md:justify-self-center">
                <h2 className="max-w-prose text-d6 uppercase font-bold md:text-d6">
                  {pageContentSanity.data[1].body[1].children[0].text}
                </h2>
                <div className="portable-text">
                  <p>{pageContentSanity.data[1].body[2].children[0].text}</p>
                  <br />
                  <p>{pageContentSanity.data[1].body[3].children[0].text}</p>
                  <br />
                  <p>{pageContentSanity.data[1].body[4].children[0].text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default About;
