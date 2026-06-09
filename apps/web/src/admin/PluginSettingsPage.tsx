import toast from 'react-hot-toast';
import {plugins} from 'virtual:gustav-plugins';
import {useState, useEffect} from 'react';
import {ComponentSchemaField} from '@gustav/types';
import {useParams, Link} from 'react-router-dom';
import {pageSdk} from '../sdk';
import {Card, CardBody} from '../ui/Card';
import {Button} from '../ui/Button';
import {Input} from '../ui/Input';

export function PluginSettingsPage() {
  const {name} = useParams<{name: string}>();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (name) { document.title = `Gustav - ${name} Settings`; fetchSettings(name); } }, [name]);

  const fetchSettings = async (pluginName: string) => {
    try { setLoading(true); const data = await pageSdk.getPluginSettings(pluginName); setSettings(data); }
    catch (err) { console.error('Failed to fetch plugin settings', err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try { setIsSaving(true); await pageSdk.updatePluginSettings(name, settings); toast.success('Settings saved successfully'); }
    catch { toast.error('Failed to save settings'); }
    finally { setIsSaving(false); }
  };

  const renderField = (field: ComponentSchemaField) => {
    const value = settings[field.name];
    const onChange = (val: any) => setSettings({...settings, [field.name]: val});
    return (
      <div key={field.name}>
        {field.type === 'text' && <Input label={field.label} value={value || ''} onChange={e => onChange(e.target.value)} />}
        {field.type === 'color' && (
          <div className="space-y-1.5">
            <label className="block layer-label text-text-secondary dark:text-dark-text-secondary ml-1">{field.label}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-l5-border dark:border-dark-border bg-white dark:bg-dark-surface p-0.5" />
              <Input value={value || '#000000'} onChange={e => onChange(e.target.value)} className="flex-1 font-mono" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const getSettingsSchema = (pluginName: string) => { const plugin = plugins.find(p => p.name === pluginName); return plugin ? plugin.settingsSchema : undefined; };

  if (loading) return <div className="flex items-center gap-3 text-text-secondary font-bold text-sm p-8"><div className="w-5 h-5 border-2 border-layer-primary border-t-transparent rounded-full animate-spin" />Accessing plugin core...</div>;

  const schema = name ? getSettingsSchema(name) : undefined;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/plugins" className="w-9 h-9 flex items-center justify-center bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-lg text-text-secondary hover:text-layer-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="layer-title text-2xl text-text dark:text-white">{name} Settings</h1>
          <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Manage global configuration for {name}</p>
        </div>
      </div>
      <Card><CardBody>
        {!schema || schema.length === 0 ? (
          <div className="py-12 text-center"><p className="font-bold text-text-secondary dark:text-dark-text-secondary text-sm">This plugin does not have any configurable settings.</p></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-5 max-w-xl">{schema.map(renderField)}</div>
            <Button type="submit" loading={isSaving} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}>Save Configuration</Button>
          </form>
        )}
      </CardBody></Card>
    </div>
  );
}
