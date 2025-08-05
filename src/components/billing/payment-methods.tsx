"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";

type PaymentMethod = {
  id: number;
  last4: string;
  exp: string;
  default: boolean;
};

type PaymentMethodsProps = {
  methods: PaymentMethod[];
};

export default function PaymentMethods({ methods }: PaymentMethodsProps) {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-lg">Payment Method</div>
      </div>
      {methods.length > 0 ? (
        <div className="gap-3 flex">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-4 p-0 ${
                m.default ? "border-black" : "border-gray-200"
              }`}
            >
              {/* Card visual */}
              <div className="flex-shrink-0">
                <div className="w-56 h-32 rounded-lg shadow flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 relative">
                  <Image
                    src="/visa.png"
                    alt="Visa"
                    width={32}
                    height={20}
                    className="absolute left-2 top-2 h-auto"
                  />
                  <div className="absolute left-2 bottom-2 text-gray-700 font-mono tracking-widest">
                    •••• {m.last4}
                  </div>
                  <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                    {m.exp}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className=" text-center text-gray-500">
          <p className="text-sm h-20">No payment methods added yet</p>
        </div>
      )}
    </Card>
  );
}
