-- AlterTable
ALTER TABLE `leads` MODIFY `status` ENUM('new', 'emailed', 'followed_up', 'replied', 'won', 'closed', 'deleted') NOT NULL DEFAULT 'new';
