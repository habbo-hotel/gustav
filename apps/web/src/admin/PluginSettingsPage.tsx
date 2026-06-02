import React, {useState, useEffect} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {corePlugin, ComponentSchemaField} from '@gustav/core-plugin';

import {pageSdk} from '../sdk';

export function PluginSettingsPage() {
  const {name} = useParams<{name: string}>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (name) fetchSettings(name);
  }, [name]);

  const fetchSettings = async (pluginName: string) => {
    try {
      setLoading(true);
      const data = await pageSdk.getPluginSettings(pluginName);
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch plugin settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      setIsSaving(true);
      await pageSdk.updatePluginSettings(name, settings);
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: ComponentSchemaField) => {
    const value = settings[field.name];
    const onChange = (val: any) =>
      setSettings({...settings, [field.name]: val});

    return (
      <div key={field.name} className="max-w-2xl">
        <label className="block text-xs font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">
          {field.label}
        </label>
        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white transition-all shadow-sm"
          />
        )}
        {field.type === 'color' && (
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => onChange(e.target.value)}
              className="w-16 h-16 rounded-2xl cursor-pointer p-1 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 shadow-sm"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={e => onChange(e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-mono dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        )}
      </div>
    );
  };

  const getSettingsSchema = (pluginName: string) => {
    if (pluginName === corePlugin.name) return corePlugin.settingsSchema;
    return undefined;
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse text-gray-400 font-black uppercase tracking-widest text-xs">
        Accessing plugin core...
      </div>
    );
  }

  const schema = name ? getSettingsSchema(name) : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/plugins"
            className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 text-gray-400 hover:text-indigo-500 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {name} <span className="text-gray-300 dark:text-zinc-700">/</span>{' '}
              Settings
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              Manage global configuration for {name}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-12 shadow-sm">
        {!schema || schema.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-bold uppercase text-xs">
              This plugin does not have any configurable settings.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-10">
            {schema.map(renderField)}
          </form>
        )}
      </div>
    </div>
  );
}
