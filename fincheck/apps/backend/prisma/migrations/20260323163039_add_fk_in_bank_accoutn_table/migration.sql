-- CreateEnum
CREATE TYPE "bank_account_type" AS ENUM ('CHECKING', 'INVESTMENT', 'CASH');

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initial_balance" DOUBLE PRECISION NOT NULL,
    "type" "bank_account_type" NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
