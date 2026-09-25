ALTER TABLE `leads` ADD COLUMN `emailOptOut` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `leads_emailOptOut_idx` ON `leads`(`emailOptOut`);
