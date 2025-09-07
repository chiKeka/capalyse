'use client';

import AssessmentReadiness from '@/components/sections/AssessmentReadiness';
// import AssessmentReadiness from '@/components/sections/ReadinessAssessment';
import Button from '@/components/ui/Button';
import { useState } from 'react';

const Test = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="min-h-[40vh] flex items-center justify-center">
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
      </div>
      <AssessmentReadiness isOpen={open} setIsOpen={setOpen} />
    </div>
  );
};

export default Test;
