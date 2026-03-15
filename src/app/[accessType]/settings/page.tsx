"use client";
import { useState } from "react";
import { Bell, Lock, Settings, Shield, SlidersHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalInfo from "./personalInfo";
import Security from "./security";
import NotificationsSettings from "./notifications";
import PrivacySettingsTab from "./privacy";
import PreferencesSettings from "./preferences";

type SettingsTab = "personal" | "security" | "notifications" | "privacy" | "preferences";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal");

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalInfo />;
      case "security":
        return <Security />;
      case "notifications":
        return <NotificationsSettings />;
      case "privacy":
        return <PrivacySettingsTab />;
      case "preferences":
        return <PreferencesSettings />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="flex flex-col items-start gap-8">
      <div className="rounded-md border-[#E8E8E8] gap-8 border-1 flex flex-col py-9 px-8 w-full h-auto items-start justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#008060]" />
          <p className="text-green font-bold text-base">Settings</p>
        </div>
        <div className="flex gap-0 w-full overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center cursor-pointer whitespace-nowrap border-b-2 p-2 gap-2 transition-colors duration-200",
                  isActive
                    ? "text-green border-green"
                    : "text-[#8A8A8A] border-[#EAEAEA] hover:text-[#008060]/70",
                )}
              >
                <Icon className="w-4 h-4" />
                <p className="font-medium text-xs">{tab.label}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full">{renderContent()}</div>
    </div>
  );
};

export default SettingsPage;
