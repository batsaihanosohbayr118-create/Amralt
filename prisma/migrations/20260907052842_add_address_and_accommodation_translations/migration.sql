-- AlterTable
ALTER TABLE "Accommodation" ADD COLUMN     "facilitiesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "facilitiesZh" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "nameZh" TEXT;

-- AlterTable
ALTER TABLE "Resort" ADD COLUMN     "addressEn" TEXT,
ADD COLUMN     "addressZh" TEXT;
