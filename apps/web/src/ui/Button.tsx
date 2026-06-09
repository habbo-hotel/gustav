import React from 'react';
import styled from '@emotion/styled';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

function getVariantStyle(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: '#121f3d',
        color: '#ffffff',
        borderColor: '#121f3d',
        boxShadow: '0 2px 4px rgba(26,58,106,0.15)',
        '&:hover:not(:disabled)': {backgroundColor: '#0a1530'},
      };
    case 'secondary':
      return {
        backgroundColor: '#ffffff',
        color: '#1a1a22',
        borderColor: '#d4cec6',
        '&:hover:not(:disabled)': {backgroundColor: '#f8f7fa'},
        '@media (prefers-color-scheme: dark)': {
          backgroundColor: '#1c2234',
          color: '#e0e2e8',
          borderColor: '#283048',
          '&:hover:not(:disabled)': {backgroundColor: '#222840'},
        },
      };
    case 'danger':
      return {
        backgroundColor: '#a85a5a',
        color: '#ffffff',
        borderColor: '#a85a5a',
        '&:hover:not(:disabled)': {backgroundColor: '#e06a6a'},
      };
    case 'success':
      return {
        backgroundColor: '#4a7a5a',
        color: '#ffffff',
        borderColor: '#4a7a5a',
        '&:hover:not(:disabled)': {backgroundColor: '#6ab869'},
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: '#5a5650',
        borderColor: 'transparent',
        '&:hover:not(:disabled)': {backgroundColor: '#f8f7fa'},
        '@media (prefers-color-scheme: dark)': {
          color: '#9a9ca8',
          '&:hover:not(:disabled)': {backgroundColor: '#1c2234'},
        },
      };
  }
}

function getSizeStyle(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        fontSize: '0.625rem',
        fontWeight: 800,
        textTransform: 'uppercase' as const,
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        gap: '0.375rem',
      };
    case 'md':
      return {
        fontSize: '0.75rem',
        fontWeight: 800,
        textTransform: 'uppercase' as const,
        padding: '0.625rem 1.25rem',
        borderRadius: '0.625rem',
        gap: '0.5rem',
      };
    case 'lg':
      return {
        fontSize: '0.875rem',
        fontWeight: 800,
        textTransform: 'uppercase' as const,
        padding: '0.875rem 1.75rem',
        borderRadius: '0.75rem',
        gap: '0.625rem',
      };
  }
}

const StyledButton = styled.button<{$variant: ButtonVariant; $size: ButtonSize}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-width: 1.5px;
  border-style: solid;
  transition: all 0.15s ease;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  line-height: 1;

  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }

  ${props => getVariantStyle(props.$variant)}
  ${props => getSizeStyle(props.$size)}
`;

export function Button({variant = 'primary', size = 'md', loading = false, icon, children, className, ...props}: ButtonProps) {
  return (
    <StyledButton $variant={variant} $size={size} className={className} {...props}>
      {loading ? (
        <span css={{width: '1rem', height: '1rem', borderWidth: '2px', borderStyle: 'solid', borderColor: 'currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
      ) : icon ? (
        <span css={{width: '1rem', height: '1rem', flexShrink: 0, display: 'flex'}}>{icon}</span>
      ) : null}
      {children}
    </StyledButton>
  );
}
