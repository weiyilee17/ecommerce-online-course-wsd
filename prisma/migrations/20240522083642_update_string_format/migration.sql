-- AlterTable
ALTER TABLE `Product` MODIFY `name` TEXT NOT NULL,
    MODIFY `filePath` TEXT NOT NULL,
    MODIFY `imagePath` TEXT NOT NULL,
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(255) NOT NULL;
