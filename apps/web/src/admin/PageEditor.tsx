import {CSS} from '@dnd-kit/utilities';
import {plugins} from 'virtual:gustav-plugins';
import {useParams, useNavigate, Link} from 'react-router-dom';
import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {PageWire, PageComponentWire, PageStatus} from '@gustav/types';
import toast from 'react-hot-toast';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  useDndContext,
} from '@dnd-kit/core';

import {pageSdk} from '../sdk';

// --- Block Icons Mapping ---
const BlockIcon = ({name, className = 'w-5 h-5'}: {name?: string; className?: string}) => {
  const icons: Record<string, React.ReactNode> = {
    heading: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
    ),
    text: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    hero: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    ),
    divider: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
    ),
    button: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H6a2 2 0 00-2 2v10a2 2 0 012 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8" />
    ),
    image: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    grid: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    ),
    card: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ),
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name || ''] || (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      )}
    </svg>
  );
};

// --- Component ID Helper ---
const getComponentDisplayId = (compId: number, allComponents: PageComponentWire[]) => {
  if (!allComponents) return '';
  const comp = allComponents.find(c => c.id === compId);
  if (!comp) return '';

  const sameType = allComponents
    .filter(c => c.componentName === comp.componentName)
    .sort((a, b) => a.id - b.id);

  const index = sameType.findIndex(c => c.id === compId) + 1;
  return `${comp.componentName.toLowerCase()}-${index}`;
};

// --- Draggable Library Item ---
interface DraggableLibraryComponentProps {
  component: any;
}

const DraggableLibraryComponent: React.FC<DraggableLibraryComponentProps> = ({
  component,
}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: `library-${component.name}`,
      data: {
        type: 'library',
        componentName: component.name,
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 ring-2 ring-indigo-500/50' : ''
      }`}
    >
      <div className="w-8 h-8 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
        <BlockIcon name={component.icon} className="w-4 h-4" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white uppercase text-[10px] tracking-widest truncate">
        {component.name}
      </h4>
    </div>
  );
};

// --- Sortable Item Component ---
interface SortableComponentProps {
  id: number;
  component: PageComponentWire;
  allComponents: PageComponentWire[];
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
  onInlinePropChange: (name: string, value: any) => void;
  isPreview?: boolean;
}

const SortableComponent: React.FC<SortableComponentProps> = ({
  id,
  component,
  allComponents,
  onEdit,
  onRemove,
  onInlinePropChange,
  isPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id, disabled: isPreview});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : isHovered ? 40 : 'auto',
  };

  const plugin = plugins.find(p => p.name === component.pluginName);
  const pluginComponent = plugin?.components.find(
    (c: any) => c.name === component.componentName
  );

  const Comp =
    pluginComponent?.component ||
    (() => (
      <div className="p-4 bg-red-100 text-red-600">
        Component Not Found: {component.componentName}
      </div>
    ));
  const props = useMemo(() => JSON.parse(component.props || '{}'), [component.props]);

  const children = allComponents
    .filter(c => c.parentId === component.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isPreview) return;
        e.stopPropagation();
        onEdit(component.id);
      }}
      className={`relative transition-all ${
        isPreview ? '' : 'border-2 rounded-xl mb-4'
      } ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50 shadow-xl opacity-50 scale-[1.02]'
          : isPreview
            ? 'border-transparent'
            : isHovered
              ? 'border-indigo-300 ring-4 ring-indigo-500/5'
              : 'border-transparent'
      }`}
    >
      {/* Name Tag Handle (Top Left Corner) */}
      {!isPreview && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute -top-3 left-3 px-3 py-1 bg-indigo-500 text-white rounded-full flex items-center space-x-2 shadow-lg transition-opacity z-50 cursor-grab active:cursor-grabbing ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <BlockIcon name={pluginComponent?.icon} className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">{getComponentDisplayId(component.id, allComponents)}</span>
        </div>
      )}

      {/* Overlay controls (Top Right Corner) */}
      {!isPreview && (
        <div 
          className={`absolute top-2 right-2 flex items-center space-x-1 transition-opacity z-50 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(component.id);
            }}
            className="p-2 bg-white shadow-sm border border-gray-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-gray-400 transition-colors"
            title="Delete Component"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`transition-all ${isPreview ? '' : 'p-4 bg-white dark:bg-zinc-900 rounded-xl'}`}
      >
        <Comp
          {...props}
          editable={!isPreview}
          onPropChange={(name: string, value: any) => onInlinePropChange(name, value)}
        >
          {children.length > 0 ? (
            <SortableContext
              items={children.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {children.map(child => (
                <SortableComponent
                  key={child.id}
                  id={child.id}
                  component={child}
                  allComponents={allComponents}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  onInlinePropChange={(name, value) => onInlinePropChange(name, value)}
                  isPreview={isPreview}
                />
              ))}
            </SortableContext>
          ) : (
            pluginComponent?.canHaveChildren && !isPreview && (
              <div className="p-8 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-gray-300 dark:text-zinc-600">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Empty Container<br/>Drag items here</p>
              </div>
            )
          )}
        </Comp>
      </div>
    </div>
  );
};

