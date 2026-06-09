import React, {useState, useEffect, useCallback} from 'react';
import {plugins as registeredPlugins} from 'virtual:gustav-plugins';
import {ThemePageDefinition, PluginDefinition} from '@gustav/types';
import {ThemeSDK} from '@gustav/sdk';
import {Button} from '../ui/Button';
import {Card, CardBody} from '../ui/Card';

const API_URL =
  (window as any).__GUSTAV_API_URL__ || 'http://localhost:3000/api';
const themeSdk = new ThemeSDK(API_URL);

export function AdminThemes() {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showImportModal, setShowImportModal] = useState<string | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: string[];
    skipped: string[];
  } | null>(null);

  const themePlugins = registeredPlugins.filter(p => p.theme);

  const fetchActiveTheme = useCallback(async () => {
    try {
      const result = await themeSdk.getActiveTheme();
      setActiveTheme(result.activeTheme);
    } catch (err) {
      console.error('Failed to fetch active theme', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const handleActivate = async (pluginName: string) => {
    const plugin = themePlugins.find(p => p.name === pluginName);
    if (!plugin?.theme) return;

    if (plugin.theme.defaultPages && plugin.theme.defaultPages.length > 0) {
      setShowImportModal(pluginName);
      setSelectedPaths(plugin.theme.defaultPages.map(p => p.path));
      return;
    }

    await activateTheme(pluginName);
  };

  const activateTheme = async (pluginName: string) => {
    setActivating(true);
    try {
      await themeSdk.setActiveTheme(pluginName);
      setActiveTheme(pluginName);
    } catch (err) {
      console.error('Failed to activate theme', err);
    } finally {
      setActivating(false);
    }
  };

  const handleImportAndActivate = async () => {
    if (!showImportModal) return;
    const plugin = themePlugins.find(p => p.name === showImportModal);
    if (!plugin?.theme?.defaultPages) return;

    setImporting(true);
    try {
      const result = await themeSdk.importThemePages(
        showImportModal,
        plugin.theme.defaultPages,
        selectedPaths
      );
      setImportResult(result);
      await activateTheme(showImportModal);
    } catch (err) {
      console.error('Failed to import theme pages', err);
    } finally {
      setImporting(false);
    }
  };

  const handleActivateWithoutImport = async () => {
    if (!showImportModal) return;
    setShowImportModal(null);
    await activateTheme(showImportModal);
  };

  const handleDeactivate = async () => {
    setActivating(true);
    try {
      await themeSdk.setActiveTheme(null);
      setActiveTheme(null);
    } catch (err) {
      console.error('Failed to deactivate theme', err);
    } finally {
      setActivating(false);
    }
  };

  const togglePath = (path: string) => {
    setSelectedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-[3px] border-layer-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const importPlugin = themePlugins.find(p => p.name === showImportModal);
  const importPages = importPlugin?.theme?.defaultPages || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="layer-title text-2xl text-text dark:text-white">
            Themes
          </h1>
          <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">
            Choose an active theme to change the look and feel of your public
            site
          </p>
        </div>
        {activeTheme && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDeactivate}
            disabled={activating}
          >
            Deactivate Current Theme
          </Button>
        )}
      </div>

      {themePlugins.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-l1-bg dark:bg-dark-surface border border-dashed border-l5-border dark:border-dark-border rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <p className="font-bold text-text-secondary dark:text-dark-text-secondary text-sm">
                No theme plugins installed
              </p>
              <p className="text-xs font-medium text-text-muted dark:text-dark-text-secondary mt-1">
                Add a theme plugin to gustav.plugins.json to get started
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themePlugins.map(plugin => {
            const isActive = activeTheme === plugin.name;
            const theme = plugin.theme!;
            return (
              <Card
                key={plugin.name}
                accent={isActive ? 'mint' : 'none'}
                hover={!isActive}
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-text dark:text-white">
                        {theme.label || plugin.name.replace('@gustav/', '')}
                      </h3>
                      <p className="text-xs font-mono font-medium text-text-secondary dark:text-dark-text-secondary">
                        {plugin.name}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[0.625rem] font-black uppercase tracking-wider bg-success/10 text-success px-2 py-1 rounded-lg">
                        Active
                      </span>
                    )}
                  </div>

                  {theme.description && (
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
                      {theme.description}
                    </p>
                  )}

                  {theme.cssVariables && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {Object.entries(theme.cssVariables)
                        .filter(
                          ([k]) =>
                            k.includes('primary') ||
                            k.includes('Primary') ||
                            k.includes('accent') ||
                            k.includes('warm')
                        )
                        .slice(0, 5)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="w-6 h-6 rounded-lg border border-l5-border dark:border-dark-border"
                            style={{backgroundColor: v as string}}
                            title={k}
                          />
                        ))}
                    </div>
                  )}

                  {theme.previewComponent && (
                    <div className="mb-4 rounded-lg border border-l5-border dark:border-dark-border overflow-hidden bg-white dark:bg-dark-surface">
                      {React.createElement(theme.previewComponent)}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-secondary mb-4">
                    <span>{plugin.components.length} components</span>
                    {theme.defaultPages && theme.defaultPages.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span>
                          {theme.defaultPages.length} default page
                          {theme.defaultPages.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>

                  {!isActive && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleActivate(plugin.name)}
                      disabled={activating}
                    >
                      Activate Theme
                    </Button>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {showImportModal && importPlugin?.theme?.defaultPages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-2xl border-2 border-l5-border dark:border-dark-border shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <h2 className="layer-title text-xl text-text dark:text-white mb-2">
                Import Theme Pages
              </h2>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
                {importPlugin.theme.label || showImportModal} includes{' '}
                {importPages.length} default page
                {importPages.length !== 1 ? 's' : ''}. Select which pages to
                import as drafts.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {importPages.map(page => (
                  <label
                    key={page.path}
                    className="flex items-center gap-3 p-3 rounded-xl bg-l1-bg dark:bg-dark-surface cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPaths.includes(page.path)}
                      onChange={() => togglePath(page.path)}
                      className="w-4 h-4 rounded border-l5-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-text dark:text-white">
                        {page.title}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-dark-text-secondary font-mono">
                        {page.path}
                      </div>
                    </div>
                    <span className="text-[0.625rem] font-black uppercase tracking-wider text-text-muted dark:text-dark-text-secondary bg-l1-bg dark:bg-dark-surface px-2 py-0.5 rounded-lg">
                      {page.components.length} component
                      {page.components.length !== 1 ? 's' : ''}
                    </span>
                  </label>
                ))}
              </div>

              {importResult && (
                <div className="mb-4 p-3 rounded-xl bg-success-light dark:bg-dark-surface border border-success/20">
                  <p className="text-xs font-bold text-success">
                    Created: {importResult.created.length} page
                    {importResult.created.length !== 1 ? 's' : ''}
                  </p>
                  {importResult.skipped.length > 0 && (
                    <p className="text-xs text-text-secondary mt-1">
                      Skipped (already exist): {importResult.skipped.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleActivateWithoutImport}
                  disabled={importing}
                >
                  Activate Without Import
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportAndActivate}
                  disabled={importing || selectedPaths.length === 0}
                  loading={importing}
                >
                  Import & Activate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}