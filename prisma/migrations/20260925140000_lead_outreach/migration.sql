ALTER TABLE `leads`
  ADD COLUMN `kind` ENUM('client', 'partner') NOT NULL DEFAULT 'client',
  ADD COLUMN `emailedAt` DATETIME(3) NULL,
  ADD COLUMN `followUpSentAt` DATETIME(3) NULL,
  ADD COLUMN `repliedAt` DATETIME(3) NULL,
  ADD COLUMN `replyText` TEXT NULL;

CREATE INDEX `leads_kind_idx` ON `leads`(`kind`);
