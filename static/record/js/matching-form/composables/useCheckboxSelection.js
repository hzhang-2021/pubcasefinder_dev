/**
 * Medical Info / Phenotype Info の一括チェック・ indeterminate 状態を管理する composable
 */
import { computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

/**
 * @param {import('vue').Ref} submissionFormRef - フォームデータの ref
 */
export function useCheckboxSelection(submissionFormRef) {
  // --- Medical Info（Suspected / Clinical / Final Diagnosis）---

  /** 3つの疾患セクションを結合した配列。「Select All」で一括操作する対象 */
  const medicalInfoItems = computed(
    () => [
      ...(submissionFormRef.value.suspected_diseases || []),
      ...(submissionFormRef.value.clinical_diagnoses || []),
      ...(submissionFormRef.value.final_diagnoses || []),
    ]
  );

  const medicalInfoTotal = computed(() => medicalInfoItems.value.length);
  const medicalInfoCheckedCount = computed(() =>
    medicalInfoItems.value.filter((i) => i.checked).length
  );

  /** 全選択状態（読み取り専用）。ハンドラで一括切り替え */
  const medicalInfoAllChecked = computed(
    () =>
      medicalInfoTotal.value > 0 &&
      medicalInfoCheckedCount.value === medicalInfoTotal.value
  );

  /** 一部のみ選択状態。indeterminate 表示（三本線）に使用 */
  const medicalInfoIndeterminate = computed(
    () =>
      medicalInfoCheckedCount.value > 0 &&
      medicalInfoCheckedCount.value < medicalInfoTotal.value
  );

  /** 「Select All」チェックボックスの change イベントハンドラ */
  const onToggleAllMedicalInfo = (e) => {
    const checked = e.target.checked;
    for (const item of medicalInfoItems.value) item.checked = checked;
  };

  // --- Phenotype Info ---

  const phenotypeInfoTotal = computed(
    () => submissionFormRef.value.phenotypes?.length ?? 0
  );
  const phenotypeInfoCheckedCount = computed(() =>
    (submissionFormRef.value.phenotypes || []).filter((p) => p.checked).length
  );

  /** 全選択状態（読み取り専用）。ハンドラで一括切り替え */
  const phenotypeInfoAllChecked = computed(
    () =>
      phenotypeInfoTotal.value > 0 &&
      phenotypeInfoCheckedCount.value === phenotypeInfoTotal.value
  );

  /** 一部のみ選択状態。indeterminate 表示に使用 */
  const phenotypeInfoIndeterminate = computed(
    () =>
      phenotypeInfoCheckedCount.value > 0 &&
      phenotypeInfoCheckedCount.value < phenotypeInfoTotal.value
  );

  /** 「Select All」チェックボックスの change イベントハンドラ */
  const onToggleAllPhenotypeInfo = (e) => {
    const checked = e.target.checked;
    for (const p of submissionFormRef.value.phenotypes || []) p.checked = checked;
  };

  return {
    medicalInfoItems,
    medicalInfoTotal,
    medicalInfoCheckedCount,
    medicalInfoAllChecked,
    medicalInfoIndeterminate,
    onToggleAllMedicalInfo,
    phenotypeInfoTotal,
    phenotypeInfoCheckedCount,
    phenotypeInfoAllChecked,
    phenotypeInfoIndeterminate,
    onToggleAllPhenotypeInfo,
  };
}
