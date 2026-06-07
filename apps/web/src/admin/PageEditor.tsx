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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v4m8-4v4M3 11h18" />
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
        className={`min-h-[100px] h-full transition-all rounded-xl group relative ${
          !isPreview && isOver
            ? 'bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500'
            : ''
        }`}
      >
        {children}
        {!isPreview && childrenCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl text-gray-300 dark:text-zinc-600 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-50/10">
            <svg
              className="w-5 h-5 mb-1 opacity-20 group-hover:opacity-40 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
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
            <span className="text-[9px] font-black uppercase tracking-widest">
              {getComponentDisplayId(component.id, allComponents)}
            </span>
          </div>
        )}

        {/* Overlay controls (Top Right Corner) */}
        {!isPreview && (
          <div
            className={`absolute top-2 right-2 flex items-center space-x-1 transition-opacity z-50 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <button
              onClick={handleRemove}
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
                  <div className="p-8 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-gray-300 dark:text-zinc-600">
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                      />
                    </svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">
                      Empty Container
                      <br />
                      Drag items here
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

// --- Drawer Component ---
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  isBlocking?: boolean;
}

const Drawer: React.FC<DrawerProps> = memo(
  ({isOpen, onClose, title, children, side = 'right', isBlocking = true}) => {
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
          ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-2 border-indigo-500 scale-[0.98]'
          : ''
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
        Your page has no components yet. Select a component from the library on
        the right to start building.
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
        className={`gustav-canvas transition-all duration-500 ease-in-out ${isPreview ? 'p-0 border-none' : 'bg-white dark:bg-zinc-900 shadow-2xl border-x border-gray-100 dark:border-zinc-800 min-h-full'}`}
      >
        <div
          className={`transition-all duration-500 ${isPreview ? 'p-0' : 'p-12'} ${!isPreview && isOver ? 'bg-indigo-50/20' : ''}`}
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
        className="pointer-events-none opacity-50 ring-2 ring-indigo-500 rounded-xl bg-white/80 dark:bg-zinc-900/80 shadow-2xl transition-[width] duration-150 ease-in-out overflow-hidden"
      >
        <div className="p-4 rounded-xl">
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

      let propsToUse = propsOverride || pluginComp.defaultProps;
      if (componentName === 'DataSource' && propsToUse.schemaSlug && !propsToUse.schemaName) {
        const schema = dynamicSchemas.find((s: any) => s.slug === propsToUse.schemaSlug);
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
            await handleAddComponent(componentName, undefined, undefined, undefined, propsOverride);
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

        const selectedComp = page?.components?.find(c => c.id === selectedComponentId);
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

    return levelPages.map(p => (
      <React.Fragment key={p.id}>
        <Link
          to={`/admin/pages/${p.id}`}
          onClick={e => e.stopPropagation()}
          style={{paddingLeft: `${level * 1.5 + 0.75}rem`}}
          className={`flex items-center space-x-3 p-2 rounded-xl transition-all relative ${p.id === page?.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
        >
          {level > 0 && (
            <div
              className="absolute left-2 w-px h-full bg-gray-100 dark:bg-zinc-800"
              style={{left: `${(level - 0.5) * 1.5 + 0.5}rem`}}
            />
          )}
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          <span className="text-xs font-bold truncate">{p.title}</span>
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
      <div key={field.name} className="mb-6">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
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
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
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

  const customCollisionDetection: CollisionDetection = useCallback((args) => {
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
      <div className="p-8 animate-pulse text-gray-400 font-bold uppercase tracking-widest text-sm">
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
        className="flex h-[calc(100vh-10rem)] bg-gray-50 dark:bg-zinc-950 -mx-6 -my-8 overflow-hidden"
      >
        {/* Column 1: Page Sidebar */}
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Pages
            </h2>
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
              {renderPageLinks()}
            </div>
          </div>
        </aside>

        {/* Column 2: Main Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Canvas Toolbar */}
          <div
            onClick={e => e.stopPropagation()}
            className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/pages"
                className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-sm font-black uppercase tracking-tighter text-gray-900 dark:text-white truncate max-w-[200px]">
                {page.title}
              </h1>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-50 dark:bg-zinc-800 rounded-xl p-1 border border-gray-100 dark:border-zinc-700">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeviceMode('mobile');
                    }}
                    className={`p-1.5 rounded-lg transition-all ${deviceMode === 'mobile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                    className={`p-1.5 rounded-lg transition-all ${deviceMode === 'tablet' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                    className={`p-1.5 rounded-lg transition-all ${deviceMode === 'desktop' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isPreview ? 'bg-indigo-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}
              >
                {isPreview ? 'Editor' : 'Preview'}
              </button>

              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1" />

              <button
                onClick={e => {
                  e.stopPropagation();
                  handlePublish();
                }}
                disabled={!isDirty && page.status === PageStatus.PUBLISHED}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg transition-all disabled:opacity-50 disabled:bg-gray-400"
              >
                Publish
              </button>
            </div>
          </div>

          {/* Actual Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950/50">
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
          className="w-80 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col shadow-sm"
        >
          {!selectedComponentId && (
            <div className="flex mx-3 my-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={e => { e.stopPropagation(); setSidebarTab('design'); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  sidebarTab === 'design'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-500 shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Design
              </button>
              <button
                onClick={e => { e.stopPropagation(); setSidebarTab('data'); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  sidebarTab === 'data'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-500 shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v4m8-4v4M3 11h18" />
                </svg>
                Data
              </button>
            </div>
          )}
          {selectedComponentId ? (
            /* Property Editor View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">
                    {getComponentDisplayId(
                      selectedComponentId,
                      page.components || []
                    )}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedComponentId(null)}
                  className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-indigo-500 transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={e => e.preventDefault()} className="space-y-2">
                  <div id="property-fields">
                    {pluginSchema?.map(field => renderPropertyField(field))}
                  </div>

                  <details className="group border-t border-gray-100 dark:border-zinc-800 pt-6 mt-6">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors">
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
                        className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-[10px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
                      />
                    </div>
                  </details>

                  {getDataSourceFields(selectedComponentId!).length > 0 && (
                    <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-6">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">
                        Data Fields
                      </label>
                      <p className="text-[9px] text-gray-400 mb-3 font-medium">
                        Drag fields into text areas above
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getDataSourceFields(selectedComponentId!).map(field => (
                          <button
                            key={field.name}
                            type="button"
                            draggable
                            onDragStart={e => {
                              e.dataTransfer.setData('application/x-gustav-field', field.name);
                              e.dataTransfer.setData('text/plain', `{{${field.name}}}`);
                            }}
                            className="cursor-grab active:cursor-grabbing rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300"
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : sidebarTab === 'design' ? (
            /* Component Library View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">
                  Library
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
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
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-sm font-black dark:text-white tracking-tight uppercase">Data Sources</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Schema Queries</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {dynamicSchemas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-gray-400 font-medium">No schemas defined yet.</p>
                  </div>
                ) : (
                  dynamicSchemas.map(schema => (
                    <DraggableLibraryComponent
                      key={schema.slug}
                      component={{
                        name: schema.name,
                        icon: 'data',
                        plugin: '@gustav/core-plugin',
                        defaultProps: { schemaSlug: schema.slug, schemaName: schema.name, limit: 10, sortDirection: 'DESC' },
                      }}
                    />
                  ))
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

      {/* Settings Modal (Less frequent, keeping as overlay) */}
      {showSettings && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black dark:text-white tracking-tight uppercase">
                Page Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-indigo-500 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdatePage} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={pageSettings.title || ''}
                  onChange={e =>
                    setPageSettings({...pageSettings, title: e.target.value})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
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
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
                />
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
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer uppercase tracking-tight"
                >
                  Show in navigation
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleDeletePage}
                className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest"
              >
                Delete Page
              </button>
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
      className={`w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all ${multiline ? 'min-h-28 whitespace-pre-wrap' : 'min-h-11 whitespace-pre-wrap'}`}
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
  return `<span contenteditable="false" data-gustav-token="${token}" class="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 mx-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">${label}</span>`;
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
