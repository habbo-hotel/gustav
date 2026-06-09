import React from 'react';

export interface RichTextProps {
  content: string;
  editable?: boolean;
  onPropChange?: (name: string, value: any) => void;
}

export const RichText: React.FC<RichTextProps> = ({
  content,
  editable,
  onPropChange,
}) => {
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (editable && onPropChange) {
      onPropChange('content', e.currentTarget.innerHTML);
    }
  };

  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={handleBlur}
      className={`gustav-rich-text py-4 outline-none ${
        editable
          ? 'cursor-text'
          : ''
      }`}
      dangerouslySetInnerHTML={{__html: content}}
    />
  );
};
