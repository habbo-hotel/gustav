import {Link} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {plugins as registeredPlugins} from 'virtual:gustav-plugins';

import {pageSdk} from '../sdk';

export function AdminPlugins() {
  const [usedPlugins, setUsedPlugins] = useState<
    {name: string; usageCount: number}[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Gustav - Plugins';
    fetchUsedPlugins();
  }, []);

  const fetchUsedPlugins = async () => {
    try {
      setLoading(true);
      const data = await pageSdk.getUsedPlugins();
      setUsedPlugins(data);
    } catch (err) {
      console.error('Failed to fetch used plugins', err);
    } finally {
      setLoading(false);
    }
  };

  const getSettingsSchema = (name: string) => {
    const plugin = registeredPlugins.find(p => p.name === name);
    return plugin ? plugin.settingsSchema : undefined;
  };

  if (loading) {
    return (
      <div className="text-gray-500 animate-pulse font-bold uppercase tracking-widest text-sm p-8">
        Loading plugin ecosystem...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
          Installed Plugins
        </h2>
        <p className="text-sm text-gray-400 font-medium mt-1">
          Overview of plugins installed via gustav.plugins.json
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registeredPlugins.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-zinc-800">
              <p className="text-gray-400 font-bold uppercase text-xs">
                No plugins installed
              </p>
            </div>
          ) : (
            registeredPlugins.map(plugin => {
              const usageCount =
                usedPlugins.find(up => up.name === plugin.name)?.usageCount ||
                0;
              const isActive = usageCount > 0;
              return (
                <div
                  key={plugin.name}
                  className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                        />
                      </svg>
                    </div>
                    {isActive ? (
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-indigo-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-500/10 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-gray-500/20">
                        Installed
                      </span>
                    )}
                  </div>
                  <h3
                    className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1 truncate"
                    title={plugin.name}
                  >
                    {plugin.name.replace('@gustav/', '')}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-6 font-mono opacity-60">
                    {plugin.name}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Components Used
                    </span>
                    <span
                      className={`text-lg font-black ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}
                    >
                      {usageCount}
                    </span>
                  </div>
                  {getSettingsSchema(plugin.name) && (
                    <Link
                      to={`/admin/plugins/${encodeURIComponent(plugin.name)}`}
                      className="w-full mt-4 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg text-center block"
                    >
                      Configure Settings
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
