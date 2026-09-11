/**
 * Submission データの変換・パースに関するユーティリティ関数
 */

import { KEY_MAPPING } from '../constants.js';

/**
 * カンマ区切りの文字列をパースして配列を返す
 * @param {string} s - カンマ区切り文字列
 * @returns {string[]}
 */
const splitTrim = (s) =>
  s && String(s).trim()
    ? String(s).trim()
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

/**
 * API の submissionData（カンマ区切り）をパースし、
 * チェック状態判定用の Set/配列を返す
 * @param {Object} data - API から取得した submission データ
 * @returns {Object|null} - suspectedDiseasesSet, clinicalDiagnosesSet, finalDiagnosesSet, phenotypesSet, genotypesList
 */
export function parseSubmissionCheckedData(data) {
  if (!data) return null;

  const genes = splitTrim(data.gene_symbols);
  const ensembls = splitTrim(data.ensembl_ids);
  const entrezs = splitTrim(data.entrez_ids);
  const maxGenotypeLen = Math.max(genes.length, ensembls.length, entrezs.length);
  const genotypesList = Array.from({ length: maxGenotypeLen }, (_, i) => ({
    geneSymbols: genes[i] ?? '',
    ensemblIds: ensembls[i] ?? '',
    entrezIds: entrezs[i] ?? '',
  })).filter((g) => g.geneSymbols || g.ensemblIds || g.entrezIds);

  return {
    suspectedDiseasesSet: new Set(splitTrim(data.suspected_diseases)),
    clinicalDiagnosesSet: new Set(splitTrim(data.clinical_diagnoses)),
    finalDiagnosesSet: new Set(splitTrim(data.final_diagnoses)),
    phenotypesSet: new Set(splitTrim(data.phenotypes)),
    genotypesList,
  };
}

/**
 * 患者データを submission フォーム用の形式に変換
 * @param {Object} patientData - 患者データ
 * @returns {Object}
 */
export function convertPatientDataToSubmissionData(patientData) {
  const result = {};
  Object.keys(KEY_MAPPING).forEach((sourceKey) => {
    const targetKey = KEY_MAPPING[sourceKey];
    const value = patientData[sourceKey]?.filter((item) => !!item);
    result[targetKey] = value;
  });
  return result;
}

/**
 * 単一カテゴリ（疾患名・表現型など）のチェック状態付きアイテム配列を生成
 * 既存データ・API のチェック状態を考慮して初期値を決定する
 *
 * @param {string[]} nameArray - 名前の配列
 * @param {string[]} [labelArray] - ラベル配列（表現型などで使用）
 * @param {Object[]} existingItems - 既存のフォームアイテム（checked 状態を引き継ぐ）
 * @param {Set|null} submissionCheckedSet - API から取得したチェック済み ID/名前の Set
 * @param {Function} getMondoId - name から MONDO ID を取得する関数
 * @returns {Object[]} - { id, name, checked, label } の配列
 */
export function generateSingleCheckStates(
  nameArray,
  labelArray,
  existingItems,
  submissionCheckedSet,
  getMondoId
) {
  const existingCheckedMap = new Map();
  existingItems.forEach((item) => {
    if (item.name) existingCheckedMap.set(item.name, item.checked);
    if (item.id) existingCheckedMap.set(`id:${item.id}`, item.checked);
  });

  return nameArray.map((name, index) => {
    const id = getMondoId ? getMondoId(name) : '';
    const fromExisting =
      existingCheckedMap.get(name) ?? existingCheckedMap.get(`id:${id}`);

    if (fromExisting !== undefined && fromExisting !== null) {
      return {
        id,
        name,
        checked: fromExisting,
        label: labelArray ? labelArray[index] : '',
      };
    }
    if (submissionCheckedSet) {
      const checked = id ? submissionCheckedSet.has(id) : submissionCheckedSet.has(name);
      return { id, name, checked, label: labelArray ? labelArray[index] : '' };
    }
    return { id, name, checked: true, label: labelArray ? labelArray[index] : '' };
  });
}

/**
 * フォームデータを API リクエスト用の形式に変換
 * チェック済みアイテムのみをカンマ区切り文字列に変換
 *
 * @param {Object} formData - フォームデータ
 * @returns {Object} - API 用の request body
 */
export function prepareRequestBody(formData) {
  return {
    ...formData,
    clinical_diagnoses: formData.clinical_diagnoses
      .filter((d) => d.checked && !!d.id)
      .map((d) => d.id)
      .join(','),
    final_diagnoses: formData.final_diagnoses
      .filter((d) => d.checked && !!d.id)
      .map((d) => d.id)
      .join(','),
    suspected_diseases: formData.suspected_diseases
      .filter((d) => d.checked && !!d.id)
      .map((d) => d.id)
      .join(','),
    phenotypes: formData.phenotypes
      .filter((p) => p.checked && !!p.name)
      .map((p) => p.name)
      .join(','),
    gene_symbols: formData.genotypes
      .filter((g) => g.checked && !!g.geneSymbols)
      .map((g) => g.geneSymbols)
      .join(','),
    ensembl_ids: formData.genotypes
      .filter((g) => g.checked && !!g.ensemblIds)
      .map((g) => g.ensemblIds)
      .join(','),
    entrez_ids: formData.genotypes
      .filter((g) => g.checked && !!g.entrezIds)
      .map((g) => g.entrezIds)
      .join(','),
    allelic_states: formData.genotypes
      .filter((g) => g.checked)
      .map((g) => g.zygosity || '')
      .join(','),
    inheritances: formData.genotypes
      .filter((g) => g.checked)
      .map((g) => g.inheritance || '')
      .join(','),
    restrict_matches_to_researchers: (
      formData.restrict_matches === 'researchers'
    ).toString(),
    restrict_matches_to_providers: (
      formData.restrict_matches === 'providers'
    ).toString(),
    matching_rule_medical_info: formData.matching_rule_medical_info || 'ignored',
    matching_rule_phenotype_info: formData.matching_rule_phenotype_info || 'ignored',
    matching_rule_genotype_info: formData.matching_rule_genotype_info || 'ignored',
    comment: formData.comment,
  };
}

/**
 * 新旧データの差分を検出し、変更されたフィールドのリストを返す
 * PUT リクエストで差分更新する際に使用
 *
 * @param {Object} newData - 新しいデータ
 * @param {Object} oldData - 元のデータ
 * @returns {Array<{column_name: string, new_value: string}>}
 */
export function getChangedFields(newData, oldData) {
  const changedFields = [];

  for (const fieldName of Object.keys(newData)) {
    const newValue = newData[fieldName];
    const oldValue = oldData[fieldName];

    // boolean 値のフィールドは特別に処理
    if (
      fieldName === 'restrict_matches_to_researchers' ||
      fieldName === 'restrict_matches_to_providers'
    ) {
      const newValueBool = newValue === 'true' || newValue === true;
      const oldValueBool = oldValue === 'true' || oldValue === true;
      if (newValueBool !== oldValueBool) {
        changedFields.push({
          column_name: fieldName,
          new_value: String(newValueBool),
        });
      }
    } else {
      const newValueStr =
        newValue !== undefined && newValue !== null ? String(newValue) : '';
      const oldValueStr =
        oldValue !== undefined && oldValue !== null ? String(oldValue) : '';
      if (newValueStr !== oldValueStr) {
        changedFields.push({
          column_name: fieldName,
          new_value: newValueStr,
        });
      }
    }
  }

  return changedFields;
}
