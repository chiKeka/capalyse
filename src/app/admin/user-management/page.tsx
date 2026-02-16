"use client";

import UserManagementTabContents from "@/components/pageComponents/UserManagementTabContents";

const tabs = [
  { label: "SMEs", key: "/admin/user-management" },
  { label: "Investors", key: "/admin/user-management/investor" },
  { label: "Development Organization", key: "/admin/user-management/dev" },
];

const UserManagement = () => {
  return (
    <main>
      <UserManagementTabContents type="SMEs" />
    </main>
  );
};

export default UserManagement;
