ALTER TABLE `submission`
  ADD COLUMN `matching_rule_phenotype_info` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ignored'
  AFTER `matching_rule_medical_info`,
  ADD COLUMN `allelic_states` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER `entrez_ids`,
  ADD COLUMN `inheritances` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER `allelic_states`;

ALTER TABLE `matching`
  ADD COLUMN `phenotype_rule` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ignored' AFTER `genotype_rule`,
  ADD COLUMN `phenotype_match` tinyint(1) NOT NULL DEFAULT 0 AFTER `genotype_match`;
