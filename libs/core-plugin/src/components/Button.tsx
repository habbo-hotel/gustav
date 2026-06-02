import React from 'react';

export interface ButtonProps {
  label: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  link,
  variant = 'primary',
  size = 'md',
  editable,
  onPropChange,
}) => {
  const handleBlur = (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange('label', e.currentTarget.innerText);
    }
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border-2 border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <div className="py-4">
      <a
        href={editable ? undefined : link}
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur}
        className={`inline-block font-bold rounded-xl transition-all active:scale-95 outline-none ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${
          editable ? 'cursor-text focus:ring-2 focus:ring-indigo-500/50' : ''
        }`}
      >
        {label}
      </a>
    </div>
  );
};
