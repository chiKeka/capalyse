type Props = {
  status?: "active" | "closed" | "pending";
  label?: string;
  program: any;
};

function Programs({ status = "active", label, program }: Props) {
  let bg = "#DCFCE7";
  let color = "#22C55E";

  if (status === "closed") {
    color = "#A0A4A8";
    bg = "#E8E8E8";
  } else if (status === "pending") {
    color = "#FACC15";
    bg = "#FEF9C3";
  }
  return (
    <div className="w-full gap-1 rounded-[12px] md:min-h-[239px] h-auto p-6 flex flex-col justify-between border-1 border-[#E8E8E8]">
      <div
        className={`flex items-center rounded-[40px] h-[28px] w-fit gap-3 p-2 bg-[${bg}]`}
      >
        <div className={`rounded-full h-2 w-2 bg-[${color}]`} />
        {label}
      </div>
      <p className="font-bold text-lg text-green">{program?.name}</p>
      <p>{program?.organization?.organizationName}</p>
      <p className="text-sm text-[#52575C] font-normal">
        {program?.description}
      </p>
      <div className="flex flex-col gap-0">
        <div className="flex flex-wrap gap-4">
          {" "}
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/calendar.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.startDate} – {program?.endDate}
            </p>
          </div>
          <div className="flex w-fit gap-2 items-center">
            <img className="w-4 h-4" src="/icons/location.svg" />{" "}
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.eligibleCountries?.join(", ")}
            </p>
          </div>
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/star.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.smeStage?.join(", ")}
            </p>
          </div>
        </div>

        <div className="w-full items-end flex justify-end ">
          <p className="text-sm text-green font-bold ">Apply Now</p>
        </div>
      </div>
    </div>
  );
}

export default Programs;
