import React from 'react';

export interface PeachCardProps {
  title: string;
  content: string;
  padding?: string;
  backgroundColor?: string;
  textColor?: string;
  shadow?: boolean;
  border?: boolean;
  accentColor?: string;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
  children?: React.ReactNode;
}

export const PeachCard: React.FC<PeachCardProps> = ({
  title,
  content,
  padding = 'md',
  backgroundColor,
  textColor,
  shadow = true,
  border = true,
  accentColor,
  editable,
  onPropChange,
  children,
}) => {
  const paddingMap: Record<string, string> = {
    none: '0',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
  };

  const handleBlur = (name: string) => (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange(name, e.currentTarget.innerText);
    }
  };

  return (
    <div
      className="gustav-peach-card rounded-2xl overflow-hidden"
      style={{
        padding: paddingMap[padding] || paddingMap.md,
        backgroundColor: backgroundColor || 'rgba(255,255,255,0.9)',
        color: textColor || 'inherit',
        boxShadow: shadow ? '0 4px 16px rgba(255,140,66,0.1)' : 'none',
        border: border ? '2px solid var(--color-l5-border, #E8D8C8)' : 'none',
        borderTopColor: accentColor || 'var(--color-primary, #FF8C42)',
        borderTopWidth: accentColor || border ? '3px' : '0',
      }}>
      {title && (
        <h3
          contentEditable={editable}
          suppressContentEditableWarning={editable}
          onBlur={handleBlur('title')}
          className={`font-bold text-lg mb-2 outline-none ${editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''}`}>
          {title}
        </h3>
      )}
      <div
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('content')}
        className={`text-sm leading-relaxed outline-none ${editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''}`}
        dangerouslySetInnerHTML={{__html: content}}
      />
      {children}
    </div>
  );
};