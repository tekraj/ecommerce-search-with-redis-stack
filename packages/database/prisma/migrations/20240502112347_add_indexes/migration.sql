-- AlterTable
ALTER TABLE `Product` ADD COLUMN `discount` DOUBLE NOT NULL DEFAULT 0;

-- CreateIndex
CREATE FULLTEXT INDEX `Category_name_idx` ON `Category`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Product_name_description_idx` ON `Product`(`name`, `description`);
