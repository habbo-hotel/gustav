import React from 'react';
import styled from '@emotion/styled';

type Accent = 'primary' | 'mint' | 'coral' | 'amber' | 'pink' | 'lavender' | 'none';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
  onClick?: () => void;
  hover?: boolean;
}

const accentColors: Record<string, string> = {
  primary: '#121f3d', mint: '#4a7a5a', coral: '#a85a5a', amber: '#a88a4a', pink: '#a85a5a', lavender: '#121f3d',
};

const CardRoot = styled.div<{accent: Accent; isHover: boolean; clickable: boolean}>`
  background-color: #f8f5f0;
  border: 1px solid #d4cec6;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  ${props => props.accent !== 'none' && `border-top: 3px solid ${accentColors[props.accent]};`}
  ${props => props.isHover && '&:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }'}
  ${props => props.clickable ? 'cursor: pointer;' : ''}
  transition: all 0.15s ease;

  @media (prefers-color-scheme: dark) {
    background-color: var(--color-dark-card);
    border-color: var(--color-dark-border);
    ${props => props.isHover && '&:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }'}
  }
`;

export function Card({children, className, accent = 'none', onClick, hover = false}: CardProps) {
  return <CardRoot accent={accent} isHover={hover} clickable={!!onClick} className={className} onClick={onClick}>{children}</CardRoot>;
}

const CardHeaderRoot = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #d4cec6;
  @media (prefers-color-scheme: dark) { border-bottom-color: var(--color-dark-border); }
`;

export function CardHeader({children, className}: {children: React.ReactNode; className?: string}) {
  return <CardHeaderRoot className={className}>{children}</CardHeaderRoot>;
}

const CardBodyRoot = styled.div`padding: 1.5rem;`;

export function CardBody({children, className}: {children: React.ReactNode; className?: string}) {
  return <CardBodyRoot className={className}>{children}</CardBodyRoot>;
}
