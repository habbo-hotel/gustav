import React, {ReactNode} from 'react';

export interface CardProps {
  title?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  padding = 'md',
  shadow = true,
  border = true,
  children,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl flex flex-col w-full h-full ${
        shadow ? 'shadow-sm hover:shadow-md transition-shadow' : ''
      } ${border ? 'border border-slate-200' : ''} ${paddingClasses[padding]}`}
    >
      {title && (
        <h3 className="text-xl font-semibold text-slate-900 mb-4">{title}</h3>
      )}
      <div className="flex-1 text-slate-600">{children}</div>
    </div>
  );
};
