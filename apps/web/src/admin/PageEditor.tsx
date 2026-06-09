import toast from 'react-hot-toast';
import {CSS} from '@dnd-kit/utilities';
import {plugins} from 'virtual:gustav-plugins';
import {useParams, useNavigate, Link} from 'react-router-dom';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from 'react';
import {
  DynamicSchemaField,
  DynamicSchemaWire,
  PageWire,
  PageComponentWire,
  PageStatus,
} from '@gustav/types';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  DndContext,
  pointerWithin,
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
  CollisionDetection,
} from '@dnd-kit/core';

import {pageSdk, schemaSdk} from '../sdk';

// --- Block Icons Mapping ---
const BlockIcon = memo(
  ({name, className = 'w-5 h-5'}: {name?: string; className?: string}) => {
    const icons: Record<string, React.ReactNode> = {
      heading: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16m-7 6h7"
        />
      ),
      text: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      hero: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      ),
      divider: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h14"
        />
      ),
      button: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8"
        />
      ),
      image: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      grid: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      ),
      card: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      ),
      data: (
        <React.Fragment>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 3v4m8-4v4M3 11h18"
          />
        </React.Fragment>
      ),
    };

    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[name || ''] || (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        )}
      </svg>
    );
  }
);

// --- Component ID Helper ---
const getComponentDisplayId = (
  compId: number,
  allComponents: PageComponentWire[]
) => {
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

const DraggableLibraryComponent: React.FC<DraggableLibraryComponentProps> =
  memo(({component}) => {
    const {attributes, listeners, setNodeRef, transform, isDragging} =
      useDraggable({
        id: `library-${component.name}`,
        data: {
          type: 'library',
          componentName: component.plugin ? 'DataSource' : component.name,
          pluginName: component.plugin || '@gustav/core-plugin',
          defaultProps: component.defaultProps,
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
        className={`w-full flex items-center gap-2.5 p-3 pr-4 bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-lg hover:border-layer-primary hover:bg-layer-primary-light/30 transition-all text-left group cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 ring-2 ring-layer-primary' : ''
        }`}
      >
        <div className="w-9 h-9 bg-layer-primary-light dark:bg-layer-primary/20 border border-layer-primary/30 rounded-lg flex items-center justify-center text-layer-primary group-hover:scale-110 transition-transform">
          <BlockIcon name={component.icon} className="w-4 h-4" />
        </div>
        <h4 className="font-bold text-text dark:text-white uppercase text-[0.625rem] tracking-tight truncate">
          {component.name}
        </h4>
      </div>
    );
  });

// --- Droppable Slot for Containers ---
const DroppableSlot = memo(
  ({parentId, slotIndex, children, isPreview}: any) => {
    const {setNodeRef, isOver} = useDroppable({
      id: `slot-${parentId}-${slotIndex}`,
      data: {
        type: 'slot',
        parentId,
        slotIndex,
      },
      disabled: isPreview,
    });

    const childrenCount = React.Children.toArray(children).reduce(
      (acc: number, child: any) => {
        // SortableContext might wrap children, we need to dig into its props
        if (child && child.props && child.props.children) {
          return acc + React.Children.count(child.props.children);
        }
        // Handle case where children might be an empty array inside SortableContext
        if (Array.isArray(child) && child.length === 0) return acc;
        return acc + (child ? 1 : 0);
      },
      0
    );

    return (
      <div
        ref={setNodeRef}
        className={`min-h-[100px] h-full transition-all rounded-lg group relative ${
          !isPreview && isOver
            ? 'bg-layer-primary-light/50 ring-2 ring-layer-primary/50'
            : ''
        }`}
      >
        {children}
        {!isPreview && childrenCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg text-white/30 transition-colors group-hover:border-white/25 group-hover:bg-white/5">
            <svg
              className="w-5 h-5 mb-1 opacity-30 group-hover:opacity-60 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-[0.5625rem] font-black uppercase tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">
              Column {slotIndex + 1}
            </span>
          </div>
        )}
      </div>
    );
  }
);

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

const SortableComponent: React.FC<SortableComponentProps> = memo(
  ({
    id,
    component,
    allComponents,
    onEdit,
    onRemove,
    onInlinePropChange,
    isPreview,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({id, disabled: isPreview});

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
    const props = useMemo(
      () => JSON.parse(component.props || '{}'),
      [component.props]
    );

    const children = useMemo(
      () =>
        allComponents
          .filter(c => c.parentId === component.id)
          .sort((a, b) => a.displayOrder - b.displayOrder),
      [allComponents, component.id]
    );

    const renderSlot = useCallback(
      (index: number) => {
        const slotChildren = children.filter(c => (c.slot || 0) === index);
        return (
          <DroppableSlot
            key={index}
            parentId={component.id}
            slotIndex={index}
            isPreview={isPreview}
          >
            <SortableContext
              items={slotChildren.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {slotChildren.map(child => (
                <SortableComponent
                  key={child.id}
                  id={child.id}
                  component={child}
                  allComponents={allComponents}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  onInlinePropChange={(name, value) =>
                    onInlinePropChange(name, value)
                  }
                  isPreview={isPreview}
                />
              ))}
            </SortableContext>
          </DroppableSlot>
        );
      },
      [
        children,
        component.id,
        isPreview,
        allComponents,
        onEdit,
        onRemove,
        onInlinePropChange,
      ]
    );

    const onMouseEnter = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsHovered(true);
    }, []);

    const onMouseLeave = useCallback(() => setIsHovered(false), []);

    const onClick = useCallback(
      (e: React.MouseEvent) => {
        if (isPreview) return;
        e.stopPropagation();
        onEdit(component.id);
      },
      [isPreview, onEdit, component.id]
    );

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(component.id);
      },
      [onRemove, component.id]
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        className="relative"
      >
        {/* Name Tag Handle (Top Left Corner) */}
        {!isPreview && (
          <div
            {...attributes}
            {...listeners}
            className={`absolute -top-3 left-3 px-3 py-1.5 bg-white/15 text-white ring-1 ring-white/20 rounded-lg flex items-center gap-2 transition-all z-50 cursor-grab active:cursor-grabbing backdrop-blur-sm ${
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <BlockIcon name={pluginComponent?.icon} className="w-3 h-3" />
            <span className="text-[0.5625rem] font-black uppercase tracking-wider">
              {getComponentDisplayId(component.id, allComponents)}
            </span>
          </div>
        )}

        {/* Overlay controls (Top Right Corner) */}
        {!isPreview && (
          <div
            className={`absolute top-3 right-3 flex items-center gap-1 transition-all z-50 ${
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <button
              onClick={handleRemove}
              className="p-2 bg-white/10 border border-white/15 rounded-lg hover:bg-danger/20 hover:border-danger/40 hover:text-danger text-white/60 transition-colors"
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
          className={`transition-all ${isPreview ? '' : 'p-4 bg-dark-card rounded-xl border mb-4'} ${
            isDragging
              ? 'border-layer-primary opacity-50 scale-[1.02]'
              : isPreview
                ? 'border-transparent'
                : isHovered
                  ? 'border-white/20 ring-2 ring-white/10'
                  : 'border-dark-border'
          }`}
        >
          <Comp
            {...props}
            editable={!isPreview}
            onPropChange={(name: string, value: any) =>
              onInlinePropChange(name, value)
            }
            renderSlot={
              component.componentName === 'Grid' ? renderSlot : undefined
            }
          >
            {component.componentName !== 'Grid' &&
              (children.length > 0 ? (
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
                      onInlinePropChange={(name, value) =>
                        onInlinePropChange(name, value)
                      }
                      isPreview={isPreview}
                    />
                  ))}
                </SortableContext>
              ) : (
                pluginComponent?.canHaveChildren &&
                !isPreview && (
                  <div className="p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/30">
                    <svg
                      className="w-8 h-8 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                      />
                    </svg>
                    <p className="text-[0.625rem] font-bold uppercase tracking-wider text-center">
                      Empty Container
                      <br />
                      <span className="text-[0.5625rem] font-medium mt-0.5 block">
                        Drag items here
                      </span>
                    </p>
                  </div>
                )
              ))}
          </Comp>
        </div>
      </div>
    );
  }
);

// --- Droppable Empty State ---
const EmptyCanvasPlaceholder: React.FC = memo(() => {
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
        isOver
          ? 'bg-layer-primary-light border-2 border-layer-primary scale-[0.98] '
          : 'border-2 border-dashed border-l5-border dark:border-dark-border'
      }`}
    >
      <div className="w-16 h-16 bg-layer-primary-light dark:bg-layer-primary/20 border-2 border-layer-primary/30 rounded-2xl flex items-center justify-center text-layer-primary mb-5 ">
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h2 className="layer-title text-lg text-text dark:text-white mb-2">
        Empty Canvas
      </h2>
      <p className="text-sm font-bold text-text-secondary dark:text-text-secondary max-w-xs mx-auto">
        Drop components from the library on the right to start building.
      </p>
    </div>
  );
});

const CanvasContainer: React.FC<{
  children: React.ReactNode;
  isPreview: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}> = memo(({children, isPreview, deviceMode}) => {
  const {setNodeRef, isOver} = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'canvas-root',
    },
    disabled: isPreview,
  });

  const widthStyle: Record<string, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="flex justify-center flex-1 h-full w-full">
      <div
        ref={setNodeRef}
        style={{
          width: widthStyle[deviceMode],
          maxWidth: '100%',
          containerType: 'inline-size',
        }}
        className={`gustav-canvas transition-all duration-500 ease-in-out ${isPreview ? 'p-0 border-none' : 'bg-dark-card shadow-lg border-x border-dark-border/50 min-h-full'}`}
      >
        <div
          className={`transition-all duration-500 ${isPreview ? 'p-0' : 'p-12'} ${!isPreview && isOver ? 'bg-layer-primary-light/20' : ''}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

// --- Drag Preview Helper ---
const DragPreviewContent = memo(
  ({activeId, activeType, page, plugins}: any) => {
    const {over} = useDndContext();

    const canvasEl = document.querySelector('.gustav-canvas');
    let baseWidth: number | string = 'auto';

    if (canvasEl) {
      const style = window.getComputedStyle(canvasEl);
      const padding =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      baseWidth = Math.min(
        canvasEl.getBoundingClientRect().width - padding,
        800
      ); // Cap at 800px
    }

    // Use the 'over' element's width if available, otherwise the canvas content width
    // Subtract padding for slots to better match inner content
    const targetWidth = over ? over.rect.width - 24 : baseWidth;

    let Comp: any = null;
    let props: any = {};

    if (activeType === 'canvas') {
      const comp = page.components.find((c: any) => c.id === activeId);
      if (!comp) return null;
      const plugin = plugins.find((p: any) => p.name === comp.pluginName);
      const pluginComp = plugin?.components.find(
        (c: any) => c.name === comp.componentName
      );
      Comp = pluginComp?.component || (() => null);
      props = JSON.parse(comp.props || '{}');
    } else if (activeType === 'library') {
      const name = (activeId as string).replace('library-', '');
      const plugin = plugins.find((p: any) =>
        p.components.some((c: any) => c.name === name)
      );
      const pluginComp = plugin?.components.find((c: any) => c.name === name);
      if (!pluginComp) return null;
      Comp = pluginComp.component;
      props = pluginComp.defaultProps || {};
    }

    if (!Comp) return null;

    return (
      <div
        style={{width: targetWidth}}
        className="pointer-events-none opacity-50 ring-2 ring-layer-primary rounded-2xl bg-white/80 dark:bg-dark-card/80  transition-[width] duration-150 ease-in-out overflow-hidden"
      >
        <div className="p-5 rounded-2xl">
          <Comp {...props} isPreview={true} />
        </div>
      </div>
    );
  }
);

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
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

  // Form States
  const [pageSettings, setPageSettings] = useState<Partial<PageWire>>({});
  const [componentProps, setComponentProps] = useState<string>('');
  const [dynamicSchemas, setDynamicSchemas] = useState<DynamicSchemaWire[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'design' | 'data'>('design');
  const [expandedData, setExpandedData] = useState<Record<string, boolean>>({});
  const [queryConfigs, setQueryConfigs] = useState<Record<string, {name: string; fetchMode: 'single' | 'collection'; limit: number; sortDirection: 'ASC' | 'DESC'}>>({});
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
    fetchSchemas();
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const data = await pageSdk.findAll();
      setPages(data);
    } catch {
      // Ignored
    }
  }, []);

  const fetchSchemas = useCallback(async () => {
    try {
      const data = await schemaSdk.findAll();
      setDynamicSchemas(data);
    } catch {
      // Dynamic bindings are optional in the editor.
    }
  }, []);

  const fetchPage = useCallback(
    async (pageId: number, isSilent = false) => {
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
    },
    [navigate]
  );

  useEffect(() => {
    if (page) {
      document.title = `Gustav - Editing ${page.title}`;
    }
  }, [page]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    setActiveType(event.active.data.current?.type || 'canvas');
  }, []);

  const handleAddComponent = useCallback(
    async (
      componentName: string,
      atIndex?: number,
      parentId?: number,
      slot?: number,
      propsOverride?: Record<string, any>
    ) => {
      if (!page) return;
      const plugin = plugins.find(p =>
        p.components.some((c: any) => c.name === componentName)
      );
      if (!plugin) return;
      const pluginComp = plugin.components.find(
        (c: any) => c.name === componentName
      );
      if (!pluginComp) return;

      const propsToUse = propsOverride || pluginComp.defaultProps;
      if (
        componentName === 'DataSource' &&
        propsToUse.schemaSlug &&
        !propsToUse.schemaName
      ) {
        const schema = dynamicSchemas.find(
          (s: any) => s.slug === propsToUse.schemaSlug
        );
        if (schema) {
          propsToUse.schemaName = schema.name;
        }
      }

      try {
        await pageSdk.addComponent(page.id, {
          pluginName: plugin.name,
          componentName,
          props: JSON.stringify(propsToUse),
          parentId,
          slot,
          displayOrder:
            atIndex !== undefined
              ? atIndex
              : page.components?.filter(
                  c => c.parentId === parentId && c.slot === slot
                ).length || 0,
        });

        setIsDirty(true);
        setSelectedComponentId(null);
        toast.success(`Added ${componentName}`);
        fetchPage(page.id, true);
      } catch (err) {
        toast.error('Failed to add component');
      }
    },
    [page, fetchPage, dynamicSchemas]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const {active, over} = event;
      const type = active.data.current?.type || activeType;

      setActiveId(null);
      setActiveType(null);

      if (!over) return;

      if (active.id !== over.id) {
        if (type === 'library') {
          const componentName = active.data.current?.componentName;
          const propsOverride = active.data.current?.defaultProps;
          const overId = over.id;
          const overData = over.data.current;

          if (overId === 'empty-canvas' || overId === 'canvas-root') {
            await handleAddComponent(
              componentName,
              undefined,
              undefined,
              undefined,
              propsOverride
            );
            return;
          }

          if (overData?.type === 'slot') {
            await handleAddComponent(
              componentName,
              undefined,
              overData.parentId,
              overData.slotIndex,
              propsOverride
            );
            return;
          }

          const overComp = page?.components?.find(c => c.id === overId);

          if (overComp) {
            const plugin = plugins.find(p => p.name === overComp.pluginName);
            const pluginComp = plugin?.components.find(
              (c: any) => c.name === overComp.componentName
            );

            if (pluginComp?.canHaveChildren) {
              await handleAddComponent(
                componentName,
                undefined,
                overComp.id,
                0,
                propsOverride
              );
            } else {
              const siblings =
                page?.components?.filter(
                  c =>
                    c.parentId === overComp.parentId && c.slot === overComp.slot
                ) || [];
              const overIndex = siblings.findIndex(c => c.id === overId);
              await handleAddComponent(
                componentName,
                overIndex,
                overComp.parentId,
                overComp.slot,
                propsOverride
              );
            }
          }
        } else if (page?.components) {
          const activeComp = page.components.find(c => c.id === active.id);
          const overId = over.id;
          const overData = over.data.current;

          if (!activeComp) return;

          if (overId === 'canvas-root' || overId === 'empty-canvas') {
            if (activeComp.parentId !== undefined) {
              await pageSdk.updateComponent(activeComp.id, {
                parentId: undefined as any,
                slot: undefined as any,
              });
              toast.success('Moved to root');
              fetchPage(page.id, true);
            }
            return;
          }

          if (overData?.type === 'slot') {
            await pageSdk.updateComponent(activeComp.id, {
              parentId: overData.parentId,
              slot: overData.slotIndex,
            });
            toast.success(`Moved to column ${overData.slotIndex + 1}`);
            fetchPage(page.id, true);
            return;
          }

          const overComp = page.components.find(c => c.id === overId);
          if (!overComp) return;

          if (
            activeComp.parentId === overComp.parentId &&
            activeComp.slot === overComp.slot
          ) {
            const siblings = page.components
              .filter(
                c =>
                  c.parentId === activeComp.parentId &&
                  c.slot === activeComp.slot
              )
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
          } else {
            const overPlugin = plugins.find(
              p => p.name === overComp.pluginName
            );
            const overPluginComp = overPlugin?.components.find(
              (c: any) => c.name === overComp.componentName
            );

            if (overPluginComp?.canHaveChildren) {
              await pageSdk.updateComponent(activeComp.id, {
                parentId: overComp.id,
                slot: 0,
              });
              toast.success(`Moved into ${overComp.componentName}`);
              fetchPage(page.id, true);
            } else {
              await pageSdk.updateComponent(activeComp.id, {
                parentId: overComp.parentId,
                slot: overComp.slot,
              });
              toast.success(`Moved near ${overComp.componentName}`);
              fetchPage(page.id, true);
            }
          }
        }
      }
    },
    [activeType, page, fetchPage, handleAddComponent]
  );

  const handleUpdatePage = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [page, pageSettings, fetchPage]
  );

  const handleDeletePage = useCallback(async () => {
    if (!page) return;
    try {
      await pageSdk.removePage(page.id);
      toast.success('Page deleted successfully');
      navigate('/admin/pages');
    } catch (err) {
      toast.error('Failed to delete page');
    }
  }, [page, navigate]);

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

  const handleOpenProperties = useCallback(
    (compId: number) => {
      const comp = page?.components?.find(c => c.id === compId);
      if (comp) {
        setSelectedComponentId(compId);
        setComponentProps(comp.props);
      }
    },
    [page?.components]
  );

  const handlePropChange = useCallback(
    (name: string, value: any) => {
      try {
        const currentProps =
          typeof componentProps === 'string'
            ? JSON.parse(componentProps)
            : componentProps;
        const newProps = {...currentProps, [name]: value};

        const selectedComp = page?.components?.find(
          c => c.id === selectedComponentId
        );
        if (
          selectedComp &&
          selectedComp.componentName === 'DataSource' &&
          selectedComp.pluginName === '@gustav/core-plugin' &&
          name === 'schemaSlug'
        ) {
          const schema = dynamicSchemas.find(s => s.slug === value);
          if (schema) {
            newProps.schemaName = schema.name;
          }
        }

        const serializedProps = JSON.stringify(newProps, null, 2);

        setComponentProps(serializedProps);

        if (selectedComponentId && page) {
          const updatedComponents = page.components?.map(c =>
            c.id === selectedComponentId ? {...c, props: serializedProps} : c
          );
          setPage({...page, components: updatedComponents});
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
          if (selectedComponentId) {
            try {
              await pageSdk.updateComponent(selectedComponentId, {
                props: serializedProps,
              });
              setIsDirty(true);
            } catch (err) {
              console.error('Auto-save failed', err);
            }
          }
        }, 500);
      } catch {
        // Ignore invalid JSON while the user is still typing.
      }
    },
    [componentProps, selectedComponentId, page, dynamicSchemas]
  );

  const handleJsonChange = useCallback(
    (value: string) => {
      setComponentProps(value);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          JSON.parse(value);
          if (selectedComponentId) {
            await pageSdk.updateComponent(selectedComponentId, {props: value});
            setIsDirty(true);
            if (page) {
              const updatedComponents = page.components?.map(c =>
                c.id === selectedComponentId ? {...c, props: value} : c
              );
              setPage({...page, components: updatedComponents});
            }
          }
        } catch {
          // Ignore invalid JSON while the user is still typing.
        }
      }, 500);
    },
    [selectedComponentId, page]
  );

  const handleRemoveComponent = useCallback(
    async (compId: number) => {
      try {
        await pageSdk.removeComponent(compId);
        toast.success('Component removed');
        setIsDirty(true);
        if (selectedComponentId === compId) setSelectedComponentId(null);
        if (page) fetchPage(page.id, true);
      } catch (err) {
        toast.error('Failed to remove component');
      }
    },
    [selectedComponentId, page, fetchPage]
  );

  const handleInlinePropChange = useCallback(
    async (compId: number, name: string, value: any) => {
      if (!page) return;
      const comp = page.components?.find(c => c.id === compId);
      if (!comp) return;

      try {
        const currentProps = JSON.parse(comp.props);
        const newProps = {...currentProps, [name]: value};
        await pageSdk.updateComponent(compId, {
          props: JSON.stringify(newProps),
        });
        setIsDirty(true);
        fetchPage(page.id, true);
      } catch (err) {
        console.error('Failed to update inline prop', err);
      }
    },
    [page, fetchPage]
  );

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !page?.components) return null;
    return page.components.find(c => c.id === selectedComponentId);
  }, [selectedComponentId, page?.components]);

  const rootComponents = useMemo(() => {
    return (
      page?.components
        ?.filter(c => !c.parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder) || []
    );
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

  const getDataSourceFields = useCallback(
    (componentId: number): DynamicSchemaField[] => {
      if (!page?.components) return [];
      let current = page.components.find(c => c.id === componentId);
      while (current) {
        if (
          current.componentName === 'DataSource' &&
          current.pluginName === '@gustav/core-plugin'
        ) {
          const props = JSON.parse(current.props || '{}');
          const slug = props.schemaSlug;
          if (slug) {
            const schema = dynamicSchemas.find(s => s.slug === slug);
            if (schema) return schema.fields || [];
          }
          return [];
        }
        current = page.components.find(c => c.id === current?.parentId);
      }
      return [];
    },
    [page?.components, dynamicSchemas]
  );

  const handleDeselect = useCallback((e: React.MouseEvent) => {
    if (toolsSidebarRef.current?.contains(e.target as Node)) return;
    setSelectedComponentId(null);
  }, []);

  const renderPageLinks = (
    parentId: number | null | undefined = null,
    level = 0
  ) => {
    const levelPages = pages.filter(p => {
      if (parentId === null || parentId === undefined) {
        return p.parentId === null || p.parentId === undefined;
      }
      return p.parentId === parentId;
    });

    const chipColors = [
      '#e8a060', '#6a9aba', '#b88a6a', '#7aaa7a',
      '#c87a7a', '#8a8aba', '#5a9a8a', '#c89a5a',
    ];

    return levelPages.map((p, idx) => (
      <React.Fragment key={p.id}>
        <Link
          to={`/admin/pages/${p.id}`}
          onClick={e => e.stopPropagation()}
          style={{paddingLeft: `${level * 1.5 + 0.75}rem`}}
          className={`flex items-center gap-2.5 p-2 rounded-lg transition-all relative ${
            p.id === page?.id
              ? 'bg-layer-primary text-white'
              : 'text-text-secondary dark:text-text-secondary hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          {level > 0 && (
            <div
              className="absolute left-2 w-0.5 h-full bg-l5-border dark:bg-dark-border"
              style={{left: `${(level - 0.5) * 1.5 + 0.5}rem`}}
            />
          )}
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[0.5rem] font-black shrink-0"
            style={{backgroundColor: chipColors[idx % chipColors.length], color: '#ffffff'}}
          >
            {p.title.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold truncate">{p.title}</span>
          <div className="text-[0.5rem] font-black bg-black/10 dark:bg-white/10 text-text-muted dark:text-dark-text-secondary px-1 py-0.5 rounded shrink-0 ml-auto leading-none">
            v{p.versionNumber ?? 1}
          </div>
        </Link>
        {renderPageLinks(p.id, level + 1)}
      </React.Fragment>
    ));
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
      <div key={field.name} className="mb-5">
        <label className="block layer-label text-text-muted dark:text-text-muted mb-2 ml-1">
          {field.label}
        </label>
        {field.type === 'text' && (
          <TokenizedTextField
            value={value || ''}
            fields={getDataSourceFields(selectedComponentId!)}
            onChange={nextValue => handlePropChange(field.name, nextValue)}
          />
        )}
        {field.type === 'textarea' && (
          <TokenizedTextField
            value={value || ''}
            fields={getDataSourceFields(selectedComponentId!)}
            multiline
            onChange={nextValue => handlePropChange(field.name, nextValue)}
          />
        )}
        {field.type === 'select' && (
          <select
            value={value || ''}
            onChange={e => handlePropChange(field.name, e.target.value)}
            className="w-full bg-white dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold text-text dark:text-white focus:border-layer-primary focus: outline-none transition-all appearance-none"
          >
            {field.name === 'schemaSlug' ? (
              <>
                <option value="">Select a schema...</option>
                {dynamicSchemas.map(schema => (
                  <option key={schema.slug} value={schema.slug}>
                    load{toPascalCase(schema.slug)}s()
                  </option>
                ))}
              </>
            ) : (
              field.options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        )}
        {field.type === 'number' && (
          <input
            type="number"
            value={value || 0}
            onChange={e =>
              handlePropChange(field.name, parseFloat(e.target.value))
            }
            className="w-full bg-white dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold text-text dark:text-white focus:border-layer-primary focus: outline-none transition-all"
          />
        )}
        {field.type === 'color' && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => handlePropChange(field.name, e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-l5-border dark:border-dark-border bg-white dark:bg-dark-surface cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={e => handlePropChange(field.name, e.target.value)}
              className="flex-1 bg-white dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl px-4 py-3 text-xs font-mono font-bold text-text dark:text-white focus:border-layer-primary focus: outline-none transition-all"
            />
          </div>
        )}
        {field.type === 'checkbox' && (
          <label className="flex items-center gap-3 p-3 bg-l1-bg/50 dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl cursor-pointer">
            <input
              type="checkbox"
              id={`field-${field.name}`}
              checked={!!value}
              onChange={e => handlePropChange(field.name, e.target.checked)}
              className="w-5 h-5 rounded-lg border-text-muted text-layer-primary focus:ring-layer-primary/30"
            />
            <span className="text-xs font-black text-text dark:text-text/dark:text-dark-text uppercase tracking-tight">
              Enable
            </span>
          </label>
        )}
      </div>
    );
  };

  const customCollisionDetection: CollisionDetection = useCallback(args => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 1) {
      const specific = pointerCollisions.filter(
        c => c.id !== 'canvas-root' && c.id !== 'empty-canvas'
      );
      if (specific.length > 0) return specific;
    }
    return pointerCollisions;
  }, []);

  if (loading || !page)
    return (
      <div className="p-8 animate-pulse text-text-secondary font-black uppercase tracking-wider text-sm">
        Initializing visual builder...
      </div>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        onClick={handleDeselect}
        className="flex h-screen bg-l2-sidebar dark:bg-dark-sidebar overflow-hidden"
      >
        {/* Column 1: Page Sidebar */}
        <aside className="w-72 bg-l5-border/40 dark:bg-dark-surface border-r border-l5-border/60 dark:border-dark-border/50 flex flex-col">
          <div className="p-5 border-b border-l5-border/60 dark:border-dark-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="layer-label text-text-muted dark:text-dark-text-secondary">Pages</h2>
              <button onClick={e => { e.stopPropagation(); setShowSettings(true); }}
                className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-layer-primary transition-colors rounded-md hover:bg-white/50 dark:hover:bg-white/5" title="Page Settings">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
              {renderPageLinks()}
            </div>
          </div>
        </aside>

        {/* Column 2: Main Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-l1-bg dark:bg-dark-bg">
          {/* Canvas Toolbar */}
          <div
            onClick={e => e.stopPropagation()}
            className="p-4 bg-white dark:bg-dark-card border-b border-l5-border dark:border-dark-border flex items-center justify-between sticky top-0 z-10 "
          >
            <div className="flex items-center gap-4">
              <Link
                to="/admin/pages"
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-layer-primary transition-colors bg-white dark:bg-dark-card border-2 border-l5-border dark:border-dark-border rounded-xl "
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
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-sm font-black uppercase tracking-tighter text-text dark:text-white truncate max-w-[200px]">
                {page.title}
              </h1>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-layer-primary transition-colors bg-white dark:bg-dark-card border-2 border-l5-border dark:border-dark-border rounded-xl "
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
                    strokeWidth="2.5"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center bg-l5-border dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl p-0.5">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setDeviceMode('mobile');
                  }}
                  className={`p-1.5 rounded-lg transition-all ${deviceMode === 'mobile' ? 'bg-white dark:bg-dark-card  text-layer-primary' : 'text-text-muted hover:text-text dark:hover:text-text/dark:text-dark-text'}`}
                  title="Mobile View"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setDeviceMode('tablet');
                  }}
                  className={`p-1.5 rounded-lg transition-all ${deviceMode === 'tablet' ? 'bg-white dark:bg-dark-card  text-layer-primary' : 'text-text-muted hover:text-text dark:hover:text-text/dark:text-dark-text'}`}
                  title="Tablet View"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setDeviceMode('desktop');
                  }}
                  className={`p-1.5 rounded-lg transition-all ${deviceMode === 'desktop' ? 'bg-white dark:bg-dark-card  text-layer-primary' : 'text-text-muted hover:text-text dark:hover:text-text/dark:text-dark-text'}`}
                  title="Desktop View"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsPreview(!isPreview);
                }}
                className={`px-4 py-1.5 rounded-xl text-[0.625rem] font-black uppercase transition-all border-2 ${
                  isPreview
                    ? 'bg-layer-primary text-white border-layer-primary '
                    : 'bg-white dark:bg-dark-card text-text-secondary dark:text-text-secondary border-l5-border dark:border-dark-border '
                }`}
              >
                {isPreview ? 'Editor' : 'Preview'}
              </button>

              <div className="h-6 w-px bg-l5-border dark:border-dark-border" />

              <button
                onClick={e => {
                  e.stopPropagation();
                  handlePublish();
                }}
                disabled={!isDirty && page.status === PageStatus.PUBLISHED}
                className="px-5 py-1.5 bg-success hover:bg-green-600 text-white rounded-xl text-[0.625rem] font-black uppercase border-2 border-success  transition-all disabled:opacity-50 disabled:bg-text-muted disabled:border-text-muted disabled:shadow-none"
              >
                Publish
              </button>
            </div>
          </div>

          {/* Actual Canvas */}
          <div className="flex-1 overflow-y-auto bg-l1-bg/50 dark:bg-dark-bg">
            <CanvasContainer isPreview={isPreview} deviceMode={deviceMode}>
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
                      onInlinePropChange={(name, value) =>
                        handleInlinePropChange(component.id, name, value)
                      }
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
          onClick={e => e.stopPropagation()}
          className="w-80 bg-white dark:bg-dark-surface border-l border-l5-border/60 dark:border-dark-border/50 flex flex-col"
        >
          {!selectedComponentId && (
            <div className="flex mx-3 my-3 bg-l5-border/50 dark:bg-dark-surface border border-l5-border/50 dark:border-dark-border/50 rounded-lg p-0.5">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setSidebarTab('design');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.625rem] font-black uppercase tracking-tight transition-all ${
                  sidebarTab === 'design'
                    ? 'bg-white dark:bg-dark-card text-layer-primary '
                    : 'text-text-secondary dark:text-text-secondary hover:text-text'
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Design
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setSidebarTab('data');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.625rem] font-black uppercase tracking-tight transition-all ${
                  sidebarTab === 'data'
                    ? 'bg-white dark:bg-dark-card text-layer-primary '
                    : 'text-text-secondary dark:text-text-secondary hover:text-text'
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M8 3v4m8-4v4M3 11h18"
                  />
                </svg>
                Data
              </button>
            </div>
          )}
          {selectedComponentId ? (
            /* Property Editor View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-5 border-b border-l5-border dark:border-dark-border bg-layer-primary flex items-center justify-between">
                <h2 className="text-sm font-black text-white tracking-tight uppercase">
                  {getComponentDisplayId(
                    selectedComponentId,
                    page.components || []
                  )}
                </h2>
                <button
                  onClick={() => setSelectedComponentId(null)}
                  className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
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
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <form onSubmit={e => e.preventDefault()} className="space-y-2">
                  <div id="property-fields">
                    {pluginSchema?.map(field => renderPropertyField(field))}
                  </div>

                  <details className="group border-t border-l5-border dark:border-dark-border pt-5 mt-5">
                    <summary className="list-none cursor-pointer flex items-center justify-between layer-label text-text-muted dark:text-text-muted hover:text-layer-primary transition-colors">
                      <span>Advanced JSON</span>
                      <svg
                        className="w-3 h-3 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4">
                      <textarea
                        rows={8}
                        value={componentProps}
                        onChange={e => handleJsonChange(e.target.value)}
                        className="w-full bg-transparent border border-l5-border/30 dark:border-dark-border/30 rounded-lg px-3 py-2 text-[0.625rem] focus:border-layer-primary focus: outline-none dark:text-white transition-all font-mono"
                      />
                    </div>
                  </details>

                  {getDataSourceFields(selectedComponentId!).length > 0 && (
                    <div className="border-t border-l5-border dark:border-dark-border pt-4 mt-5">
                      <label className="block layer-label text-text-muted dark:text-text-muted mb-3">
                        Data Fields
                      </label>
                      <p className="text-[0.5625rem] font-bold text-text-muted dark:text-text-muted mb-3">
                        Drag fields into text areas above
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getDataSourceFields(selectedComponentId!).map(
                          field => (
                            <button
                              key={field.name}
                              type="button"
                              draggable
                              onDragStart={e => {
                                e.dataTransfer.setData(
                                  'application/x-gustav-field',
                                  field.name
                                );
                                e.dataTransfer.setData(
                                  'text/plain',
                                  `{{${field.name}}}`
                                );
                              }}
                              className="cursor-grab active:cursor-grabbing rounded-xl border-2 border-layer-primary/30 bg-layer-primary-light px-3 py-1.5 text-[0.625rem] font-black uppercase tracking-tight text-layer-primary dark:text-layer-primary hover:bg-layer-primary/20 transition-colors"
                            >
                              {field.label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : sidebarTab === 'design' ? (
            /* Component Library View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="p-5 border-b border-l5-border dark:border-dark-border">
                <h2 className="layer-title text-sm text-text dark:text-white uppercase">
                  Library
                </h2>
                <p className="layer-label text-text-muted dark:text-text-muted mt-0.5">
                  Available Blocks
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {plugins
                  .flatMap((p: any) => p.components)
                  .filter((comp: any) => comp.name !== 'DataSource')
                  .map((comp: any) => (
                    <DraggableLibraryComponent
                      key={comp.name}
                      component={comp}
                    />
                  ))}
              </div>
            </div>
          ) : (
            /* Data Sources View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="p-5 border-b border-l5-border dark:border-dark-border">
                <h2 className="layer-title text-sm text-text dark:text-white uppercase">
                  Data Sources
                </h2>
                <p className="layer-label text-text-muted dark:text-text-muted mt-0.5">
                  Configure and name your queries
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {dynamicSchemas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs font-bold text-text-muted dark:text-text-muted">
                      No schemas defined yet.
                    </p>
                  </div>
                ) : (
                  dynamicSchemas.map(schema => {
                    const slug = schema.slug;
                    const isOpen = expandedData[slug] ?? false;
                    const config = queryConfigs[slug] ?? {name: '', fetchMode: 'collection' as const, limit: 10, sortDirection: 'DESC' as const};

                    const updateConfig = (updates: Partial<typeof config>) => {
                      setQueryConfigs(prev => ({...prev, [slug]: {...config, ...updates}}));
                    };

                    return (
                      <div key={slug} className="bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedData(prev => ({...prev, [slug]: !isOpen}))}
                          className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="w-7 h-7 bg-layer-primary-light dark:bg-layer-primary/20 border border-layer-primary/30 rounded flex items-center justify-center text-layer-primary shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v4m8-4v4M3 11h18" /></svg>
                          </div>
                          <span className="flex-1 text-xs font-bold text-text dark:text-white truncate">{schema.name}</span>
                          <svg className={`w-3 h-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3.5 space-y-3 border-t border-l5-border dark:border-dark-border pt-3">
                            <div>
                              <label className="layer-label text-text-muted mb-1 block">Query Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Load Featured Posts"
                                value={config.name}
                                onChange={e => updateConfig({name: e.target.value})}
                                className="w-full bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-md px-3 py-1.5 text-xs font-medium text-text dark:text-white outline-none focus:border-layer-primary"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateConfig({fetchMode: 'single'})}
                                className={`flex-1 px-3 py-1.5 rounded-md text-[0.625rem] font-bold uppercase transition-all border ${
                                  config.fetchMode === 'single'
                                    ? 'bg-layer-primary text-white border-layer-primary'
                                    : 'bg-l1-bg dark:bg-dark-surface text-text-secondary border-l5-border dark:border-dark-border hover:border-layer-primary'
                                }`}
                              >Fetch One</button>
                              <button
                                onClick={() => updateConfig({fetchMode: 'collection'})}
                                className={`flex-1 px-3 py-1.5 rounded-md text-[0.625rem] font-bold uppercase transition-all border ${
                                  config.fetchMode === 'collection'
                                    ? 'bg-layer-primary text-white border-layer-primary'
                                    : 'bg-l1-bg dark:bg-dark-surface text-text-secondary border-l5-border dark:border-dark-border hover:border-layer-primary'
                                }`}
                              >Fetch Many</button>
                            </div>
                            {config.fetchMode === 'collection' && (
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="layer-label text-text-muted mb-1 block">Limit</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={config.limit}
                                    onChange={e => updateConfig({limit: parseInt(e.target.value) || 10})}
                                    className="w-full bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-md px-3 py-1.5 text-xs font-medium text-text dark:text-white outline-none focus:border-layer-primary"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="layer-label text-text-muted mb-1 block">Sort</label>
                                  <select
                                    value={config.sortDirection}
                                    onChange={e => updateConfig({sortDirection: e.target.value as 'ASC' | 'DESC'})}
                                    className="w-full bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-md px-3 py-1.5 text-xs font-medium text-text dark:text-white outline-none focus:border-layer-primary appearance-none"
                                  >
                                    <option value="DESC">Newest</option>
                                    <option value="ASC">Oldest</option>
                                  </select>
                                </div>
                              </div>
                            )}
                            <div
                              onMouseDown={e => {
                                const active = document.querySelector('.gustav-canvas');
                                if (!active) return;
                                const rect = active.getBoundingClientRect();
                                const dropEvent = new DragEvent('dragstart', {bubbles: true, cancelable: true});
                                active.dispatchEvent(dropEvent);
                              }}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-layer-primary/10 hover:bg-layer-primary/20 border border-dashed border-layer-primary/30 rounded-md text-[0.625rem] font-bold uppercase text-layer-primary transition-colors cursor-pointer"
                              draggable
                              onDragStart={e => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                  type: 'library',
                                  componentName: 'DataSource',
                                  pluginName: '@gustav/core-plugin',
                                  defaultProps: {
                                    schemaSlug: slug,
                                    schemaName: schema.name,
                                    ...(config.fetchMode === 'single' ? {limit: 1} : {limit: config.limit}),
                                    sortDirection: config.sortDirection,
                                  },
                                }));
                              }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              {config.name || `Add ${schema.name}`}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-md bg-white dark:bg-dark-card border-2 border-layer-primary dark:border-layer-primary rounded-2xl animate-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-l5-border dark:border-dark-border bg-layer-primary text-white rounded-t-[calc(1rem-2px)]">
              <h3 className="text-base font-black uppercase tracking-tight">
                Page Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
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
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdatePage} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="layer-label text-text-secondary dark:text-text-secondary ml-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={pageSettings.title || ''}
                  onChange={e =>
                    setPageSettings({...pageSettings, title: e.target.value})
                  }
                  className="w-full bg-white dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold text-text dark:text-white outline-none focus:border-layer-primary focus: transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="layer-label text-text-secondary dark:text-text-secondary ml-1">
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
                  className="w-full bg-white dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold text-text dark:text-white outline-none focus:border-layer-primary focus: transition-all font-mono"
                />
              </div>
              <label className="flex items-center gap-3 p-4 bg-l1-bg/50 dark:bg-dark-surface border-2 border-l5-border dark:border-dark-border rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageSettings.showInNavigation}
                  onChange={e =>
                    setPageSettings({
                      ...pageSettings,
                      showInNavigation: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded-lg border-text-muted text-layer-primary focus:ring-layer-primary/30"
                />
                <span className="text-xs font-black text-text dark:text-dark-text uppercase tracking-tight">
                  Show in navigation
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-layer-primary text-white border-2 border-layer-primary font-black py-3.5 rounded-xl  transition-all hover:bg-blue-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase text-xs tracking-tight"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={handleDeletePage}
                  className="flex-1 bg-danger text-white border-2 border-danger font-black py-3.5 rounded-xl  transition-all hover:bg-red-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase text-xs tracking-tight"
                >
                  Delete Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  );
}

function TokenizedTextField({
  value,
  fields,
  multiline,
  onChange,
}: {
  value: unknown;
  fields: {name: string; label: string}[];
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const stringValue =
    value === undefined || value === null ? '' : String(value);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const currentValue = serializeTokenizedElement(editor);
    if (currentValue !== stringValue) {
      editor.innerHTML = renderTokenizedHtml(stringValue, fields);
    }
  }, [stringValue, fields]);

  const syncValue = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(serializeTokenizedElement(editor));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fieldName =
      event.dataTransfer.getData('application/x-gustav-field') ||
      event.dataTransfer.getData('text/plain').replace(/[{}]/g, '').trim();
    if (!fieldName) return;

    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    insertTokenChip(editor, fieldName, fields);
    onChange(serializeTokenizedElement(editor));
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={syncValue}
      onBlur={syncValue}
      onDragOver={event => event.preventDefault()}
      onDrop={handleDrop}
      className={`w-full text-sm font-bold text-text dark:text-white outline-none transition-all ${multiline ? 'min-h-28 whitespace-pre-wrap' : 'min-h-11 whitespace-pre-wrap'}`}
    />
  );
}

