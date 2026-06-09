import React, {useEffect} from 'react';
import styled from '@emotion/styled';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap: Record<string, string> = {sm: 'max-width: 28rem', md: 'max-width: 32rem', lg: 'max-width: 42rem', xl: 'max-width: 56rem'};

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
`;

const Backdrop = styled.div`
  position: absolute; inset: 0;
  background: rgba(45, 43, 61, 0.15);
  backdrop-filter: blur(2px);
  @media (prefers-color-scheme: dark) { background: rgba(0, 0, 0, 0.3); }
`;

const ModalRoot = styled.div<{modalSize: string}>`
  position: relative; width: 100%;
  ${props => sizeMap[props.modalSize]}
  background-color: #ffffff;
  border: 1px solid #d4cec6;
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  max-height: 85vh; display: flex; flex-direction: column;
  @media (prefers-color-scheme: dark) {
    background-color: #1c2234; border-color: #283048;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
`;

const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #d4cec6;
  @media (prefers-color-scheme: dark) { border-bottom-color: #283048; }
`;

const ModalTitle = styled.h2`
  font-size: 1.125rem; font-weight: 800; letter-spacing: -0.01em;
  color: #1a1a22;
  @media (prefers-color-scheme: dark) { color: #e0e2e8; }
`;

const ModalSubtitle = styled.p`
  font-size: 0.8125rem; color: #5a5650; margin-top: 0.125rem;
  @media (prefers-color-scheme: dark) { color: #9a9ca8; }
`;

const CloseButton = styled.button`
  width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;
  background: #f8f7fa; border-radius: 0.5rem; color: #5a5650;
  transition: all 0.15s; border: none; cursor: pointer;
  &:hover { background: #d4cec6; color: #1a1a22; }
  @media (prefers-color-scheme: dark) {
    background: #283048; color: #9a9ca8;
    &:hover { background: #4a4a6a; color: #e0e2e8; }
  }
`;

const ModalBody = styled.div`flex: 1; overflow-y: auto; padding: 1.5rem;`;

const ModalFooter = styled.div`
  display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #d4cec6;
  background-color: #f5f2ed;
  border-radius: 0 0 calc(0.75rem - 1px) calc(0.75rem - 1px);
  @media (prefers-color-scheme: dark) {
    border-top-color: #283048; background-color: #141a28;
  }
`;

export function Modal({open, onClose, title, subtitle, children, footer, size = 'md'}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <Overlay>
      <Backdrop onClick={onClose} />
      <ModalRoot modalSize={size}>
        <ModalHeader>
          <div>
            <ModalTitle>{title}</ModalTitle>
            {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
          </div>
          <CloseButton onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalRoot>
    </Overlay>
  );
}
