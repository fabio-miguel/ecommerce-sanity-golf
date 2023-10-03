import {Image, Video} from '@shopify/hydrogen';

//  * A client component that defines a media gallery for hosting images, 3D models, and videos of products

export function ProductGallery({media, className}) {
  console.log(media);
  if (!media.length) {
    return null;
  }

  return (
    <div
      className={`swimlane md:grid-flow-row hiddenScroll md:p-0 md:overflow-x-auto md:grid-cols-2 ${className}`}
    >
      {media.map((med, i) => {
        const isFirst = i === 0;
        const isFourth = i === 3;
        const isFullWidth = i % 3 === 0;

        const image =
          med.__typename === 'MediaImage'
            ? {...med.image, altText: med.alt || 'Product image'}
            : null;

        const video =
          med.__typename === 'Video'
            ? {
                sources: med.sources,
                altText: med.alt || 'Product video',
                previewImage: med.previewImage,
              }
            : null;

        const style = [
          isFullWidth ? 'md:col-span-2' : 'md:col-span-1',
          isFirst || isFourth ? '' : 'md:aspect-[4/5]',
          'aspect-square snap-center card-image bg-transparent dark:bg-contrast/10 w-mobileGallery md:w-full',
        ].join(' ');

        return (
          <div className={`${style} border-none`} key={med.id || image?.id}>
            {image && (
              <Image
                loading={i === 0 ? 'eager' : 'lazy'}
                data={image}
                aspectRatio={!isFirst && !isFourth ? '4/5' : undefined}
                sizes={
                  isFirst || isFourth
                    ? '(min-width: 48em) 60vw, 90vw'
                    : '(min-width: 48em) 30vw, 90vw'
                }
                className="object-cover w-full h-full aspect-square fadeIn"
              />
            )}

            {video && (
              <div className="aspect-square">
                <Video
                  data={video}
                  className="object-cover w-full h-full"
                  // Adjust other video props as needed
                  autoPlay
                  loop
                  muted
                  controls={false}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