function renderTokenizedHtml(
  value: string,
  fields: {name: string; label: string}[]
): string {
  return escapeHtml(value).replace(
    /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g,
    (_, fieldName) => renderTokenChipHtml(fieldName, fields)
  );
}

function renderTokenChipHtml(
  fieldName: string,
  fields: {name: string; label: string}[]
): string {
  const field = fields.find(item => item.name === fieldName);
  const label = escapeHtml(field?.label || fieldName);
  const token = escapeHtml(fieldName);
  return `<span contenteditable="false" data-gustav-token="${token}" class="inline-flex items-center rounded-xl border-2 border-layer-primary/30 bg-layer-primary-light px-2 py-0.5 mx-0.5 text-[0.625rem] font-black uppercase tracking-tight text-layer-primary">${label}</span>`;
}

function serializeTokenizedElement(element: HTMLElement): string {
  const serializeNode = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (!(node instanceof HTMLElement)) {
      return '';
    }

    const token = node.dataset.gustavToken;
    if (token) {
      return `{{${token}}}`;
    }

    if (node.tagName === 'BR') {
      return '\n';
    }

    const children = Array.from(node.childNodes).map(serializeNode).join('');
    if (node.tagName === 'DIV' || node.tagName === 'P') {
      return `${children}\n`;
    }
    return children;
  };

  return Array.from(element.childNodes).map(serializeNode).join('');
}

function insertTokenChip(
  editor: HTMLElement,
  fieldName: string,
  fields: {name: string; label: string}[]
) {
  const selection = window.getSelection();
  const range =
    selection && selection.rangeCount > 0
      ? selection.getRangeAt(0)
      : document.createRange();

  if (!editor.contains(range.commonAncestorContainer)) {
    range.selectNodeContents(editor);
    range.collapse(false);
  }

  const wrapper = document.createElement('span');
  wrapper.innerHTML = `${renderTokenChipHtml(fieldName, fields)} `;
  const fragment = document.createDocumentFragment();
  while (wrapper.firstChild) {
    fragment.appendChild(wrapper.firstChild);
  }

  range.deleteContents();
  range.insertNode(fragment);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
