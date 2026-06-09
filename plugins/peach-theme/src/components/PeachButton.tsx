import React from 'react';

export interface PeachButtonProps {
  label: string;
  link?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const PeachButton: React.FC<PeachButtonProps> = ({
  label,
  link = '#',
  variant = 'primary',
  size = 'md',
  editable,
  onPropChange,
}) => {
  const sizeMap: Record<string, string> = {
    sm: '0.5rem 1.25rem',
    md: '0.75rem 1.75rem',
    lg: '1rem 2.5rem',
  };

  const fontSizeMap: Record<string, string> = {
    sm: '0.625rem',
    md: '0.75rem',
    lg: '0.875rem',
  };

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      borderRadius: '0.75rem',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      padding: sizeMap[size] || sizeMap.md,
      fontSize: fontSizeMap[size] || fontSizeMap.md,
      border: '2px solid transparent',
      cursor: 'pointer',
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: 'var(--color-primary, #FF8C42)',
          color: '#FFFFFF',
          borderColor: 'var(--color-primary-dark, #E67320)',
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: 'var(--color-primary-light, #FFF0E0)',
          color: 'var(--color-primary, #FF8C42)',
          borderColor: 'var(--color-l5-border, #E8D8C8)',
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: 'var(--color-primary, #FF8C42)',
          borderColor: 'var(--color-primary, #FF8C42)',
        };
      default:
        return base;
    }
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange('label', e.currentTarget.innerText);
    }
  };

  return (
    <a
      href={link}
      className="gustav-peach-button"
      style={getStyles()}
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={handleBlur}>
      {label}
    </a>
  );
};