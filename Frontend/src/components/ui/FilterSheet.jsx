import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from './button';

export function FilterSheet({ children, triggerText = "Filters", badgeCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="flex sm:hidden items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-sm text-slate-700 dark:text-slate-300 font-medium">
          <SlidersHorizontal size={16} />
          {triggerText}
          {badgeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {badgeCount}
            </span>
          )}
        </button>
      </DialogPrimitive.Trigger>
      
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050811] p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <DialogPrimitive.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Filters
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 pb-6 flex flex-col gap-4">
            {children}
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Button variant="default" className="w-full" onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