// --- Droppable Empty State ---
const EmptyCanvasPlaceholder: React.FC = () => {
  const {setNodeRef, isOver} = useDroppable({
    id: 'empty-canvas',
    data: {
      type: 'canvas-root',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full flex flex-col items-center justify-center text-center py-20 rounded-3xl transition-all ${
        isOver ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-2 border-indigo-500 scale-[0.98]' : ''
      }`}
    >
      <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-gray-300 dark:text-zinc-600 mb-6">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
        Empty Canvas
      </h2>
      <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
        Your page has no components yet. Select a component from the
        library on the right to start building.
      </p>
    </div>
  );
};

const CanvasContainer: React.FC<{children: React.ReactNode; isPreview: boolean}> = ({children, isPreview}) => {
  const {setNodeRef, isOver} = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'canvas-root',
    },
    disabled: isPreview,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 gustav-canvas transition-all ${isPreview ? 'p-0 border-none' : 'bg-gray-50/50 dark:bg-zinc-950 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 p-8 min-h-[500px]'} ${
        !isPreview && isOver ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500' : ''
      }`}
    >
      {children}
    </div>
  );
};

// --- Drag Preview Helper ---
const DragPreviewContent = ({activeId, activeType, page, plugins}: any) => {
  const {over} = useDndContext();
  
  const canvasEl = document.querySelector('.gustav-canvas');
  let baseWidth: number | string = 'auto';
  
  if (canvasEl) {
    const style = window.getComputedStyle(canvasEl);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    baseWidth = canvasEl.getBoundingClientRect().width - padding;
  }

  // Use the 'over' element's width if available, otherwise the canvas content width
  const targetWidth = over ? over.rect.width : baseWidth;

  let Comp: any = null;
  let props: any = {};

  if (activeType === 'canvas') {
    const comp = page.components.find((c: any) => c.id === activeId);
    if (!comp) return null;
    const plugin = plugins.find((p: any) => p.name === comp.pluginName);
    const pluginComp = plugin?.components.find((c: any) => c.name === comp.componentName);
    Comp = pluginComp?.component || (() => null);
    props = JSON.parse(comp.props || '{}');
  } else if (activeType === 'library') {
    const name = (activeId as string).replace('library-', '');
    const plugin = plugins.find((p: any) => p.components.some((c: any) => c.name === name));
    const pluginComp = plugin?.components.find((c: any) => c.name === name);
    if (!pluginComp) return null;
    Comp = pluginComp.component;
    props = pluginComp.defaultProps || {};
  }

  if (!Comp) return null;

  return (
    <div 
      style={{ width: targetWidth }}
      className="pointer-events-none opacity-50 ring-2 ring-indigo-500 rounded-xl bg-white dark:bg-zinc-900 transition-[width] duration-200 ease-out"
    >
      <div className="p-4 rounded-xl">
        <Comp {...props} isPreview={true} />
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

  // Drag States
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [activeType, setActiveType] = useState<'library' | 'canvas' | null>(
    null
  );

  // UI States
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Form States
  const [pageSettings, setPageSettings] = useState<Partial<PageWire>>({});
  const [componentProps, setComponentProps] = useState<string>('');
  const saveTimeoutRef = React.useRef<any>(null);
  const toolsSidebarRef = useRef<HTMLElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) fetchPage(parseInt(id));
  }, [id]);

  const [pages, setPages] = useState<PageWire[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const data = await pageSdk.findAll();
      setPages(data);
    } catch {
      // Ignored
    }
  }, []);

  const fetchPage = useCallback(async (pageId: number, isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await pageSdk.findOne(pageId);
      setPage(data);
      setPageSettings({
        title: data.title,
        slug: data.slug,
        parentId: data.parentId,
        status: data.status,
        showInNavigation: data.showInNavigation ?? true,
      });
    } catch {
      if (!isSilent) navigate('/admin/pages');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (page) {
      document.title = `Gustav - Editing ${page.title}`;
    }
  }, [page]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log('Drag Start:', event.active.id);
    setActiveId(event.active.id);
    setActiveType(event.active.data.current?.type || 'canvas');
  }, []);

  const handleAddComponent = useCallback(async (
    componentName: string,
    atIndex?: number,
    parentId?: number
  ) => {
    if (!page) return;
    const plugin = plugins.find(p => p.components.some((c: any) => c.name === componentName));
    if (!plugin) return;
    const pluginComp = plugin.components.find(
      (c: any) => c.name === componentName
    );
    if (!pluginComp) return;

    try {
      await pageSdk.addComponent(page.id, {
        pluginName: plugin.name,
        componentName,
        props: JSON.stringify(pluginComp.defaultProps),
        parentId,
        displayOrder:
          atIndex !== undefined ? atIndex : page.components?.filter(c => c.parentId === parentId).length || 0,
      });

      setIsDirty(true);
      setSelectedComponentId(null);
      toast.success(`Added ${componentName}`);
      fetchPage(page.id, true);
    } catch (err) {
      toast.error('Failed to add component');
    }
  }, [page, fetchPage]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const {active, over} = event;
    const type = active.data.current?.type || activeType;
    console.log('Drag End:', active.id, 'over', over?.id, 'type', type);
    
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (active.id !== over.id) {
      if (type === 'library') {
        const componentName = active.data.current?.componentName;
        const overId = over.id;

        if (overId === 'empty-canvas' || overId === 'canvas-root') {
          await handleAddComponent(componentName, undefined, undefined);
          return;
        }

        const overComp = page?.components?.find(c => c.id === overId);
        if (overComp) {
          const plugin = plugins.find(p => p.name === overComp.pluginName);
          const pluginComp = plugin?.components.find(
            (c: any) => c.name === overComp.componentName
          );
          
          if (pluginComp?.canHaveChildren) {
            await handleAddComponent(componentName, undefined, overComp.id);
          } else {
            const siblings = page?.components?.filter(c => c.parentId === overComp.parentId) || [];
            const overIndex = siblings.findIndex(c => c.id === overId);
            await handleAddComponent(componentName, overIndex, overComp.parentId);
          }
        }
      } else if (page?.components) {
        const activeComp = page.components.find(c => c.id === active.id);
        const overComp = page.components.find(c => c.id === over.id);
        
        if (!activeComp) return;

        if (over.id === 'canvas-root' || over.id === 'empty-canvas') {
           if (activeComp.parentId !== undefined) {
              await pageSdk.updateComponent(activeComp.id, { parentId: undefined as any });
              toast.success('Moved to root');
              fetchPage(page.id, true);
           }
           return;
        }

        if (!overComp) return;

        if (activeComp.parentId === overComp.parentId) {
          const siblings = page.components
            .filter(c => c.parentId === activeComp.parentId)
            .sort((a, b) => a.displayOrder - b.displayOrder);

          const oldIndex = siblings.findIndex(c => c.id === active.id);
          const newIndex = siblings.findIndex(c => c.id === over.id);

          const newOrderedSiblings = arrayMove(siblings, oldIndex, newIndex);

          try {
            await pageSdk.reorderComponents(
              page.id,
              newOrderedSiblings.map(c => c.id)
            );
            setIsDirty(true);
            toast.success('Order saved');
            fetchPage(page.id, true);
          } catch (err) {
            toast.error('Failed to save order');
            fetchPage(page.id, true);
          }
        } 
        else {
           const overPlugin = plugins.find(p => p.name === overComp.pluginName);
           const overPluginComp = overPlugin?.components.find((c: any) => c.name === overComp.componentName);
           
           if (overPluginComp?.canHaveChildren) {
              await pageSdk.updateComponent(activeComp.id, { parentId: overComp.id });
              toast.success(`Moved into ${overComp.componentName}`);
              fetchPage(page.id, true);
           } else {
              await pageSdk.updateComponent(activeComp.id, { parentId: overComp.parentId });
              toast.success(`Moved near ${overComp.componentName}`);
              fetchPage(page.id, true);
           }
        }
      }
    }
  }, [activeType, page, fetchPage, handleAddComponent]);

  const handleUpdatePage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    try {
      await pageSdk.update(page.id, pageSettings);
      setShowSettings(false);
      toast.success('Page metadata updated');
      fetchPage(page.id, true);
    } catch (err) {
      toast.error('Failed to update page');
    }
  }, [page, pageSettings, fetchPage]);

  const handlePublish = useCallback(async () => {
    if (!page) return;
    try {
      await pageSdk.update(page.id, {status: PageStatus.PUBLISHED});
      setIsDirty(false);
      toast.success('Page published successfully');
      fetchPage(page.id, true);
    } catch (err) {
      toast.error('Failed to publish page');
    }
  }, [page, fetchPage]);

  const handleOpenProperties = useCallback((compId: number) => {
    const comp = page?.components?.find(c => c.id === compId);
    if (comp) {
      setSelectedComponentId(compId);
      setComponentProps(comp.props);
    }
  }, [page?.components]);

  const handlePropChange = useCallback((name: string, value: any) => {
    try {
      const currentProps =
        typeof componentProps === 'string'
          ? JSON.parse(componentProps)
          : componentProps;
      const newProps = {...currentProps, [name]: value};
      const serializedProps = JSON.stringify(newProps, null, 2);
      
      setComponentProps(serializedProps);
      
      if (selectedComponentId && page) {
        const updatedComponents = page.components?.map(c => 
          c.id === selectedComponentId ? { ...c, props: serializedProps } : c
        );
        setPage({ ...page, components: updatedComponents });
      }

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        if (selectedComponentId) {
          try {
            await pageSdk.updateComponent(selectedComponentId, { props: serializedProps });
            setIsDirty(true);
          } catch (err) {
            console.error('Auto-save failed', err);
          }
        }
      }, 500);
    } catch {
    }
  }, [componentProps, selectedComponentId, page]);

  const handleJsonChange = useCallback((value: string) => {
    setComponentProps(value);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        JSON.parse(value);
        if (selectedComponentId) {
          await pageSdk.updateComponent(selectedComponentId, { props: value });
          setIsDirty(true);
          if (page) {
            const updatedComponents = page.components?.map(c => 
              c.id === selectedComponentId ? { ...c, props: value } : c
            );
            setPage({ ...page, components: updatedComponents });
          }
        }
      } catch {
      }
    }, 500);
  }, [selectedComponentId, page]);

  const handleRemoveComponent = useCallback(async (compId: number) => {
    try {
      await pageSdk.removeComponent(compId);
      toast.success('Component removed');
      setIsDirty(true);
      if (selectedComponentId === compId) setSelectedComponentId(null);
      if (page) fetchPage(page.id, true);
    } catch (err) {
      toast.error('Failed to remove component');
    }
  }, [selectedComponentId, page, fetchPage]);

  const handleInlinePropChange = useCallback(async (
    compId: number,
    name: string,
    value: any
  ) => {
    if (!page) return;
    const comp = page.components?.find(c => c.id === compId);
    if (!comp) return;

    try {
      const currentProps = JSON.parse(comp.props);
      const newProps = {...currentProps, [name]: value};
      await pageSdk.updateComponent(compId, {props: JSON.stringify(newProps)});
      setIsDirty(true);
      fetchPage(page.id, true);
    } catch (err) {
      console.error('Failed to update inline prop', err);
    }
  }, [page, fetchPage]);

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !page?.components) return null;
    return page.components.find(c => c.id === selectedComponentId);
  }, [selectedComponentId, page?.components]);

  const rootComponents = useMemo(() => {
    return page?.components
      ?.filter(c => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];
  }, [page?.components]);

  const rootComponentIds = useMemo(() => {
    return rootComponents.map(c => c.id);
  }, [rootComponents]);

  const pluginSchema = useMemo(() => {
    if (!selectedComponent) return null;
    const plugin = plugins.find(p => p.name === selectedComponent.pluginName);
    return plugin?.components.find(
      (c: any) => c.name === selectedComponent.componentName
    )?.schema;
  }, [selectedComponent]);

  const handleDeselect = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking exactly the background canvas areas, 
    // but not if clicking tools sidebar or components.
    if (toolsSidebarRef.current?.contains(e.target as Node)) return;
    setSelectedComponentId(null);
  }, []);

  const renderPropertyField = (field: any) => {
    let currentProps = {};
    try {
      currentProps = JSON.parse(componentProps);
    } catch {
      return null;
    }

    const value = (currentProps as any)[field.name];

    return (
      <div key={field.name} className="mb-6">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
          {field.label}
        </label>
        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            value={value || ''}
            rows={4}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'select' && (
          <select
            value={value || ''}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
          >
            {field.options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {field.type === 'number' && (
          <input
            type="number"
            value={value || 0}
            onChange={e =>
              handlePropChange(field.name, parseFloat(e.target.value))
            }
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'color' && (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => handlePropChange(field.name, e.target.value)}
              className="w-12 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer p-1"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={e => handlePropChange(field.name, e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
            />
          </div>
        )}
        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-3 py-1">
            <input
              type="checkbox"
              id={`field-${field.name}`}
              checked={!!value}
              onChange={e => handlePropChange(field.name, e.target.checked)}
              className="w-5 h-5 rounded-lg border-gray-200 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
            <label
              htmlFor={`field-${field.name}`}
              className="text-sm font-bold text-gray-600 dark:text-zinc-400 cursor-pointer"
            >
              Enable
            </label>
          </div>
        )}
      </div>
    );
  };

  if (loading || !page)
    return (
      <div className="p-8 animate-pulse text-gray-400 font-bold uppercase tracking-widest text-sm">
        Initializing visual builder...
      </div>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        onClick={handleDeselect}
        className="flex h-[calc(100vh-10rem)] bg-gray-50 dark:bg-zinc-950 -mx-6 -my-8 overflow-hidden"
      >
        {/* Column 1: Page Sidebar */}
        <aside 
          className="w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col shadow-sm"
        >
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Structure</h2>
             <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
                {pages.map(p => (
                  <Link
                    key={p.id}
                    to={`/admin/pages/${p.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center space-x-3 p-2 rounded-xl transition-all ${p.id === page.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${p.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold truncate">{p.title}</span>
                  </Link>
                ))}
             </div>
          </div>
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
             <Link to="/admin/pages" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center">
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Pages
             </Link>
          </div>
        </aside>

        {/* Column 2: Main Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Canvas Toolbar */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-10"
          >
             <div className="flex items-center space-x-4">
                <h1 className="text-sm font-black uppercase tracking-tighter text-gray-900 dark:text-white truncate max-w-[200px]">
                   {page.title}
                </h1>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                </button>
             </div>
             <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsPreview(!isPreview); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isPreview ? 'bg-indigo-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}
                >
                   {isPreview ? 'Editor' : 'Preview'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePublish(); }}
                  disabled={!isDirty && page.status === PageStatus.PUBLISHED}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg transition-all disabled:opacity-50 disabled:bg-gray-400"
                >
                   Publish
                </button>
             </div>
          </div>

          {/* Actual Canvas */}
          <div className="flex-1 overflow-y-auto p-12">
            <CanvasContainer isPreview={isPreview}>
              {rootComponents.length === 0 ? (
                <EmptyCanvasPlaceholder />
              ) : (
                <SortableContext
                  items={rootComponentIds}
                  strategy={verticalListSortingStrategy}
                >
                  {rootComponents.map(component => (
                    <SortableComponent
                      key={component.id}
                      id={component.id}
                      component={component}
                      allComponents={page.components || []}
                      onEdit={handleOpenProperties}
                      onRemove={handleRemoveComponent}
                      onInlinePropChange={(name, value) => handleInlinePropChange(component.id, name, value)}
                      isPreview={isPreview}
                    />
                  ))}
                </SortableContext>
              )}
            </CanvasContainer>
          </div>
        </section>

        {/* Column 3: Tools Sidebar (Library or Properties) */}
        <aside 
          ref={toolsSidebarRef}
          onClick={(e) => e.stopPropagation()}
          className="w-80 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col shadow-sm"
        >
          {selectedComponentId ? (
            /* Property Editor View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">{getComponentDisplayId(selectedComponentId, page.components || [])}</h2>
                </div>
                <button 
                  onClick={() => setSelectedComponentId(null)}
                  className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                  <div id="property-fields">
                    {pluginSchema?.map(field => renderPropertyField(field))}
                  </div>

                  <details className="group border-t border-gray-100 dark:border-zinc-800 pt-6 mt-6">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors">
                      <span>Advanced JSON</span>
                      <svg className="w-3 h-3 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4">
                      <textarea
                        rows={8}
                        value={componentProps}
                        onChange={e => handleJsonChange(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-[10px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
                      />
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => setSelectedComponentId(null)}
                    className="w-full mt-8 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Close
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Component Library View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">Library</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Available Blocks</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {plugins.flatMap((p: any) => p.components).map((comp: any) => (
                  <DraggableLibraryComponent key={comp.name} component={comp} />
                ))}
              </div>
            </div>
          )}
        </aside>

        <DragOverlay adjustScale={false} style={{cursor: 'grabbing'}}>
          {activeId && (
            <DragPreviewContent
              activeId={activeId}
              activeType={activeType}
              page={page}
              plugins={plugins}
            />
          )}
        </DragOverlay>
      </div>

      {/* Settings Modal (Less frequent, keeping as overlay) */}
      {showSettings && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black dark:text-white tracking-tight uppercase">Page Settings</h3>
               <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
            <form onSubmit={handleUpdatePage} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Title</label>
                <input
                  type="text"
                  required
                  value={pageSettings.title || ''}
                  onChange={e => setPageSettings({...pageSettings, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Slug</label>
                <input
                  type="text"
                  required
                  value={pageSettings.slug || ''}
                  onChange={e => setPageSettings({...pageSettings, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
                />
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="showInNavigation"
                  checked={pageSettings.showInNavigation}
                  onChange={e => setPageSettings({...pageSettings, showInNavigation: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="showInNavigation" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer uppercase tracking-tight">Show in navigation</label>
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest">Save Settings</button>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  );
}
