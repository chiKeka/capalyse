import React from "react";

interface AuthLayoutProps {
  title?: string;
  children: React.ReactNode;
  google_signtures?: boolean;
  sub_caption?: string;
  inputFieldSize?: string;
  layoutSize?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  children,
  google_signtures,
  sub_caption,
  inputFieldSize = "max-w-md ",
  layoutSize = "lg:max-w-2xl",
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-[#EEF6F4]  px-4">
      <div
        className={`w-full px-4 h-auto ${layoutSize} bg-white flex-col flex gap-8 rounded-4xl border border-[#EEF6F4]  items-center  py-10  shadow-lg`}
      >
        <img src="/logo.png" className="w-[199px] h-[47px]" />
        <div>
          <h2 className="text-xl font-bold text-[#2E3034]  text-center">
            {title}
          </h2>
          {sub_caption && (
            <p className="text-[#8A8A8A] text-center text-sm mt-2 font-normal">
              {sub_caption}
            </p>
          )}
        </div>

        {google_signtures && (
          <>
            <button className="max-w-md w-full rounded-lg  py-3 font-medium text-sm text-[#2E3034] items-center flex border-[0.5] border-[#829AD9] justify-center">
              <img /> Sign up with Google
            </button>
            <div className="flex w-full max-w-md gap-2 items-center justify-center ">
              <hr className="h-[0.5px] w-full bg-[#1261AC]" /> or
              <hr className="h-[0.5px] w-full bg-[#1261AC]" />
            </div>
          </>
        )}

        <div
          className={`w-full ${inputFieldSize} flex-col items-center justify-center flex`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
