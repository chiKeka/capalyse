'use client';
import Button from '../ui/Button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
} from '../ui/dialog';

import { useCreateWaitlist, useWaitlistCount } from '@/hooks/waitlistQueries';
import { DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { useState } from 'react';
import Input from '../ui/Inputs';

interface FundingWarningProps {
  title: string;
  desc: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Waitlist({
  title,
  desc,
  isOpen,
  setIsOpen,
}: FundingWarningProps) {
  const { data: count, isLoading } = useWaitlistCount();
  const { mutate: joinWaitlist, isPending } = useCreateWaitlist();
  const [email, setEmail] = useState('');
  const handleJoin = () => {
    if (email) joinWaitlist({ email });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay className="bg-white/10 !backdrop-blur-[10px]" />
        <DialogContent
          data-slot="dialog-content"
          className={
            'bg-white rounded-xl max-w-[calc(100%-1.5rem)] lg:max-w-3xl md:max-w-xl p-8 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] border border-[#DEDEDE] shadow-lg duration-200 '
          }
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="w-full flex flex-col">
            <div className="space-y-10  w-full md:space-y-12 text-start flex flex-col items-start">
              <div className="max-w-xl">
                <p className=" text-2xl font-bold text-[#282828] mb-5">
                  {title}
                </p>
                <div className="mt-2">
                  <p className=" text-[#282828] font-normal text-base ">
                    {desc}
                  </p>
                </div>
              </div>
              <div className=" w-full md:h-[50px] gap-3  items-center md:flex ">
                <div className="w-full">
                  <Input
                    className="w-full flex-1 block h-[48px]"
                    type="email"
                    placeholder="Your Email Address"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <DialogClose>
                  <Button
                    variant="primary"
                    className="text-base px-12 w-fit h-[48px] capitalize mb-4"
                    onClick={handleJoin}
                    disabled={isPending}
                  >
                    {isPending ? 'Submitting...' : 'Submit'}
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogDescription>
          <div className="mt-6 flex gap-2 items-center">
            <img src="/images/whitelist.png" className="h-[32px]" />
            <p className="font-normal text-base">
              Join the {count?.count}+ others that have signed up
            </p>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
