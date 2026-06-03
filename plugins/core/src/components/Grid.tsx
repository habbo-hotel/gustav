import React, {ReactNode} from 'react';

export interface GridProps {
  columns?: number | string;
  gap?: 'sm' | 'md' | 'lg' | 'none';
  children?: ReactNode;
  renderSlot?: (index: number) => ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  gap = 'md',
  children,
  renderSlot,
}) => {
  const colCount = typeof columns === 'string' ? parseInt(columns, 10) : Number(columns);

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-4',
    md: 'gap-8',
    lg: 'gap-12',
  };

  return (
    <div 
      className={`gustav-grid ${gapClasses[gap]} w-full items-stretch`}
      style={{ '--cols': colCount } as any}
    >
      {renderSlot ? (
        Array.from({length: colCount}).map((_, i) => (
          <div key={i} className="min-w-0 min-h-[50px]">
            {renderSlot(i)}
          </div>
        ))
      ) : (
        children
      )}
    </div>
  );
};
