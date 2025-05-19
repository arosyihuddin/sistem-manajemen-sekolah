import React, { useEffect, useState } from 'react';
import { X as XMarkIcon } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    full: 'sm:max-w-[90%] sm:h-[90%]',
  };

  // Simple modal implementation without Headless UI
  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        onClick={closeOnClickOutside ? onClose : undefined}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div 
            className={`relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full ${
              sizeClasses[size]
            } ${size === 'full' ? 'flex flex-col max-h-full' : ''}`}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <div className={`${size === 'full' ? 'flex-grow overflow-auto' : ''} px-4 sm:px-6 py-2`}>
              {children}
            </div>
            {footer && (
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Modal };
export default Modal;