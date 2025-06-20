import Link from "next/link";

type Props = {
  children?: React.ReactNode;
  caption?: string;
  hasIcon?: boolean;
  icon?: any;
  link?: string;
  height?: string;
  linkName?: string;
};

function DashboardCardLayout({
  children,
  caption,
  hasIcon,
  height = "h-auto",
  link,
  linkName,
}: Props) {
  return (
    <div
      className={`w-full md:w-fit p-4 ${height} rounded-md border-1 items-center border-[#E4E4E7]`}
    >
      <div className="flex flex-row itmes-start justify-between">
        <p className="font-bold text-base text-[#18181B]">{caption}</p>
        {link && (
          <Link className=" text-green font-bold text-sm" href={link}>
            {linkName}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default DashboardCardLayout;
