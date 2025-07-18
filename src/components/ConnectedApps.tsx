import React from "react";

interface ConnectedApp {
  id: number;
  name: string;
  status: string;
}

export default function ConnectedApps({ apps }: { apps: ConnectedApp[] }) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Connected Apps</h2>
      <div className="flex flex-col gap-2 mb-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between bg-gray-50 rounded p-3"
          >
            <div>
              <div className="font-medium">{app.name}</div>
              <div className="text-xs text-gray-500">{app.status}</div>
            </div>
            <button className="btn">Disconnect</button>
          </div>
        ))}
      </div>
      <button className="btn w-full">+ Connect New App</button>
    </section>
  );
}
