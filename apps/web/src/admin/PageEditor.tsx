import React, {useState, useEffect, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {PageWire, PageComponentWire, PageStatus} from '@gustav/types';
import {corePlugin} from '@gustav/core-plugin';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';

import {pageSdk} from '../sdk';

// --- Sortable Item Component ---
interface SortableComponentProps {
  id: number;
  component: PageComponentWire;
  onEdit: () => void;
  onRemove: () => void;
  onInlinePropChange: (name: string, value: any) => void;
}

const SortableComponent: React.FC<SortableComponentProps> = ({
  id,
  component,
  onEdit,
  onRemove,
  onInlinePropChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const pluginComponent = corePlugin.components.find(
    c => c.name === component.componentName
  );
  
  const Comp = pluginComponent?.component || (() => <div className="p-4 bg-red-100 text-red-600">Component Not Found: {component.componentName}</div>);
  const props = JSON.parse(component.props || '{}');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-xl mb-4 transition-all ${
        isDragging ? 'border-indigo-500 bg-indigo-50 shadow-xl opacity-50 scale-105' : 'border-transparent hover:border-indigo-300'
      }`}
    >
      {/* Overlay controls */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div 
          {...attributes} 
          {...listeners}
          className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-50 text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8m-8 4h8" />
          </svg>
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl">
        <Comp {...props} editable={true} onPropChange={onInlinePropChange} />
      </div>
    </div>
  );
};

// --- Drawer Component ---
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, side = 'right' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} max-w-md w-full flex`}>
        <div className="w-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l dark:border-zinc-800 animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-black dark:text-white tracking-tight uppercase">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Editor Component ---
export function PageEditor() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageWire | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Drawer States
  const [activeDrawer, setActiveDrawer] = useState<'settings' | 'plugins' | 'properties' | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form States
  const [pageSettings, setPageSettings] = useState<Partial<PageWire>>({});
  const [componentProps, setComponentProps] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) fetchPage(parseInt(id));
  }, [id]);

  const fetchPage = async (pageId: number) => {
    try {
      setLoading(true);
      const data = await pageSdk.findOne(pageId);
      setPage(data);
      setPageSettings({
        title: data.title,
        slug: data.slug,
        parentId: data.parentId,
        status: data.status,
      });
    } catch {
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id && page?.components) {
      const oldIndex = page.components.findIndex(c => c.id === active.id);
      const newIndex = page.components.findIndex(c => c.id === over.id);

      const newComponents = arrayMove(page.components, oldIndex, newIndex);
      setPage({...page, components: newComponents});

      try {
        await pageSdk.reorderComponents(page.id, newComponents.map(c => c.id));
        setIsDirty(true);
        if (page.status === PageStatus.PUBLISHED) {
          await pageSdk.update(page.id, {status: PageStatus.DRAFT});
          setPage(prev => prev ? {...prev, status: PageStatus.DRAFT} : null);
        }
      } catch (err) {
        alert('Failed to save order');
        fetchPage(page.id);
      }
    }
  };

  const handleAddComponent = async (componentName: string) => {
    if (!page) return;
    const pluginComp = corePlugin.components.find(c => c.name === componentName);
    if (!pluginComp) return;

    try {
      await pageSdk.addComponent(page.id, {
        pluginName: corePlugin.name,
        componentName,
        props: JSON.stringify(pluginComp.defaultProps),
        displayOrder: page.components?.length || 0,
      });
      setIsDirty(true);
      if (page.status === PageStatus.PUBLISHED) {
        await pageSdk.update(page.id, {status: PageStatus.DRAFT});
      }
      setActiveDrawer(null);
      fetchPage(page.id);
    } catch (err) {
      alert('Failed to add component');
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    try {
      await pageSdk.update(page.id, pageSettings);
      setActiveDrawer(null);
      fetchPage(page.id);
    } catch (err) {
      alert('Failed to update page');
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    try {
      await pageSdk.update(page.id, {status: PageStatus.PUBLISHED});
      setIsDirty(false);
      fetchPage(page.id);
    } catch (err) {
      alert('Failed to publish page');
    }
  };

  const handleOpenProperties = (compId: number) => {
    const comp = page?.components?.find(c => c.id === compId);
    if (comp) {
      setSelectedComponentId(compId);
      setComponentProps(comp.props);
      setActiveDrawer('properties');
    }
  };

  const handleUpdateComponentProps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComponentId) return;
    try {
      // Validate JSON
      const propsToSave = typeof componentProps === 'string' ? componentProps : JSON.stringify(componentProps);
      JSON.parse(propsToSave);
      await pageSdk.updateComponent(selectedComponentId, {props: propsToSave});
      setIsDirty(true);
      if (page && page.status === PageStatus.PUBLISHED) {
        await pageSdk.update(page.id, {status: PageStatus.DRAFT});
      }
      setActiveDrawer(null);
      if (page) fetchPage(page.id);
    } catch (err) {
      alert(err instanceof Error ? 'Invalid Data: ' + err.message : 'Failed to update component');
    }
  };

  const handlePropChange = (name: string, value: any) => {
    try {
      const currentProps = typeof componentProps === 'string' ? JSON.parse(componentProps) : componentProps;
      const newProps = {...currentProps, [name]: value};
      setComponentProps(JSON.stringify(newProps, null, 2));
    } catch {
      // If parsing fails, user is likely in JSON mode, don't update
    }
  };

  const renderPropertyField = (field: any) => {
    let currentProps = {};
    try {
      currentProps = JSON.parse(componentProps);
    } catch {
      return null;
    }

    const value = (currentProps as any)[field.name];

    return (
      <div key={field.name} className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
          {field.label}
        </label>
        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            value={value || ''}
            rows={4}
            onChange={(e) => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'select' && (
          <select
            value={value || ''}
            onChange={(e) => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
          >
            {field.options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-3 py-1">
            <input
              type="checkbox"
              id={`field-${field.name}`}
              checked={!!value}
              onChange={(e) => handlePropChange(field.name, e.target.checked)}
              className="w-5 h-5 rounded-lg border-gray-200 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
            <label htmlFor={`field-${field.name}`} className="text-sm font-bold text-gray-600 dark:text-zinc-400 cursor-pointer">
              Enable
            </label>
          </div>
        )}
      </div>
    );
  };

  const handleRemoveComponent = async (compId: number) => {
    if (!confirm('Remove this component?')) return;
    try {
      await pageSdk.removeComponent(compId);
      setIsDirty(true);
      if (page && page.status === PageStatus.PUBLISHED) {
        await pageSdk.update(page.id, {status: PageStatus.DRAFT});
      }
      if (page) fetchPage(page.id);
    } catch (err) {
      alert('Failed to remove component');
    }
  };

  const handleInlinePropChange = async (compId: number, name: string, value: any) => {
    if (!page) return;
    const comp = page.components?.find(c => c.id === compId);
    if (!comp) return;

    try {
      const currentProps = JSON.parse(comp.props);
      const newProps = {...currentProps, [name]: value};
      await pageSdk.updateComponent(compId, {props: JSON.stringify(newProps)});
      setIsDirty(true);
      if (page.status === PageStatus.PUBLISHED) {
        await pageSdk.update(page.id, {status: PageStatus.DRAFT});
      }
      fetchPage(page.id);
    } catch (err) {
      console.error('Failed to update inline prop', err);
    }
  };

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !page?.components) return null;
    return page.components.find(c => c.id === selectedComponentId);
  }, [selectedComponentId, page?.components]);

  const pluginSchema = useMemo(() => {
    if (!selectedComponent) return null;
    return corePlugin.components.find(c => c.name === selectedComponent.componentName)?.schema;
  }, [selectedComponent]);

  if (loading || !page) return <div className="p-8 animate-pulse text-gray-400 font-bold uppercase tracking-widest text-sm">Initializing visual builder...</div>;

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col">
      {/* Page Toolbar */}
      <div className="flex items-center justify-between mb-8 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/pages')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div 
            className="cursor-pointer group"
            onClick={() => setActiveDrawer('settings')}
          >
            <h1 className="text-xl font-black dark:text-white tracking-tight uppercase group-hover:text-indigo-500 transition-colors flex items-center">
              {page.title}
              {page.status === PageStatus.DRAFT && (
                <div className="ml-3 flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-500/20">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse" />
                  Draft
                </div>
              )}
              <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </h1>
            <p className="text-xs font-mono text-gray-400">{page.path}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={page.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-black uppercase px-6 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all mr-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Page</span>
          </a>

          {page.status === PageStatus.DRAFT && (
            <button
              onClick={handlePublish}
              className="flex items-center space-x-2 bg-emerald-500 text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Publish Changes</span>
            </button>
          )}
          
          <button
            onClick={() => setActiveDrawer('plugins')}
            className="flex items-center space-x-2 bg-indigo-500 text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Plugin</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-50/50 dark:bg-zinc-950 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 p-8 min-h-[500px]">
        {(!page.components || page.components.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-gray-300 dark:text-zinc-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Empty Canvas</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 font-medium">Your page has no components yet. Add some from the plugins library to start building.</p>
            <button
              onClick={() => setActiveDrawer('plugins')}
              className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-xs font-black uppercase px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Open Plugins Library
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={page.components.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {page.components.map((component) => (
                <SortableComponent
                  key={component.id}
                  id={component.id}
                  component={component}
                  onEdit={() => handleOpenProperties(component.id)}
                  onRemove={() => handleRemoveComponent(component.id)}
                  onInlinePropChange={(name, value) => handleInlinePropChange(component.id, name, value)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Settings Drawer */}
      <Drawer
        isOpen={activeDrawer === 'settings'}
        onClose={() => setActiveDrawer(null)}
        title="Page Settings"
      >
        <form onSubmit={handleUpdatePage} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Title</label>
            <input
              type="text"
              required
              value={pageSettings.title || ''}
              onChange={e => setPageSettings({...pageSettings, title: e.target.value})}
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Slug</label>
            <input
              type="text"
              required
              value={pageSettings.slug || ''}
              onChange={e => setPageSettings({...pageSettings, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPageSettings({...pageSettings, status: PageStatus.DRAFT})}
                className={`py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                  pageSettings.status === PageStatus.DRAFT
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-600'
                    : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-400'
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setPageSettings({...pageSettings, status: PageStatus.PUBLISHED})}
                className={`py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                  pageSettings.status === PageStatus.PUBLISHED
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600'
                    : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-400'
                }`}
              >
                Published
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Save Page Metadata
          </button>
        </form>
      </Drawer>

      {/* Plugins Drawer */}
      <Drawer
        isOpen={activeDrawer === 'plugins'}
        onClose={() => setActiveDrawer(null)}
        title="Plugin Library"
      >
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-4 ml-1">Available Components</p>
          <div className="grid grid-cols-1 gap-3">
            {corePlugin.components.map(comp => (
              <button
                key={comp.name}
                onClick={() => handleAddComponent(comp.name)}
                className="flex items-start p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-500 shadow-sm border border-gray-100 dark:border-zinc-800 mr-4 shrink-0 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-tight">{comp.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{comp.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Drawer>

      {/* Properties Drawer */}
      <Drawer
        isOpen={activeDrawer === 'properties'}
        onClose={() => setActiveDrawer(null)}
        title={`${selectedComponent?.componentName} Properties`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration</p>
          <button 
            onClick={() => {
              const el = document.getElementById('json-editor-toggle');
              if (el) el.click();
            }}
            className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
          >
            Toggle Advanced Mode
          </button>
        </div>

        <form onSubmit={handleUpdateComponentProps} className="space-y-6">
          <div id="property-fields">
            {pluginSchema?.map(field => renderPropertyField(field))}
          </div>

          <details className="group border-t border-gray-100 dark:border-zinc-800 pt-6">
            <summary id="json-editor-toggle" className="list-none cursor-pointer flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-500 transition-colors">
              <span>Advanced JSON Editor</span>
              <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4">
              <textarea
                rows={10}
                value={componentProps}
                onChange={e => setComponentProps(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
              />
            </div>
          </details>
          
          <button
            type="submit"
            className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Apply Changes
          </button>
        </form>
      </Drawer>
    </div>
  );
}
