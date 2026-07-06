/*
  Warnings:

  - Added the required column `fullName` to the `repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "fullName" TEXT NOT NULL;
