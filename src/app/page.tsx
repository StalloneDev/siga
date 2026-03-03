import { getDashboardData } from "./dashboard-actions";
import { StockStatus } from "@/components/dashboard/stock-status";
import { FuelChart } from "@/components/dashboard/fuel-chart";
import { FlightSchedule } from "@/components/dashboard/flight-schedule";
import { SystemAlerts } from "@/components/dashboard/system-alerts";
import { StockPrediction } from "@/components/dashboard/stock-prediction";

export default async function Home() {
  const { stocksActuels, volsDuJour, avitaillements30jours, analytics } = await getDashboardData();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Stock Status (4 cols) */}
        <div className="lg:col-span-4">
          <StockStatus stocks={stocksActuels} />
        </div>

        {/* Comparison Chart (8 cols) */}
        <div className="lg:col-span-8">
          <FuelChart chartData={avitaillements30jours} />
        </div>
      </div>

      {/* Analytics & Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Stats (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <StockPrediction analytics={analytics} />
        </div>

        {/* Flights Schedule (8 cols) */}
        <div className="lg:col-span-8">
          <FlightSchedule vols={volsDuJour as any} />
        </div>
      </div>

      {/* Bottom Alerts */}
      <div className="max-w-xl">
        <SystemAlerts stocks={stocksActuels} />
      </div>
    </div>
  );
}
