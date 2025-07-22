"use client";

import { Card } from "@/components/ui/card";
import { Button } from "../../../../components/ui/button";

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
    <Card className="px-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold flex items-center gap-1">
            {plan.name}
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
              {plan.status}
            </span>
          </h3>
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
      <div className="flex">
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-11 text-sm cursor-pointer"
        >
          Cancel Subscription
        </Button>
      </div>
    </Card>
  );
}
