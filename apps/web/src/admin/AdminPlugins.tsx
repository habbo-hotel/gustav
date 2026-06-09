import {Link} from 'react-router-dom';
import {plugins as registeredPlugins} from 'virtual:gustav-plugins';
import {Button} from '../ui/Button';
import {Card, CardBody} from '../ui/Card';

export function AdminPlugins() {
  const getSettingsSchema = (name: string) => {
    const plugin = registeredPlugins.find(p => p.name === name);
    return plugin ? plugin.settingsSchema : undefined;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="layer-title text-2xl text-text dark:text-white">Plugins</h1>
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Overview of plugins installed via gustav.plugins.json</p>
      </div>
      {registeredPlugins.length === 0 ? (
        <Card><CardBody>
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-l1-bg dark:bg-dark-surface border border-dashed border-l5-border dark:border-dark-border rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
            </div>
            <p className="font-bold text-text-secondary dark:text-dark-text-secondary text-sm">No plugins installed</p>
            <p className="text-xs font-medium text-text-muted dark:text-dark-text-secondary mt-1">Add packages to gustav.plugins.json to get started</p>
          </div>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {registeredPlugins.map((plugin, idx) => {
            const accents = ['primary', 'coral', 'lavender', 'pink', 'mint', 'amber'] as const;
            const accent = accents[idx % accents.length];
            return (
              <Card key={plugin.name} accent={accent} hover>
                <CardBody>
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4 bg-layer-primary-light text-layer-primary border-layer-primary/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                  </div>
                  <h3 className="font-bold text-lg text-text dark:text-white mb-1 truncate">{plugin.name.replace('@gustav/', '')}</h3>
                  <p className="text-xs font-mono font-medium text-text-secondary dark:text-dark-text-secondary">{plugin.name}</p>
                  {getSettingsSchema(plugin.name) && (
                    <Link to={`/admin/plugins/${encodeURIComponent(plugin.name)}`} className="mt-5 block">
                      <Button size="sm" className="w-full">Configure Settings</Button>
                    </Link>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
