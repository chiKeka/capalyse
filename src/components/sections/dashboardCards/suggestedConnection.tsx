type Props = {};

function SuggestedConnection({}: Props) {
  return (
    <div className="items-center h-[46px] w-full  flex flex-row gap-4 justify-center">
      <div className="flex items-center  w-full gap-3">
        <img
          src="/icons/sportify.svg"
          className="h-[36px] w-[36px] rounded-full "
        />
        <div className="flex-col flex">
          <p className="font-bold text-[#18181B] text-sm">Name of Business</p>
          <div className="font-normal text-[#71717A] gap-2 items-center justify-center text-sm flex">
            <span>HealthTech </span>
            <span className="rounded-full w-1 h-1 bg-[#71717A]" />
            <span>Nigeria </span>
          </div>
        </div>
      </div>
      <p className="text-sm font-bold text-[#047857]">Connect</p>
    </div>
  );
}

export default SuggestedConnection;
