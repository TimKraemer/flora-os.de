import React from 'react';

interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  src: string;
  alt?: string;
}

/**
 * SVG Icon component that works with both Turbopack and Webpack
 *
 * Usage:
 * <SvgIcon src="/svg/title.svg" className="size-72" />
 */
export default function SvgIcon({ src, alt, ...props }: SvgIconProps) {
  // For Turbopack, SVGs are imported as URLs
  // For Webpack with @svgr, SVGs are imported as React components
  // This component handles both cases

  // Try to use Next.js Image for SVG if it's a URL
  if (src.startsWith('/') || src.startsWith('http')) {
    return (
      <img
        src={src}
        alt={alt || ''}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
        className={props.className}
      />
    );
  }

  // If it's already a React component (webpack with @svgr), use it directly
  const SvgComponent = src as unknown as React.FC<
    React.SVGProps<SVGSVGElement>
  >;
  return <SvgComponent {...props} />;
}
