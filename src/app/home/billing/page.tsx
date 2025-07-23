import PlanCard from "@/app/home/billing/_components/plan-card";
import PaymentMethods from "@/app/home/billing/_components/payment-methods";
import BillingHistory from "@/app/home/billing/_components/billing-history";
import BillingInfo from "@/app/home/billing/_components/billing-info";

export default function BillingPage() {
  // Mock data for demonstration

  const paymentMethods = [
    {
      id: 1,
      last4: "4242",
      exp: "12/25",
      default: true,
    },
    {
      id: 2,
      last4: "5555",
      exp: "08/26",
      default: false,
    },
  ];

  const billingHistory = [
    {
      id: 1,
      plan: "Pro Plan",
      date: "2024-01-15",
      amount: 29.99,
      status: "Paid",
    },
    {
      id: 2,
      plan: "Pro Plan",
      date: "2023-12-15",
      amount: 29.99,
      status: "Paid",
    },
    {
      id: 3,
      plan: "Basic Plan",
      date: "2023-11-15",
      amount: 9.99,
      status: "Paid",
    },
  ];

  const billingInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA 12345",
  };

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-background text-3xl leading-tight font-semibold">
          Billing & Subscription
        </h1>
        <p className="text-background text-lg mb-6">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <PlanCard />
        {/* <div className="grid gap-6 md:grid-cols-2">
          <BillingInfo info={billingInfo} />
        </div> */}
        <PaymentMethods methods={paymentMethods} />
        <BillingHistory history={billingHistory} />
      </div>
    </>
  );
}
