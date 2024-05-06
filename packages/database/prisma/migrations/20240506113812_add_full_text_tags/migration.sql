-- DropIndex
DROP INDEX `Product_name_description_idx` ON `Product`;

-- CreateIndex
CREATE FULLTEXT INDEX `Product_name_description_tags_idx` ON `Product`(`name`, `description`, `tags`);
