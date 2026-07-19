-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'student');

-- CreateEnum
CREATE TYPE "AgendaType" AS ENUM ('presencial', 'online');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('email', 'cpf', 'cnpj', 'phone', 'random');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PastorProfile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroPhotoUrl" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroHighlight" TEXT NOT NULL,
    "heroIntro" TEXT NOT NULL,
    "familyPhotoUrl" TEXT NOT NULL,
    "aboutEyebrow" TEXT NOT NULL,
    "aboutHeading" TEXT NOT NULL,
    "aboutIntro" TEXT NOT NULL,

    CONSTRAINT "PastorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPillar" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AboutPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AgendaType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "buyUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoHighlight" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,

    CONSTRAINT "VideoHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "pixKey" TEXT NOT NULL,
    "pixKeyType" "PixKeyType" NOT NULL,
    "pixMerchantName" TEXT NOT NULL,
    "pixMerchantCity" TEXT NOT NULL,
    "nationalBank" TEXT NOT NULL,
    "nationalAgency" TEXT NOT NULL,
    "nationalAccount" TEXT NOT NULL,
    "nationalCnpj" TEXT NOT NULL,
    "intlBank" TEXT NOT NULL,
    "intlIban" TEXT NOT NULL,
    "intlSwift" TEXT NOT NULL,
    "intlAccountHolder" TEXT NOT NULL,

    CONSTRAINT "OfferingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "cnpj" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "whatsappUrl" TEXT NOT NULL,
    "copyrightText" TEXT NOT NULL,

    CONSTRAINT "FooterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_supabaseUserId_key" ON "Admin"("supabaseUserId");
