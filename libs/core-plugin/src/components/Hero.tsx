import React from 'react';

export interface HeroProps {
  title: string;
  subtitle: string;
  bgColor?: string;
  textColor?: string;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  bgColor = '#f1f5f9',
  textColor = '#0f172a',
  editable,
  onPropChange,
}) => {
  const handleBlur = (name: string) => (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange(name, e.currentTarget.innerText);
    }
  };

  return (
    <div 
      className="gustav-hero p-12 rounded-lg text-center my-8"
      style={{ backgroundColor: bgColor }}
    >
      <h1
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('title')}
        className={`text-4xl font-bold outline-none ${
          editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''
        }`}
        style={{ color: textColor }}
      >
        {title}
      </h1>
      <p
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('subtitle')}
        className={`text-xl mt-4 outline-none ${
          editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''
        }`}
        style={{ color: textColor, opacity: 0.8 }}
      >
        {subtitle}
      </p>
    </div>
  );
};
