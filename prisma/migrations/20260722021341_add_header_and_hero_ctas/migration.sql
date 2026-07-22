-- CreateEnum
CREATE TYPE "CtaVariant" AS ENUM ('primary', 'secondary');

-- AlterTable
ALTER TABLE "PastorProfile" ADD COLUMN     "heroShowBadge" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "HeroCta" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "variant" "CtaVariant" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HeroCta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "ministryName" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,

    CONSTRAINT "HeaderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "NavLink_pkey" PRIMARY KEY ("id")
);
