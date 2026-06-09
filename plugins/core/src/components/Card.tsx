import React, {ReactNode, useState, useRef, useCallback, useEffect} from 'react';

export interface CardProps {
  title?: string;
  content?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  backgroundColor?: string;
  textColor?: string;
  children?: ReactNode;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  content,
  padding = 'md',
  shadow = true,
  border = true,
  backgroundColor,
  textColor,
  children,
  editable,
  onPropChange,
}) => {
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingHeader && headerRef.current) {
      headerRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(headerRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingHeader]);

  useEffect(() => {
    if (editingBody && bodyRef.current) {
      bodyRef.current.focus();
    }
  }, [editingBody]);

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const style: React.CSSProperties = {};
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (textColor) style.color = textColor;

  const handleHeaderBlur = useCallback(() => {
    if (editable && onPropChange && headerRef.current) {
      onPropChange('title', headerRef.current.innerText);
    }
    setEditingHeader(false);
  }, [editable, onPropChange]);

  const handleBodyBlur = useCallback(() => {
    if (editable && onPropChange && bodyRef.current) {
      onPropChange('content', bodyRef.current.innerHTML);
    }
    setEditingBody(false);
  }, [editable, onPropChange]);

  return (
    <div
      style={style}
      className={`rounded-xl flex flex-col w-full h-full ${
        !backgroundColor ? 'bg-[#161c30]' : ''
      } ${
        shadow ? 'shadow-sm hover:shadow-md transition-shadow' : ''
      } ${border ? 'border border-[#222a40]' : ''} ${paddingClasses[padding]}`}
    >
      {(title || editable) && (
        <h3
          ref={headerRef}
          contentEditable={editingHeader}
          suppressContentEditableWarning
          onDoubleClick={() => editable && setEditingHeader(true)}
          onBlur={handleHeaderBlur}
          className={`text-xl font-semibold mb-4 outline-none transition-colors text-white ${
            editingHeader
              ? 'ring-2 ring-blue-300 rounded px-1 -mx-1 cursor-text'
              : editable
                ? 'hover:bg-white/5 rounded px-1 -mx-1 cursor-pointer'
                : ''
          }`}
        >
          {title || (editable ? 'Double-click to add title' : '')}
        </h3>
      )}
      <div className="flex-1 flex flex-col text-white/80">
        {(content || editable) && (
          <div
            ref={bodyRef}
            contentEditable={editingBody}
            suppressContentEditableWarning
            onDoubleClick={() => editable && setEditingBody(true)}
            onBlur={handleBodyBlur}
            className={`flex-1 outline-none gustav-card-body transition-colors ${
              editingBody
                ? 'ring-2 ring-blue-300 rounded px-1 -mx-1 cursor-text'
                : editable
                  ? 'hover:bg-white/5 rounded px-1 -mx-1 cursor-pointer'
                  : ''
            }`}
            dangerouslySetInnerHTML={{__html: content || (editable ? '<p>Double-click to edit body text</p>' : '')}}
          />
        )}
        {children}
      </div>
    </div>
  );
};