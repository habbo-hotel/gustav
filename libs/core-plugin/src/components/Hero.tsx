import React from 'react';

export interface HeroProps {
  title: string;
  subtitle: string;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  editable,
  onPropChange,
}) => {
  const handleBlur = (name: string) => (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange(name, e.currentTarget.innerText);
    }
  };

  return (
    <div className="gustav-hero bg-slate-100 p-12 rounded-lg text-center my-8">
      <h1
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('title')}
        className={`text-4xl font-bold text-slate-900 outline-none ${
          editable ? 'hover:bg-indigo-50/50 focus:bg-indigo-50/50 rounded transition-colors' : ''
        }`}
      >
        {title}
      </h1>
      <p
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('subtitle')}
        className={`text-xl text-slate-600 mt-4 outline-none ${
          editable ? 'hover:bg-indigo-50/50 focus:bg-indigo-50/50 rounded transition-colors' : ''
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
};
