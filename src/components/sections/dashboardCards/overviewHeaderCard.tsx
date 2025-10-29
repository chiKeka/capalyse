import Button, { ButtonProps } from '@/components/ui/Button';
import StraightBar from '@/components/ui/straightBar';
import { useRouter } from 'next/navigation';

type Props = {
  value: number;
  link: string;
  user: { name: string };
  textContent?: string;
  showProgress?: boolean;
  showButton?: boolean;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'tertiary';
  buttonProps?: Partial<ButtonProps>;
};

export function OverviewHeaderCard({
  value,
  link,
  user,
  showProgress,
  textContent = 'Here’s a snapshot of your progress.',
  showButton = false,
  buttonText = 'Complete Profile',
  buttonProps,
}: Props) {
  const router = useRouter();
  // console.log({ value });
  return (
    <div className="justify-between my-4 flex max-w-full">
      <div className="">
        <p className="lg:text-4xl text-2xl font-bold ">Hi {user?.name} 👋</p>
        <p className="text-base font-normal">{textContent}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 justify-end items-center w-[40%]">
        {showProgress && (
          <div className="w-full flex flex-1 flex-col ">
            <div className="items-center w-full text-xs font-normal text-[#18181B] flex justify-between">
              <p>Progress</p>
              <p>{value}%</p>
            </div>

            <StraightBar value={value} />
          </div>
        )}
        {showButton && (
          <Button
            className="flex-1"
            {...(buttonProps || {})}
            onClick={() => router.push(link)}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

export function overviewHeaderCard({}: Props) {
  return <div>overviewHeaderCard</div>;
}
