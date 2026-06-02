import {CSS} from '@dnd-kit/utilities';
import {plugins} from 'virtual:gustav-plugins';
import {useParams, useNavigate} from 'react-router-dom';
import React, {useState, useEffect, useMemo} from 'react';
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8" />
    ),
    image: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    grid: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

// --- Draggable Library Item ---
interface DraggableLibraryComponentProps {
  component: any;
  onAdd: () => void;
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
  const props = JSON.parse(component.props || '{}');

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
          <span className="text-[9px] font-black uppercase tracking-widest">{component.componentName}</span>
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
              onEdit(component.id);
            }}
            className="p-2 bg-white shadow-sm border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-gray-400 transition-colors"
            title="Edit Properties"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
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
          onPropChange={onInlinePropChange}
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
                  onInlinePropChange={onInlinePropChange}
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

// --- Drawer Component ---
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  isBlocking?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  isBlocking = true,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} max-w-md w-full flex z-50`}
    >
      <div
        className={`w-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col ${side === 'right' ? 'border-l' : 'border-r'} dark:border-zinc-800 animate-in ${side === 'right' ? 'slide-in-from-right' : 'slide-in-from-left'} duration-300`}
      >
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-black dark:text-white tracking-tight uppercase">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );

  if (!isBlocking) return content;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {content}
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

  // Drawer States
  const [activeDrawer, setActiveDrawer] = useState<
    'settings' | 'properties' | 'library' | null
  >(null);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [addingToParentId, setAddingToParentId] = useState<number | null>(null);

  // Form States
  const [pageSettings, setPageSettings] = useState<Partial<PageWire>>({});
  const [componentProps, setComponentProps] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const fetchPages = async () => {
    try {
      const data = await pageSdk.findAll();
      setPages(data);
    } catch {
      // Ignored
    }
  };

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
        showInNavigation: data.showInNavigation ?? true,
      });
    } catch {
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setActiveType(event.active.data.current?.type || 'canvas');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (active.id !== over.id) {
      if (activeType === 'library') {
        const componentName = active.data.current?.componentName;
        const overId = over.id;

        // 1. Drop on empty canvas target
        if (overId === 'empty-canvas' || overId === 'canvas-root') {
          await handleAddComponent(componentName, undefined, undefined);
          return;
        }

        // 2. Drop on a container or a sibling
        const overComp = page?.components?.find(c => c.id === overId);
        if (overComp) {
          const plugin = plugins.find(p => p.name === overComp.pluginName);
          const pluginComp = plugin?.components.find(
            (c: any) => c.name === overComp.componentName
          );
          
          if (pluginComp?.canHaveChildren) {
            // Drop INTO container
            await handleAddComponent(componentName, undefined, overComp.id);
          } else {
            // Drop AS SIBLING
            const siblings = page?.components?.filter(c => c.parentId === overComp.parentId) || [];
            const overIndex = siblings.findIndex(c => c.id === overId);
            await handleAddComponent(componentName, overIndex, overComp.parentId);
          }
        }
      } else if (page?.components) {
        const activeComp = page.components.find(c => c.id === active.id);
        const overComp = page.components.find(c => c.id === over.id);
        
        if (!activeComp) return;

        // Case A: Moving into the empty root or canvas root
        if (over.id === 'canvas-root' || over.id === 'empty-canvas') {
           if (activeComp.parentId !== undefined) {
              await pageSdk.updateComponent(activeComp.id, { parentId: undefined as any });
              toast.success('Moved to root');
              fetchPage(page.id);
           }
           return;
        }

        if (!overComp) return;

        // Case B: Sibling Reorder
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
            fetchPage(page.id); // Sync new IDs if draft was created
          } catch (err) {
            toast.error('Failed to save order');
            fetchPage(page.id);
          }
        } 
        // Case C: Move to new parent (Container)
        else {
           const overPlugin = plugins.find(p => p.name === overComp.pluginName);
           const overPluginComp = overPlugin?.components.find((c: any) => c.name === overComp.componentName);
           
           if (overPluginComp?.canHaveChildren) {
              // Move INTO container
              await pageSdk.updateComponent(activeComp.id, { parentId: overComp.id });
              toast.success(`Moved into ${overComp.componentName}`);
              fetchPage(page.id);
           } else {
              // Move AS SIBLING of target
              await pageSdk.updateComponent(activeComp.id, { parentId: overComp.parentId });
              toast.success(`Moved near ${overComp.componentName}`);
              fetchPage(page.id);
           }
        }
      }
    }
  };

  const handleAddComponent = async (
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
      setActiveDrawer(null);
      toast.success(`Added ${componentName}`);
      fetchPage(page.id);
    } catch (err) {
      toast.error('Failed to add component');
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    try {
      await pageSdk.update(page.id, pageSettings);
      setActiveDrawer(null);
      toast.success('Page metadata updated');
      fetchPage(page.id);
    } catch (err) {
      toast.error('Failed to update page');
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    try {
      await pageSdk.update(page.id, {status: PageStatus.PUBLISHED});
      setIsDirty(false);
      toast.success('Page published successfully');
      fetchPage(page.id);
    } catch (err) {
      toast.error('Failed to publish page');
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
      const propsToSave =
        typeof componentProps === 'string'
          ? componentProps
          : JSON.stringify(componentProps);
      JSON.parse(propsToSave);
      await pageSdk.updateComponent(selectedComponentId, {props: propsToSave});
      setIsDirty(true);
      setActiveDrawer(null);
      toast.success('Properties updated');
      if (page) fetchPage(page.id);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? 'Invalid Data: ' + err.message
          : 'Failed to update component'
      );
    }
  };

  const handlePropChange = (name: string, value: any) => {
    try {
      const currentProps =
        typeof componentProps === 'string'
          ? JSON.parse(componentProps)
          : componentProps;
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
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            value={value || ''}
            rows={4}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
          />
        )}
        {field.type === 'select' && (
          <select
            value={value || ''}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
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
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
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
              className="flex-1 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
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

  const handleRemoveComponent = async (compId: number) => {
    try {
      await pageSdk.removeComponent(compId);
      toast.success('Component removed');
      setIsDirty(true);
      if (page) fetchPage(page.id);
    } catch (err) {
      toast.error('Failed to remove component');
    }
  };

  const handleInlinePropChange = async (
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
    const plugin = plugins.find(p => p.name === selectedComponent.pluginName);
    return plugin?.components.find(
      (c: any) => c.name === selectedComponent.componentName
    )?.schema;
  }, [selectedComponent]);

  if (loading || !page)
    return (
      <div className="p-8 animate-pulse text-gray-400 font-bold uppercase tracking-widest text-sm">
        Initializing visual builder...
      </div>
    );

  return (
    <div
      className={`min-h-[calc(100vh-12rem)] flex flex-col ${isPreview ? 'bg-white dark:bg-zinc-950 -mx-6 -my-8' : ''}`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Page Toolbar */}
        {!isPreview && (
          <div className="flex items-center justify-between mb-8 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/pages')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors"
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
                  <svg
                    className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </h1>
                <p className="text-xs font-mono text-gray-400">{page.path}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreview(true)}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                title="Live Preview"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>

              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
                title="Public Link"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {page.status === PageStatus.DRAFT && (
                <button
                  onClick={handlePublish}
                  className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-110 active:scale-95 transition-all"
                  title="Publish Changes"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {isPreview && (
          <button
            onClick={() => setIsPreview(false)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 border border-zinc-700"
          >
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Exit Preview Mode</span>
          </button>
        )}

        <div className="flex-1 flex space-x-8">
          {/* Main Canvas Area */}
          <CanvasContainer isPreview={isPreview}>
            {page.components?.length === 0 ? (
              <EmptyCanvasPlaceholder />
            ) : (
              <SortableContext
                items={page.components?.filter(c => !c.parentId).map(c => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {page.components?.filter(c => !c.parentId).sort((a, b) => a.displayOrder - b.displayOrder).map(component => (
                  <SortableComponent
                    key={component.id}
                    id={component.id}
                    component={component}
                    allComponents={page.components || []}
                    onEdit={(compId) =>
                      !isPreview && handleOpenProperties(compId)
                    }
                    onRemove={(compId) =>
                      !isPreview && handleRemoveComponent(compId)
                    }
                    onInlinePropChange={(name, value) =>
                      !isPreview &&
                      handleInlinePropChange(component.id, name, value)
                    }
                    isPreview={isPreview}
                  />
                ))}
              </SortableContext>
            )}
          </CanvasContainer>

          {/* Permanent Components Sidebar (Right) */}
          {!isPreview && (
            <div className="w-80 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 flex flex-col h-fit sticky top-24 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">
                  Component Library
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  Available Blocks
                </p>
              </div>
              <div className="p-4 space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {plugins.flatMap(p => p.components).map(comp => (
                  <DraggableLibraryComponent
                    key={comp.name}
                    component={comp}
                    onAdd={() => handleAddComponent(comp.name, undefined, undefined)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

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
      </DndContext>

      {/* Library Drawer (for nested additions) */}
      <Drawer
        isOpen={activeDrawer === 'library'}
        onClose={() => {
          setActiveDrawer(null);
          setAddingToParentId(null);
        }}
        title="Add Nested Block"
      >
        <div className="space-y-3">
          {plugins.flatMap(p => p.components).map(comp => (
            <div
              key={comp.name}
              onClick={() => {
                if (addingToParentId) {
                  handleAddComponent(comp.name, undefined, addingToParentId);
                }
              }}
              className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <BlockIcon name={comp.icon} className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white uppercase text-[10px] tracking-widest truncate">
                {comp.name}
              </h4>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        isOpen={activeDrawer === 'settings'}
        onClose={() => setActiveDrawer(null)}
        title="Page Settings"
      >
        <form onSubmit={handleUpdatePage} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Title
            </label>
            <input
              type="text"
              required
              value={pageSettings.title || ''}
              onChange={e =>
                setPageSettings({...pageSettings, title: e.target.value})
              }
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Slug
            </label>
            <input
              type="text"
              required
              value={pageSettings.slug || ''}
              onChange={e =>
                setPageSettings({
                  ...pageSettings,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Parent Page
            </label>
            <select
              value={pageSettings.parentId || ''}
              onChange={e =>
                setPageSettings({
                  ...pageSettings,
                  parentId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
            >
              <option value="">None (Root Level)</option>
              {pages
                .filter(p => p.id !== page.id) // Prevent self-parenting
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.path}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
            <input
              type="checkbox"
              id="showInNavigation"
              checked={pageSettings.showInNavigation}
              onChange={e =>
                setPageSettings({
                  ...pageSettings,
                  showInNavigation: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="showInNavigation"
              className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Show in navigation menu
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Save Page Metadata
          </button>
        </form>
      </Drawer>

      {/* Properties Drawer */}
      <Drawer
        isOpen={activeDrawer === 'properties'}
        onClose={() => setActiveDrawer(null)}
        title={`${selectedComponent?.componentName} Properties`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Configuration
          </p>
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
            <summary
              id="json-editor-toggle"
              className="list-none cursor-pointer flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-500 transition-colors"
            >
              <span>Advanced JSON Editor</span>
              <svg
                className="w-4 h-4 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
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
