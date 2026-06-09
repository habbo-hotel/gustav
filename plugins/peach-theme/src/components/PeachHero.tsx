import React from 'react';

export interface PeachHeroProps {
  title: string;
  subtitle: string;
  bgGradient?: string;
  textColor?: string;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const PeachHero: React.FC<PeachHeroProps> = ({
  title,
  subtitle,
  bgGradient,
  textColor = '#FFFFFF',
  editable,
  onPropChange,
}) => {
  const handleBlur = (name: string) => (e: React.FocusEvent<any>) => {
    if (editable && onPropChange) {
      onPropChange(name, e.currentTarget.innerText);
    }
  };

  const gradient = bgGradient || 'linear-gradient(135deg, #FF8C42 0%, #FF6B6B 100%)';

  return (
    <div className="gustav-peach-hero py-20 px-6 text-center" style={{background: gradient}}>
      <h1
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('title')}
        className={`text-5xl font-black outline-none ${editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''}`}
        style={{color: textColor}}>
        {title}
      </h1>
      <p
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        onBlur={handleBlur('subtitle')}
        className={`text-xl mt-4 outline-none ${editable ? 'hover:bg-black/5 focus:bg-black/5 rounded transition-colors' : ''}`}
        style={{color: textColor, opacity: 0.9}}>
        {subtitle}
      </p>
    </div>
  );
};