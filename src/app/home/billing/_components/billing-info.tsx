"use client";

import { Card } from "@/components/ui/card";

type BillingInfoProps = {
  info: {
    name: string;
    email: string;
    address: string;
  };
};

export default function BillingInfo({ info }: BillingInfoProps) {
  return (
    <Card className="px-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-lg">Billing Information</div>
        <button className="border px-3 py-1 rounded text-sm hover:bg-gray-100">
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Name</div>
          <div className="font-medium">{info.name}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Email</div>
          <div className="font-medium">{info.email}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Address</div>
          <div className="font-medium whitespace-pre-line">{info.address}</div>
        </div>
      </div>
    </Card>
  );
}
