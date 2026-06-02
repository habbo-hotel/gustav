import React from 'react';

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  rounded?: boolean;
}

export const Image: React.FC<ImageProps> = ({src, alt, caption, rounded = true}) => {
  return (
    <figure className="my-8">
      <img
        src={src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000'}
        alt={alt}
        className={`w-full h-auto object-cover ${rounded ? 'rounded-2xl' : ''} shadow-xl shadow-slate-200 dark:shadow-none`}
      />
      {caption && (
        <figcaption className="text-center text-xs text-gray-400 mt-4 font-medium italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
