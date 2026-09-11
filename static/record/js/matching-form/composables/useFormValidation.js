/**
 * フォームバリデーションとエラー表示の composable
 */
import { ref, nextTick } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

/** エラー要素へのスクロール順序 */
const ERROR_ORDER = [
  'name',
  'submitter_email',
  'submitter_first_name',
  'submitter_last_name',
  'submitter_institution',
  'matching_rules',
  'medical_info',
  'phenotype_info',
  'genotype_info',
];

/**
 * @param {Object} submissionForm - フォームデータの ref
 */
export function useFormValidation(submissionForm) {
  const validationErrors = ref({});

  const scrollToFirstError = (errors) => {
    const firstErrorKey = ERROR_ORDER.find((key) => errors[key]);
    if (!firstErrorKey) return;

    const errorElement = document.querySelector(
      `[data-error-key="${firstErrorKey}"]`
    );
    if (!errorElement) return;

    errorElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    const focusableElement = errorElement.querySelector(
      'input, select, textarea'
    );
    if (focusableElement) {
      setTimeout(() => focusableElement.focus(), 300);
    }
  };

  const validateForm = () => {
    const form = submissionForm.value;
    const errors = {};

    // 1. Submission Identification の入力必須チェック
    if (!form.name?.trim()) errors.name = 'Submission name is required';
    if (!form.submitter_email?.trim())
      errors.submitter_email = 'Submitter email is required';
    if (!form.submitter_first_name?.trim())
      errors.submitter_first_name = 'Submitter first name is required';
    if (!form.submitter_last_name?.trim())
      errors.submitter_last_name = 'Submitter last name is required';
    if (!form.submitter_institution?.trim())
      errors.submitter_institution = 'Submitter institution is required';

    // 2. Matching Rules で全てが Ignored または未選択になっていないか
    const isInactive = (rule) => !rule || rule === 'ignored';
    if (
      isInactive(form.matching_rule_medical_info) &&
      isInactive(form.matching_rule_phenotype_info) &&
      isInactive(form.matching_rule_genotype_info)
    ) {
      errors.matching_rules =
        'At least one matching rule (Medical Info, Phenotype Info, or Gene Symbol) must not be set to "Ignored"';
    }

    // 3. Required/Optional の場合は対象セクションの入力必須チェック
    if (
      ['required', 'optional'].includes(form.matching_rule_medical_info)
    ) {
      const hasMedicalData =
        form.suspected_diseases?.some((d) => d.checked) ||
        form.clinical_diagnoses?.some((d) => d.checked) ||
        form.final_diagnoses?.some((d) => d.checked);
      if (!hasMedicalData) {
        errors.medical_info =
          'Medical information is required when matching rule is set to Required or Optional';
      }
    }

    if (
      ['required', 'optional'].includes(form.matching_rule_phenotype_info)
    ) {
      const hasPhenotypeData = form.phenotypes?.some((p) => p.checked);
      if (!hasPhenotypeData) {
        errors.phenotype_info =
          'Phenotype information is required when matching rule is set to Required or Optional';
      }
    }

    if (['required', 'optional'].includes(form.matching_rule_genotype_info)) {
      const hasGenotypeData = form.genotypes?.some((g) => g.checked);
      if (!hasGenotypeData) {
        errors.genotype_info =
          'Genotype information is required when matching rule is set to Required or Optional';
      }
    }

    validationErrors.value = errors;

    if (Object.keys(errors).length > 0) {
      nextTick(() => scrollToFirstError(errors));
    }

    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    validationErrors.value = {};
  };

  return {
    validationErrors,
    validateForm,
    scrollToFirstError,
    clearValidationErrors,
  };
}
