-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "total_forecast" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "utilization_pct" DECIMAL(6,2) NOT NULL DEFAULT 0;
