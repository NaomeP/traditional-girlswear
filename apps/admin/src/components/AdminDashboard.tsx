import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminDashboardSummary,
  type AdminDashboardSummary,
} from "../services/adminDashboardService";

function formatCurrency(
  value: string | number | null | undefined,
): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(
  value: number | null | undefined,
): string {
  return new Intl.NumberFormat("en-IN").format(
    value ?? 0,
  );
}

function isValidDateValue(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] =
    value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}


function PrimaryStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E1D4] bg-white p-5 transition hover:border-[#C9A227]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8172]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#171512] sm:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#8A8172]">
        {description}
      </p>
    </div>
  );
}


function EmptyState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-[#E7E1D4] bg-white">
      <div className="max-w-sm px-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F3EA] text-lg text-[#8A8172]">
          —
        </div>

        <h2 className="mt-4 text-base font-semibold text-[#171512]">
          No dashboard data
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#8A8172]">
          There is currently no dashboard information
          available for the selected period.
        </p>
      </div>
    </div>
  );
}


export default function AdminDashboard() {

  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(
      null,
    );

  const [from, setFrom] =
    useState("");

  const [to, setTo] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadDashboard = useCallback(
    async (
      fromDate?: string,
      toDate?: string,
    ) => {

      try {

        setLoading(true);
        setError("");


        if (
          fromDate &&
          !isValidDateValue(fromDate)
        ) {
          setError(
            "Please enter a valid From date.",
          );
          return;
        }


        if (
          toDate &&
          !isValidDateValue(toDate)
        ) {
          setError(
            "Please enter a valid To date.",
          );
          return;
        }


        if (
          fromDate &&
          toDate &&
          fromDate > toDate
        ) {
          setError(
            "From date cannot be later than To date.",
          );
          return;
        }


        const data =
          await getAdminDashboardSummary(
            fromDate || undefined,
            toDate || undefined,
          );


        setSummary(data);

      } catch(err){

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard",
        );

      } finally {

        setLoading(false);

      }

    },
    [],
  );


  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);


  const handleRefresh = () => {

    void loadDashboard(
      from || undefined,
      to || undefined,
    );

  };


  if (loading && !summary) {

    return (
      <div className="min-h-[500px] rounded-2xl border border-[#E7E1D4] bg-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );

  }


  if(error && !summary){

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

        <p className="font-semibold text-red-700">
          Unable to load dashboard
        </p>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={handleRefresh}
          className="mt-4 rounded-xl bg-black px-5 py-2 text-white"
        >
          Try Again
        </button>

      </div>
    );

  }


  if(!summary){
    return <EmptyState />;
  }


  return (

    <div className="space-y-6 pb-8">


      {/* Header */}

      <section className="rounded-2xl border border-[#E7E1D4] bg-white">

        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">


          <div>

            <p className="text-xs uppercase tracking-[0.16em] text-[#8A8172]">
              Store overview
            </p>


            <h1 className="mt-2 text-3xl font-semibold text-[#171512]">
              Dashboard
            </h1>


            <p className="mt-1 text-sm text-[#8A8172]">
              Monitor your store performance.
            </p>

          </div>



          <div className="grid gap-3 sm:flex">

            <input
              type="date"
              value={from}
              onChange={(e)=>setFrom(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 sm:w-auto"
            />


            <input
              type="date"
              value={to}
              onChange={(e)=>setTo(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 sm:w-auto"
            />


            <button
              onClick={handleRefresh}
              className="w-full rounded-xl bg-[#171512] px-5 py-2 text-white sm:w-auto"
            >
              Refresh
            </button>

          </div>


        </div>

      </section>




      {/* Main Stats */}

      <section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


          <div className="rounded-2xl border border-[#C9A227]/40 bg-[#FFF9E9] p-5">

            <p className="text-xs uppercase text-[#8A6D13]">
              Total Revenue
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(summary.totalRevenue)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Revenue from orders
            </p>

          </div>



          <PrimaryStat
            label="Orders"
            value={formatNumber(summary.totalOrders)}
            description="Total orders received"
          />


          <PrimaryStat
            label="Customers"
            value={formatNumber(summary.totalCustomers)}
            description="Registered customers"
          />


          <PrimaryStat
            label="Products"
            value={formatNumber(summary.totalProducts)}
            description="Products available"
          />


        </div>

      </section>





      {/* Order Overview */}

      <section className="rounded-2xl border border-[#E7E1D4] bg-white p-6">


        <h2 className="text-base font-semibold">
          Order overview
        </h2>


        <p className="mt-1 text-xs text-gray-500">
          Current order status breakdown.
        </p>



        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">


          {[
            ["Pending",summary.pendingOrders],
            ["Processing",summary.processingOrders],
            ["Delivered",summary.deliveredOrders],
            ["Cancelled",summary.cancelledOrders],
          ].map(([label,value])=>(

            <div
              key={label}
              className="rounded-xl border bg-[#FFFDF8] p-5"
            >

              <p className="text-xs text-gray-500">
                {label}
              </p>


              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(Number(value))}
              </p>


            </div>

          ))}


        </div>


      </section>



    </div>

  );

}


export { AdminDashboard };