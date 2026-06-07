import {useLocation} from 'react-router-dom';
import {plugins} from 'virtual:gustav-plugins';
import {PageWire, PageComponentWire} from '@gustav/types';
import React, {useState, useEffect, useMemo, useCallback} from 'react';

import {pageSdk, schemaSdk} from './sdk';
import {DataContext} from './hooks/data-context';

function DataSourceRenderer({
  dataSourceId,
  schemaSlug,
  limit,
  sortDirection,
  children,
  allComponents,
  renderComponent,
}: {
  dataSourceId: number;
  schemaSlug: string;
  limit: number;
  sortDirection: 'ASC' | 'DESC';
  children: any[];
  allComponents: any[];
  renderComponent: (comp: any, all: any[]) => React.ReactNode;
}) {
  const [records, setRecords] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schemaSlug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const schema = await schemaSdk.findOne(schemaSlug);
        if (cancelled) return;
        setFields(schema.fields || []);
        const result = await schemaSdk.queryPublicRecords(schemaSlug, {
          limit: limit || 10,
          sortDirection: sortDirection || 'DESC',
        });
        if (cancelled) return;
        setRecords(result.records || []);
      } catch (e) {
        console.error('DataSource fetch failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [schemaSlug, limit, sortDirection]);

  const resolveDescendants = useCallback(
    (parentId: number, record: Record<string, any>): Map<number, PageComponentWire> => {
      const resolved = new Map<number, PageComponentWire>();
      const stack = [parentId];
      while (stack.length > 0) {
        const pid = stack.pop()!;
        allComponents.filter(c => c.parentId === pid).forEach(child => {
          resolved.set(child.id, {
            ...child,
            props: resolveTemplateTokens(child.props, record.data || record),
          });
          stack.push(child.id);
        });
      }
      return resolved;
    },
    [allComponents]
  );

  if (loading) return <div className="p-4 text-gray-400 text-xs">Loading data...</div>;
  if (!schemaSlug) return null;
  if (records.length === 0) return <div className="p-4 text-gray-400 text-xs">No records found</div>;

  return (
    <>
      {records.map((record, index) => {
        const resolvedMap = resolveDescendants(dataSourceId, record);
        const resolvedChildren = allComponents.map(c => resolvedMap.get(c.id) || c);
        return (
          <DataContext.Provider key={index} value={{fields, currentRecord: record.data || record}}>
            {children.map((child: any) => {
              const resolvedChild = resolvedMap.get(child.id) || child;
              return renderComponent(resolvedChild, resolvedChildren);
            })}
          </DataContext.Provider>
        );
      })}
    </>
  );
}

function resolveTemplateValue(value: unknown, record: Record<string, any>): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_: string, fieldName: string) =>
      String(record[fieldName] ?? '')
    );
  }
  if (Array.isArray(value)) {
    return value.map(item => resolveTemplateValue(item, record));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, val]) => ({...acc, [key]: resolveTemplateValue(val, record)}),
      {} as Record<string, unknown>
    );
  }
  return value;
}

function resolveTemplateTokens(props: string, record: Record<string, any>): string {
  try {
    const parsed = JSON.parse(props);
    const resolved = resolveTemplateValue(parsed, record);
    return JSON.stringify(resolved);
  } catch {
    return props;
  }
}

export function PageRenderer() {
  const location = useLocation();
  const [page, setPage] = useState<PageWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPageByPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (page) {
      document.title = `Gustav - ${page.title}`;
    } else if (error) {
      document.title = 'Gustav - 404';
    } else {
      document.title = 'Gustav';
    }
  }, [page, error]);

  const fetchPageByPath = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      // The path in DB starts with /
      const data = await pageSdk.findByPath(path);
      setPage(data);
    } catch (err) {
      setError('Page not found');
    } finally {
      setLoading(false);
    }
  };

  const renderComponent = (
    comp: PageComponentWire,
    allComponents: PageComponentWire[]
  ) => {
    // Resolve component from plugins
    const plugin = plugins.find(p => p.name === comp.pluginName);
    const pluginComp = plugin?.components.find(
      c => c.name === comp.componentName
    );

    if (!pluginComp) {
      return (
        <div
          key={comp.id}
          className="p-4 bg-red-50 text-red-500 rounded-xl my-4 text-xs font-mono"
        >
          [Plugin Error] Component "{comp.componentName}" not found in registry
          for plugin "{comp.pluginName}".
        </div>
      );
    }

    const Component = pluginComp.component;
    const props = JSON.parse(comp.props || '{}');

    // Find children for this component
    const children = allComponents
      .filter(c => c.parentId === comp.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // If it's a DataSource, render via DataSourceRenderer for data fetching
    if (comp.componentName === 'DataSource' && comp.pluginName === '@gustav/core-plugin') {
      return (
        <DataSourceRenderer
          key={comp.id}
          dataSourceId={comp.id}
          schemaSlug={props.schemaSlug}
          limit={props.limit}
          sortDirection={props.sortDirection}
          children={children}
          allComponents={allComponents}
          renderComponent={renderComponent}
        />
      );
    }

    // If it's a Grid, distribute children into slots
    if (comp.componentName === 'Grid') {
      const columns = props.columns || 3;

      return (
        <Component key={comp.id} {...props}>
          {Array.from({length: columns}).map((_, i) => (
            <div key={i} className="min-w-0">
              {children
                .filter(child => (child.slot || 0) === i)
                .map(child => renderComponent(child, allComponents))}
            </div>
          ))}
        </Component>
      );
    }

    return (
      <Component key={comp.id} {...props}>
        {children.map(child => renderComponent(child, allComponents))}
      </Component>
    );
  };

  const rootComponents = useMemo(() => {
    if (!page?.components) return [];
    return page.components
      .filter(c => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [page?.components]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-9xl font-black text-gray-100 dark:text-zinc-900 absolute -z-10 select-none">
          404
        </h1>
        <div className="text-center z-10">
          <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4">
            Discovery Failed
          </h2>
          <p className="text-gray-400 font-medium mb-8">
            The coordinate {location.pathname} does not exist in our index.
          </p>
          <a
            href="/"
            className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-xs font-black uppercase px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Return to Base
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="gustav-page min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {rootComponents.map(comp =>
          renderComponent(comp, page.components || [])
        )}
      </div>
    </div>
  );
}
