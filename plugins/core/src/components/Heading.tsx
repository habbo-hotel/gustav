import React from 'react';

export interface HeadingProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const Heading: React.FC<HeadingProps> = ({
  text,
  level,
  align = 'left',
  editable,
  onPropChange,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const handleBlur = (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange('text', e.currentTarget.innerText);
    }
  };

  const sizeClasses = {
    1: 'text-5xl font-black tracking-tighter',
    2: 'text-4xl font-bold tracking-tight',
    3: 'text-3xl font-bold',
    4: 'text-2xl font-bold',
    5: 'text-xl font-bold',
    6: 'text-lg font-bold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Tag
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={handleBlur}
      className={`${sizeClasses[level]} ${alignClasses[align]} text-slate-900 dark:text-white my-4 outline-none ${
        editable
          ? 'hover:bg-indigo-50/50 focus:bg-indigo-50/50 rounded transition-colors cursor-text'
          : ''
      }`}
    >
      {text}
    </Tag>
  );
};
