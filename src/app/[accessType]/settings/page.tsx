"use client";
import { useState } from "react";
import PersonalInfo from "./personalInfo";
import Security from "./security";

const SettingsPage = () => {
  const [formState, setFormState] = useState("personal");

  return (
    <div className="flex flex-col items-start gap-8">
      <div className="rounded-md border-[#E8E8E8] gap-8 border-1 flex flex-col py-9 px-8 w-full h-auto items-start justify-between">
        <div className="flex items-center gap-2">
          <img src={"/icons/settings.svg"} />
          <p className="text-green font-bold text-base">Settings</p>
        </div>
        <div className=" flex gap-0 w-full">
          <div
            onClick={() => setFormState("personal")}
            className={`flex items-center cursor-pointer ${
              formState === "personal"
                ? "text-green border-green"
                : "text-[#8A8A8A] border-[#EAEAEA]"
            } border-b-1  p-2 gap-2`}
          >
            <img src={"/icons/profile2.svg"} />
            <p className="font-medium text-xs">Personal Info</p>
          </div>
          <div
            onClick={() => setFormState("security")}
            className={`flex items-center cursor-pointer ${
              formState != "personal"
                ? "text-green border-green"
                : "text-[#8A8A8A] border-[#EAEAEA]"
            } p-2 gap-2 border-b-1 `}
          >
            <img src={"/icons/lock.svg"} />
            <p className=" font-medium text-xs">Security</p>
          </div>
        </div>
      </div>
      <div className="w-full">{formState === "personal" ? <PersonalInfo /> : <Security />}</div>
    </div>
  );
};

export default SettingsPage;
