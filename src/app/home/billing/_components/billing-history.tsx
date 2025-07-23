"use client";

import { Card } from "@/components/ui/card";

type BillingHistoryItem = {
  id: number;
  plan: string;
  date: string;
  amount: number;
  status: string;
};

type BillingHistoryProps = {
  history: BillingHistoryItem[];
};

export default function BillingHistory({ history }: BillingHistoryProps) {
  return (
    <Card className="px-6">
      <div className="font-semibold text-lg mb-4">Billing History</div>
      <div>
        {history.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between py-3${
              idx !== history.length - 1 ? " border-b border-gray-200" : ""
            }`}
          >
            <div>
              <div className="font-medium">{item.plan}</div>
              <div className="text-xs text-muted-foreground">{item.date}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${item.amount.toFixed(2)}</div>
              <div className="text-xs text-green-700">{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
