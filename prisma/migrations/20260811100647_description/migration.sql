-- CreateTable
CREATE TABLE "Description" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coordinates" TEXT,
    "lines" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Description_pkey" PRIMARY KEY ("id")
);
