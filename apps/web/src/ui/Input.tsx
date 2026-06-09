import React from 'react';
import styled from '@emotion/styled';

const FieldRoot = styled.div`display: flex; flex-direction: column; gap: 0.375rem;`;

const Label = styled.label`
  font-weight: 700; font-size: 0.6875rem; letter-spacing: 0.04em; text-transform: uppercase;
  color: #5a5650; margin-left: 0.25rem;
  @media (prefers-color-scheme: dark) { color: #9a9ca8; }
`;

const fieldBase = `
  width: 100%;
  background-color: #ffffff;
  border: 1.5px solid #d4cec6;
  border-radius: 0.625rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a22;
  outline: none;
  transition: all 0.15s ease;
  font-family: 'Nunito', sans-serif;

  &:focus { border-color: #121f3d; box-shadow: 0 0 0 3px rgba(26,58,106,0.12); }
  &::placeholder { color: #8a8680; }

  @media (prefers-color-scheme: dark) {
    background-color: #141a28;
    border-color: #283048;
    color: #e0e2e8;
    &::placeholder { color: #5a5650; }
    &:focus { border-color: #121f3d; box-shadow: 0 0 0 3px rgba(26,58,106,0.15); }
  }
`;

const StyledInput = styled.input`${fieldBase}`;
const StyledSelect = styled.select`${fieldBase} appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%238b88a0' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 0.875rem; padding-right: 2.25rem;`;
const StyledTextarea = styled.textarea`${fieldBase} min-height: 6rem; resize: vertical;`;
const ErrorText = styled.p`font-size: 0.625rem; font-weight: 700; color: #a85a5a; margin-left: 0.25rem;`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({label, error, className, ...props}, ref) => (
  <FieldRoot>
    {label && <Label>{label}</Label>}
    <StyledInput ref={ref} className={className} {...props} />
    {error && <ErrorText>{error}</ErrorText>}
  </FieldRoot>
));

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; }
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({label, error, className, children, ...props}, ref) => (
  <FieldRoot>
    {label && <Label>{label}</Label>}
    <StyledSelect ref={ref} className={className} {...props}>{children}</StyledSelect>
    {error && <ErrorText>{error}</ErrorText>}
  </FieldRoot>
));

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; }
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({label, error, className, ...props}, ref) => (
  <FieldRoot>
    {label && <Label>{label}</Label>}
    <StyledTextarea ref={ref} className={className} {...props} />
    {error && <ErrorText>{error}</ErrorText>}
  </FieldRoot>
));
