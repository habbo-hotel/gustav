import React from 'react';
import styled from '@emotion/styled';

type BadgeVariant = 'published' | 'draft' | 'archived' | 'admin' | 'user' | 'active' | 'installed' | 'plugin' | 'internal';

interface BadgeProps { variant: BadgeVariant; children: React.ReactNode; dot?: boolean; }

const variantStyles: Record<BadgeVariant, {bg: string; text: string; border: string; dotColor: string}> = {
  published: { bg: '#eaf2ec', text: '#4a9e4a', border: '#c5e8c5', dotColor: '#4a7a5a' },
  draft: { bg: '#f8f2e6', text: '#c49a3a', border: '#f5e0b8', dotColor: '#a88a4a' },
  archived: { bg: '#f5f3f0', text: '#5a5650', border: '#d4cec6', dotColor: '#8a8680' },
  admin: { bg: '#f5ecec', text: '#c05a5a', border: '#f5c5c5', dotColor: '#a85a5a' },
  user: { bg: '#e6eaf2', text: '#5a6ac0', border: '#c5ccf5', dotColor: '#121f3d' },
  active: { bg: '#eaf2ec', text: '#4a9e4a', border: '#c5e8c5', dotColor: '#4a7a5a' },
  installed: { bg: '#f5f3f0', text: '#5a5650', border: '#d4cec6', dotColor: '#8a8680' },
  plugin: { bg: '#f8f2e6', text: '#c49a3a', border: '#f5e0b8', dotColor: '#a88a4a' },
  internal: { bg: '#f5f0fe', text: '#8a7ac0', border: '#d5ccf5', dotColor: '#121f3d' },
};

const BadgeRoot = styled.span<{variant: BadgeVariant}>`
  display: inline-flex; align-items: center; gap: 0.375rem;
  font-size: 0.625rem; font-weight: 800; text-transform: uppercase;
  padding: 0.25rem 0.625rem; border-radius: 0.375rem; border: 1px solid;
  background-color: ${props => variantStyles[props.variant].bg};
  color: ${props => variantStyles[props.variant].text};
  border-color: ${props => variantStyles[props.variant].border};
`;

const Dot = styled.span<{variant: BadgeVariant}>`
  width: 0.5rem; height: 0.5rem; border-radius: 50%;
  background-color: ${props => variantStyles[props.variant].dotColor};
`;

export function Badge({variant, children, dot = false}: BadgeProps) {
  return (
    <BadgeRoot variant={variant}>
      {dot && <Dot variant={variant} />}
      {children}
    </BadgeRoot>
  );
}
