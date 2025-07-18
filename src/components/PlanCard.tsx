import React from "react";
import { Button } from "./ui/button";

type PlanCardProps = {
  plan: {
    name: string;
    description: string;
    price: number;
    status: string;
    nextBilling: string;
    features: string[];
  };
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4 border">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-2xl font-semibold flex items-center gap-2 mb-1">
            {plan.name}
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
              {plan.status}
            </span>
          </div>
          <div className="text-muted-foreground text-sm mb-2">
            {plan.description}
          </div>
          {/* <ul className="text-sm mb-2 list-disc list-inside text-gray-700">
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul> */}
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">
            ${plan.price.toFixed(2)}
            <span className="font-medium text-base text-muted-foreground">
              /mo
            </span>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Next billing: {plan.nextBilling}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant={"outline"} size={"sm"} className="h-11 text-sm">
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
}
