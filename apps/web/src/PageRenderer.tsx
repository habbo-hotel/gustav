import {useLocation} from 'react-router-dom';
import {plugins} from 'virtual:gustav-plugins';
import {PageWire, PageComponentWire} from '@gustav/types';
import React, {useState, useEffect, useMemo} from 'react';

import {pageSdk} from './sdk';

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
