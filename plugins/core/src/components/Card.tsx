import React, {ReactNode} from 'react';

export interface CardProps {
  title?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  backgroundColor?: string;
  textColor?: string;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  padding = 'md',
  shadow = true,
  border = true,
  backgroundColor,
  textColor,
  children,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const style: React.CSSProperties = {};
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (textColor) style.color = textColor;

  return (
    <div
      style={style}
      className={`rounded-xl flex flex-col w-full h-full ${
        !backgroundColor ? 'bg-white' : ''
      } ${
        shadow ? 'shadow-sm hover:shadow-md transition-shadow' : ''
      } ${border ? 'border border-slate-200' : ''} ${paddingClasses[padding]}`}
    >
      {title && (
        <h3 
          className="text-xl font-semibold mb-4"
          style={{ color: textColor || '#0f172a' }}
        >
          {title}
        </h3>
      )}
      <div 
        className="flex-1"
        style={{ color: textColor || '#475569' }}
      >
        {children}
      </div>
    </div>
  );
};
