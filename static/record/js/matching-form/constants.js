/**
 * 患者データのカラム名と submission フォームのキーとのマッピング
 * データ変換時に使用する
 */
export const KEY_MAPPING = {
  medical_suspected_disease_name: 'suspected_diseases',
  medical_clinical_diagnosis_name: 'clinical_diagnoses',
  medical_final_diagnosis_name: 'final_diagnoses',
  phenotype_hpo_id: 'phenotypes',
  phenotype_hpo_label: 'phenotype_labels',
  genotype_gene: 'gene_symbols',
  genotype_ensembl_id: 'ensembl_ids',
  genotype_ncbi_gene_id: 'entrez_ids',
};

/**
 * マッチング制限オプション（Researchers / Health Care Providers）の定義
 * フォームの restrict_matches フィールドと連携
 */
export const RESTRICT_MATCH_INFO = {
  researchers: {
    label: 'Researchers',
    submissionFormKey: 'restrictMatchesToResearchers',
  },
  providers: {
    label: 'Health Care Providers',
    submissionFormKey: 'restrictMatchesToProviders',
  },
};
