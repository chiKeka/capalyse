type Props = {};

function MatchedInvetors({}: Props) {
  return (
    <div className="items-center lg:max-w-[389px] h-[46px] w-full md:w-[389px] flex flex-row gap-4 justify-center">
      <div className="flex items-center  w-full gap-3">
        <img src="/images/investorSingular.svg" className="h-[36px] w-[36px] rounded-full " />
        <div className="flex-col flex">
          <p className="font-bold text-[#18181B] text-sm">Jenny WillSon</p>
          <p className="font-normal text-[#18181B] text-sm">Angel Investor</p>
        </div>
      </div>
      <img src="/icons/messageText.svg" className="h-[24px] w-[24px] rounded-full " />
    </div>
  );
}

export default MatchedInvetors;
