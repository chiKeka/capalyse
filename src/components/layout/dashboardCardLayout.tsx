import Image from "next/image";
import Link from "next/link";

type Props = {
  children?: React.ReactNode;
  caption?: string;
  icon?: any;
  link?: string;
  height?: string;
  linkName?: string;
};

function DashboardCardLayout({
  children,
  caption,
  icon,
  height = "h-auto",
  link,
  linkName,
}: Props) {
  return (
    <div className={`w-full p-4 ${height} rounded-md border-1 items-center border-[#E4E4E7]`}>
      <div className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && <Image src={icon} alt="icon" width={20} height={20} />}
          <p className="font-bold text-base text-[#18181B]">{caption}</p>
        </div>
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
