"use client";

import { ProfileInfo } from "@/components/ProfileInfo";
import { SecurityPrivacy } from "@/components/SecurityPrivacy";
import { DangerZone } from "@/components/DangerZone";
// import Preferences from "@/components/account/Preferences";
// import ConnectedApps from "@/components/account/ConnectedApps";

export default function AccountPage() {
  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
          Account Settings
        </h1>
        <p className="text-background text-lg mb-6">
          Manage your account preferences and profile information
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid gap-6">
          <ProfileInfo />
          <SecurityPrivacy />
          {/* <Preferences /> */}
          {/* <ConnectedApps /> */}
          <DangerZone />
        </div>
      </div>
    </>
  );
}
