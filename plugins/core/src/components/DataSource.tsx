import React, {ReactNode} from 'react';

export interface DataSourceProps {
  schemaSlug?: string;
  schemaName?: string;
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  children?: ReactNode;
  editable?: boolean;
  records?: Record<string, any>[];
  fields?: {name: string; label: string}[];
  onPropChange?: (name: string, value: any) => void;
}

export const DataSource: React.FC<DataSourceProps> = ({
  schemaSlug,
  schemaName,
  limit = 10,
  sortDirection = 'DESC',
  children,
  editable,
}) => {
  if (editable) {
    return (
      <div className="gustav-data-source relative border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-xl mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-t-xl border-b border-indigo-100 dark:border-indigo-500/20">
          <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v4m8-4v4M3 11h18" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            {schemaName || (schemaSlug ? `load${schemaSlug.charAt(0).toUpperCase() + schemaSlug.slice(1).replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())}s()` : 'Data Source')}
          </span>
          {schemaSlug && (
            <span className="text-[9px] text-indigo-400 dark:text-indigo-400/60 font-medium ml-auto">
              {limit} records &middot; {sortDirection}
            </span>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
