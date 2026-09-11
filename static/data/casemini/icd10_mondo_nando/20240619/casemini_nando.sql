DROP TABLE IF EXISTS `casemini_nando`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_nando` (
  `NANDO` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `notification_number` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_en` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_synonym_en` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `disease_name_ja` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_synonym_ja` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `Mondo` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  KEY `X_casemini_nando_mondo` (`NANDO`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;


insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200040','18','[指定] Autosomal dominant hereditary spinocerebellar degeneration','','[指定] 常染色体優性遺伝性脊髄小脳変性症','','');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200041','18','[指定] Spinocerebellar ataxia type 3','Machado-Joseph disease|MJD|SCA3','[指定] 脊髄小脳失調症３型','マチャド・ジョセフ病','MONDO:0007182');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200042','18','[指定] Spinocerebellar ataxia type 6','SCA6','[指定] 脊髄小脳失調症６型','','MONDO:0008457');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200043','18','[指定] Dentatorubropallidoluysian atrophy','Dentatorubral-pallidoluysian atrophy|DRPLA','[指定] 歯状核赤核淡蒼球ルイ体萎縮症','','MONDO:0007435');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200044','18','[指定] Spinocerebellar ataxia type 31','SCA31','[指定] 脊髄小脳失調症３１型','','MONDO:0007296');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200045','18','[指定] Spinocerebellar ataxia type 1','SCA1','[指定] 脊髄小脳失調症１型','','MONDO:0008119');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200046','18','[指定] Spinocerebellar ataxia type 2','SCA2','[指定] 脊髄小脳失調症２型','','MONDO:0008458');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200047','18','[指定] Spinocerebellar ataxia type 7','SCA7','[指定] 脊髄小脳失調症７型','','MONDO:0008120');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200048','18','[指定] Spinocerebellar ataxia type 36','SCA36','[指定] 脊髄小脳失調症３６型','','MONDO:0013594');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200049','18','[指定] Autosomal recessive hereditary spinocerebellar degeneration','','[指定] 常染色体劣性遺伝性脊髄小脳変性症','','');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200050','18','[指定] Ataxia with isolated vitamin E deficiency','AVED','[指定] ビタミンE単独欠乏性失調症','','MONDO:0010188');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:1200051','18','[指定] Ataxia-oculomotor apraxia type 1','AOA1|Early-onset ataxia with ocular motor apraxia and hypoalbuminemia|EAOH','[指定] アプラタキシン欠損症','眼球運動失行を伴う失調症|低アルブミン血症を伴う早発型脊髄小脳変性症','MONDO:0008842');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200703','38','[小慢] Other combined immunodeficiencies','Combined immunodeficiencies','[小慢] 1から9までに掲げるもののほか、複合免疫不全症','','');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200704','46','[小慢] Wiskott-Aldrich syndrome','','[小慢] ウィスコット・オルドリッチ症候群','Wiskott-Aldrich症候群','MONDO:0010518');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200705','55','[小慢] Ataxia telangiectasia','','[小慢] 毛細血管拡張性運動失調症','','MONDO:0008840');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200706','52','[小慢] Nijmegen breakage syndrome','','[小慢] ナイミーヘン染色体不安定症候群','Nijmegen染色体不安定症候群','MONDO:0009623');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200707','54','[小慢] Bloom syndrome','','[小慢] ブルーム症候群','Bloom症候群','MONDO:0008876');
insert into casemini_nando (nando,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,mondo) value ('NANDO:2200708','45','[小慢] ICF syndrome','','[小慢] ICF症候群','','MONDO:0000133');

