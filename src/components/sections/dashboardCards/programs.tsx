import Button from '@/components/ui/Button';
import { CIcons } from '@/components/ui/CIcons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { updateProgramStatus } from '@/hooks/usePrograms';
import { formatDateRange } from '@/lib/uitils/fns';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Status enum
const STATUS_OPTIONS = [
  { value: 'publish', label: 'Publish' },
  { value: 'close', label: 'Close' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancel', label: 'Cancel' },
] as const;

type Props = {
  status?: 'active' | 'closed' | 'draft';
  program: any;
};

function Programs({ status = 'active', program }: Props) {
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const { mutateAsync: updateProgramStatusMutation } = updateProgramStatus(
    program.id
  );
  let bg = '#DCFCE7';
  let color = '#22C55E';

  if (program?.status === 'close') {
    color = '#A0A4A8';
    bg = '#E8E8E8';
  } else if (program?.status === 'draft') {
    color = '#FACC15';
    bg = '#FEF9C3';
  } else if (program?.status === 'published') {
    color;
    bg;
  } else if (program?.status === 'cancel') {
    color = '#DC3545';
    bg = '#E8E8E8';
  } else if (program?.status === 'completed') {
    color = '#007BFF';
    bg = '#E8E8E8';
  }

  const label = () => {
    if (program?.status === 'draft') {
      return 'Draft Program';
    } else if (program?.status === 'close') {
      return 'Applications Closed';
    } else if (program?.status === 'published') {
      return 'Open for Applications';
    } else if (program?.status === 'cancel') {
      return 'Cancelled';
    } else if (program?.status === 'completed') {
      return 'Completed';
    }
  };
  const router = useRouter();
  const params = useParams();
  const dateRange = `${program?.startDate} – ${program?.endDate}`;

  const handleStatusUpdate = (newStatus: string) => {
    updateProgramStatusMutation(newStatus, {
      onSuccess: () => {
        toast.success(`Program status updated to ${newStatus}`);
        setIsStatusPopoverOpen(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  return (
    <div className="w-full gap-1 rounded-[12px] md:min-h-[239px] h-auto p-6 flex flex-col justify-between border-1 border-[#E8E8E8]">
      <div
        className="flex items-center rounded-[40px] h-[28px] w-fit gap-3 p-2"
        style={{ backgroundColor: bg }}
      >
        <div
          className="rounded-full h-2 w-2 font-medium"
          style={{ backgroundColor: color }}
        />
        {(params.accessType === 'investor' || params.accessType === 'sme') &&
          label()}
        {(params.accessType === 'development' ||
          params.accessType === 'admin') && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="small"
                className="text-xs font-medium"
              >
                {label()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 bg-white border border-[#E8E8E8] rounded-[8px] shadow-lg">
              <div className="flex flex-col">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusUpdate(option.value)}
                    className="text-left px-3 py-2 text-xs font-normal text-[#0F2501] hover:bg-[#F5F5F5] rounded-[4px] transition-colors w-full first:rounded-t-[4px] last:rounded-b-[4px]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <p className="font-bold text-lg text-green">{program?.name}</p>
      <div className="flex items-center  gap-2">
        <img
          src="/icons/partnerBadge.png"
          className="max-h-4  h-auto w-auto max-w-4"
        />
        <div className="flex flex-wrap gap-2">
          Hosted by{' '}
          {program?.partners?.map((partner: any) => partner?.name).join(', ')}
        </div>
      </div>

      <p className="text-sm text-[#52575C] font-normal">
        {program?.description}
      </p>
      <div className="flex flex-col lg:flex-row justify-between gap-0">
        <div className="flex flex-wrap gap-4">
          {' '}
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/calendar.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {formatDateRange(dateRange as string)}
            </p>
          </div>
          <div className="flex w-fit gap-2 items-center">
            <img className="w-4 h-4" src="/icons/location.svg" />{' '}
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.eligibleCountries?.join(', ')}
            </p>
          </div>
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/star.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.smeStage?.join(', ')}
            </p>
          </div>
        </div>

        <div className="w-full items-end flex justify-end ">
          {(params.accessType === 'sme' ||
            params.accessType === 'investor') && (
            <Button
              onClick={() =>
                router.push(`/${params.accessType}/programs/${program.id}`)
              }
              variant="ghost"
              className="text-sm text-green hover:text-green font-bold "
            >
              Apply Now
            </Button>
          )}

          {params.accessType === 'development' && (
            <div>
              <Button
                onClick={() =>
                  router.push(`/${params.accessType}/programs/${program.id}`)
                }
                variant="ghost"
                className="text-green text-sm hover:text-green"
                size="small"
              >
                {CIcons.eye()}
                View
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`/${params.accessType}/programs/${program.id}`)
                }
                className="text-green text-sm hover:text-green"
                size="small"
              >
                {CIcons.edit()}
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Programs;
