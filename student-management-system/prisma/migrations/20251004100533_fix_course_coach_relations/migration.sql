/*
  Warnings:

  - You are about to drop the column `instructor` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `course` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "instructor",
ADD COLUMN     "coachId" TEXT;

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "course",
ADD COLUMN     "courseId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;
