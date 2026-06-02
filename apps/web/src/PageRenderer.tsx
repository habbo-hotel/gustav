import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {PageWire} from '@gustav/types';
import {corePlugin} from '@gustav/core-plugin';

import {pageSdk} from './sdk';

export function PageRenderer() {
  const location = useLocation();
  const [page, setPage] = useState<PageWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPageByPath(location.pathname);
  }, [location.pathname]);

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
        <h1 className="text-9xl font-black text-gray-100 dark:text-zinc-900 absolute -z-10 select-none">404</h1>
        <div className="text-center z-10">
          <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4">Discovery Failed</h2>
          <p className="text-gray-400 font-medium mb-8">The coordinate {location.pathname} does not exist in our index.</p>
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
        {page.components?.map((comp) => {
          // Resolve component from plugins
          const pluginComp = corePlugin.components.find(
            c => c.name === comp.componentName
          );

          if (!pluginComp) {
            return (
              <div key={comp.id} className="p-4 bg-red-50 text-red-500 rounded-xl my-4 text-xs font-mono">
                [Plugin Error] Component "{comp.componentName}" not found in registry.
              </div>
            );
          }

          const Component = pluginComp.component;
          const props = JSON.parse(comp.props || '{}');

          return <Component key={comp.id} {...props} />;
        })}
      </div>
    </div>
  );
}
