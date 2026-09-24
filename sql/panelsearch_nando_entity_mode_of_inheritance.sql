
DROP TABLE IF EXISTS `panelsearch_nando_entity_mode_of_inheritance`;
CREATE TABLE `panelsearch_nando_entity_mode_of_inheritance` (
  `mode_of_inheritance_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode_of_inheritance_name_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `mode_of_inheritance_name_ja` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`mode_of_inheritance_id`),
  UNIQUE KEY `X_mode_of_inheritance_id` (`mode_of_inheritance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `panelsearch_nando_entity_mode_of_inheritance` WRITE;
INSERT INTO `panelsearch_nando_entity_mode_of_inheritance` VALUES 
('HP:0000005','Mode of inheritance','遺伝形式'),
('HP:0000006','Autosomal dominant inheritance','常染色体顕性遺伝'),
('HP:0000007','Autosomal recessive inheritance','常染色体潜性遺伝'),
('HP:0001417','X-linked inheritance','X連鎖性遺伝'),
('HP:0001419','X-linked recessive inheritance','X連鎖潜性遺伝'),
('HP:0001423','X-linked dominant inheritance','X連鎖顕性遺伝'),
('HP:0001426','Non-Mendelian inheritance','非メンデル遺伝'),
('HP:0001427','Mitochondrial inheritance','ミトコンドリア遺伝'),
('HP:0001442','Typified by somatic mosaicism','体細胞モザイクを特徴とする'),
('HP:0001450','Y-linked inheritance','Y連鎖性遺伝'),
('HP:0001466','Contiguous gene syndrome','隣接遺伝子症候群'),
('HP:0001470','Sex-limited expression','限性発現'),
('HP:0001475','Male-limited expression','男性のみに発現'),
('HP:0003743','Genetic anticipation','遺伝的表現促進現象'),
('HP:0003744','Genetic anticipation with paternal anticipation bias','父由来表現促進バイアスを受けている表現促進現象'),
('HP:0003745','Sporadic','孤発性'),
('HP:0003829','Typified by incomplete penetrance','不完全浸透を特徴とする'),
('HP:0003831','Typified by age-related disease onset','加齢に伴う疾患を特徴とする'),
('HP:0010982','Polygenic inheritance','多遺伝子遺伝'),
('HP:0010983','Oligogenic inheritance','オリゴジェニック遺伝'),
('HP:0010984','Digenic inheritance','二遺伝子遺伝'),
('HP:0012274','Autosomal dominant inheritance with paternal imprinting','父由来インプリンティングを受けている常染色体顕性遺伝'),
('HP:0012275','Autosomal dominant inheritance with maternal imprinting','母由来インプリンティングを受けている常染色体顕性遺伝'),
('HP:0025352','Typically de novo','主として新規'),
('HP:0032113','Semidominant inheritance','半顕性遺伝'),
('HP:0032382','Uniparental disomy','片親性ダイソミー'),
('HP:0032383','Uniparental heterodisomy','片親性ヘテロダイソミー'),
('HP:0032384','Uniparental isodisomy','片親性イソダイソミー'),
('HP:0034335','Inheritance qualifier','遺伝を識別する語句'),
('HP:0034338','Imprinted','インプリンティング'),
('HP:0034339','Pseudoautosomal inheritance','偽常染色体遺伝'),
('HP:0034340','Pseudoautosomal dominant inheritance','偽常染色体顕性遺伝'),
('HP:0034341','Pseudoautosomal recessive inheritance','偽常染色体潜性遺伝'),
('HP:0034343','Requires heterozygosity','ヘテロ接合が必要'),
('HP:0034344','Female-limited expression','女性のみに発現'),
('HP:0034345','Mendelian inheritance','メンデル遺伝'),
('HP:0034857','Typified by highly variable age of onset','発症年齢の大きなばらつきを特徴とする'),
('HP:0034950','Typified by complete penetrance','完全浸透を特徴とする'),
('HP:4000158','Typified by high penetrance','高浸透度を特徴とする'),
('HP:4000159','Typified by moderate penetrance','中浸透度を特徴とする'),
('HP:4000160','Typified by low penetrance','低浸透度を特徴とする');
UNLOCK TABLES;
