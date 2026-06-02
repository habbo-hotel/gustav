import React, {ReactNode} from 'react';

export interface GridProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'none';
  children?: ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  gap = 'md',
  children,
}) => {
  const gridColumnsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-4',
    md: 'gap-8',
    lg: 'gap-12',
  };

  return (
    <div
      className={`grid ${gridColumnsClasses[columns]} ${gapClasses[gap]} w-full`}
    >
      {children}
    </div>
  );
};
