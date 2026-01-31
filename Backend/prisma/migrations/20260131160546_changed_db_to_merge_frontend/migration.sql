/*
  Warnings:

  - A unique constraint covering the columns `[login_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `login_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "total_actual" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_budgeted" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_remaining" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "delivery_date" DATE;

-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN     "delivery_date" DATE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "login_id" CHAR(6) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_login_id_key" ON "users"("login_id");
