export const dynamic = "force-dynamic";

import PlanCard from "@/components/PlanCard";
import PaymentMethods from "@/components/PaymentMethods";
import BillingHistory from "@/components/BillingHistory";
import BillingInfo from "@/components/BillingInfo";
export default function BillingPage() {
  // Mock data
  const plan = {
    name: "Premium Plan",
    description:
      "Full access to all health tracking features, advanced analytics, and priority support",
    price: 9.0,
    status: "Active",
    nextBilling: "July 22, 2025",
    features: [
      "Full Journal History ",
      "Printable & Exportable Graphs ",
      "Reminder Calendar",
      "Medication Tracking",
      "Tips & Tricks Page",
      "Priority support",
    ],
  };
  const paymentMethods = [
    { id: 1, last4: "4242", exp: "12/27", default: true },
    { id: 2, last4: "8888", exp: "09/26", default: false },
  ];
  const billingHistory = [
    {
      id: 1,
      plan: "Premium Plan",
      date: "Dec 15, 2024",
      amount: 9.0,
      status: "Paid",
    },
    {
      id: 2,
      plan: "Premium Plan",
      date: "Nov 15, 2024",
      amount: 9.0,
      status: "Paid",
    },
    {
      id: 3,
      plan: "Premium Plan",
      date: "Oct 15, 2024",
      amount: 9.0,
      status: "Paid",
    },
    {
      id: 4,
      plan: "Premium Plan",
      date: "Sep 15, 2024",
      amount: 9.0,
      status: "Paid",
    },
  ];
  const billingInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main Street\nSan Francisco, CA 94105\nUnited States",
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
          Billing & Subscription
        </h1>
        <p className="text-background text-lg mb-6">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="space-y-6">
        <PlanCard plan={plan} />
        <PaymentMethods methods={paymentMethods} />
        <BillingHistory history={billingHistory} />
        <BillingInfo info={billingInfo} />
      </div>
    </>
  );
}
