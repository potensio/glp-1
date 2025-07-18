import React from "react";

interface PreferencesProps {
  emailNotifications: boolean;
  smsNotifications: boolean;
  timeZone: string;
}
import { Card } from "./ui/card";

export default function Preferences({
  preferences,
}: {
  preferences: PreferencesProps;
}) {
  return (
    <Card className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Preferences</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Email Notifications</div>
            <div className="text-xs text-gray-500">
              Receive updates about your health data
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            readOnly
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">SMS Notifications</div>
            <div className="text-xs text-gray-500">
              Get reminders via text message
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.smsNotifications}
            readOnly
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Data Export</div>
            <div className="text-xs text-gray-500">
              Download your health data
            </div>
          </div>
          <button className="btn">Export Data</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Time Zone</div>
            <div className="text-xs text-gray-500">{preferences.timeZone}</div>
          </div>
          <button className="btn">Change</button>
        </div>
      </div>
    </Card>
  );
}
