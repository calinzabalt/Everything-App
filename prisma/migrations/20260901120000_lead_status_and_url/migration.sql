ALTER TABLE `leads` ADD COLUMN `url` VARCHAR(2048) NULL;

ALTER TABLE `leads` MODIFY `status` ENUM('new', 'emailed', 'followed_up', 'replied', 'won', 'closed', 'deleted', 'contacted', 'lead') NOT NULL DEFAULT 'new';

UPDATE `leads` SET `status` = 'contacted' WHERE `status` IN ('emailed', 'followed_up');
UPDATE `leads` SET `status` = 'lead' WHERE `status` = 'replied';

ALTER TABLE `leads` MODIFY `status` ENUM('new', 'contacted', 'lead', 'won', 'closed', 'deleted') NOT NULL DEFAULT 'new';
