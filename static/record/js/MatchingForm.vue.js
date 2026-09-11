/**
 * MatchingForm - CaseSharing Database の submission フォームコンポーネント
 *
 * 主な責務:
 * - Submission の作成・編集・削除
 * - Medical / Phenotype / Genotype 情報の入力
 * - マッチングルールの設定
 * - Match Report タブとの連携
 */
import { ref, computed, defineComponent, onMounted, onActivated } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import MatchingReport from './MatchingReport.vue.js';

import { RESTRICT_MATCH_INFO } from './matching-form/constants.js';
import {
  parseSubmissionCheckedData,
  convertPatientDataToSubmissionData,
  generateSingleCheckStates,
  prepareRequestBody,
  getChangedFields,
} from './matching-form/utils/submissionDataUtils.js';
import { useToast } from './matching-form/composables/useToast.js';
import { useFormValidation } from './matching-form/composables/useFormValidation.js';
import { useMondoMapping } from './matching-form/composables/useMondoMapping.js';
import { useHpoMapping } from './matching-form/composables/useHpoMapping.js';
import { useSubmissionApi } from './matching-form/composables/useSubmissionApi.js';
import { useCheckboxSelection } from './matching-form/composables/useCheckboxSelection.js';

export default defineComponent({
  name: 'MatchingForm',
  components: { MatchingReport },
  props: {
    pcfNo: { type: String, default: '' },
  },
  setup(props) {
    const lang = document.documentElement.lang;

    const effectivePcfNo = computed(
      () =>
        props.pcfNo ||
        (typeof currentPatient !== 'undefined' ? currentPatient : '')
    );

    // --- Composables ---
    const { showToast, toast, showToastMessage, hideToast } = useToast();
    const {
      mondoMapping,
      mondoMappingIdIndex,
      mondoMappingLabelIndex,
      fetchMappingTsv,
      isMondoValueMatched,
      createGetMondoId,
    } = useMondoMapping(lang);
    const { hpoMapping, fetchHpoMappingFile } = useHpoMapping();

    const {
      apiRequest,
      fetchSubmissionData,
      createSubmission,
      updateSubmission,
      updateSubmissionStatus,
      deleteSubmission,
      fetchMatchingCount: fetchMatchingCountApi,
    } = useSubmissionApi(showToastMessage);

    // --- UI State ---
    const activeTab = ref('submission');
    const isMatchActive = ref(false);
    const isEditMode = ref(false);
    const showMatchingRuleHelp = ref(false);
    const showDeleteModal = ref(false);
    const isLoading = ref(false);

    // --- Submission confirmation & matching ---
    const matchAgainstOtherSubmissions = ref(true);
    const agreeToSaveSubmissionId = ref(false);

    // --- Data State ---
    const submissionData = ref({});
    const submissionFormSnapshot = ref(null);
    const patientData = ref({});
    const convertedPatientData = ref({});
    const isFirstRegistration = ref(true);

    // --- Form ---
    const submissionForm = ref(createInitialFormState());

    const { validationErrors, validateForm, clearValidationErrors } =
      useFormValidation(submissionForm);

    const {
      medicalInfoItems,
      medicalInfoAllChecked,
      medicalInfoIndeterminate,
      onToggleAllMedicalInfo,
      phenotypeInfoAllChecked,
      phenotypeInfoIndeterminate,
      onToggleAllPhenotypeInfo,
    } = useCheckboxSelection(submissionForm);

    // --- Match Report ---
    const matchReportRef = ref(null);
    const hasShownMatchReport = ref(false);
    const matchingCount = ref(null);

    const fetchMatchingCount = async (submissionId) => {
      try {
        const responseData = await fetchMatchingCountApi(submissionId);
        matchingCount.value = responseData.data?.total ?? null;
      } catch (error) {
        matchingCount.value = null;
      }
    };

    // --- Patient Data / Initialization ---
    const getCurrentPatientData = () =>
      new Promise((resolve, reject) => {
        try {
          resolve(
            contentData.find((data) => data.PCFNo === effectivePcfNo.value)
          );
        } catch (error) {
          reject(error);
        }
      });

    /**
     * フォームの各セクション（疾患・表現型・遺伝子型）に初期データをセット
     * 既存 submission のチェック状態や患者データを反映
     */
    const setInitialData = () => {
      const form = submissionForm.value;
      const existing = {
        suspectedDiseases: form.suspected_diseases || [],
        clinicalDiagnoses: form.clinical_diagnoses || [],
        finalDiagnoses: form.final_diagnoses || [],
        phenotypes: form.phenotypes || [],
        genotypes: form.genotypes || [],
      };

      // 登録済み submission のチェック状態を反映する
      const submissionChecked =
        !isFirstRegistration.value && submissionData.value
          ? parseSubmissionCheckedData(submissionData.value)
          : null;

      const getMondoId = createGetMondoId();
      const sub = (arr, existingItems, set) =>
        generateSingleCheckStates(arr || [], null, existingItems, set, getMondoId);

      // Medical Info（疾患名）
      form.suspected_diseases = sub(
        convertedPatientData.value.suspected_diseases,
        existing.suspectedDiseases,
        submissionChecked?.suspectedDiseasesSet ?? null
      );
      form.clinical_diagnoses = sub(
        convertedPatientData.value.clinical_diagnoses,
        existing.clinicalDiagnoses,
        submissionChecked?.clinicalDiagnosesSet ?? null
      );
      form.final_diagnoses = sub(
        convertedPatientData.value.final_diagnoses,
        existing.finalDiagnoses,
        submissionChecked?.finalDiagnosesSet ?? null
      );

      const phenotypeLabels =
        convertedPatientData.value.phenotype_labels?.map((l) =>
          lang === 'ja' ? l.name_ja : l.name_en
        ) || [];
      form.phenotypes = generateSingleCheckStates(
        convertedPatientData.value.phenotypes || [],
        phenotypeLabels,
        existing.phenotypes,
        submissionChecked?.phenotypesSet ?? null,
        getMondoId
      );

      // Genotype Info
      // 生の患者データを参照することでアライメントを保持しつつ、
      // gene_symbol のない ensemblId / entrezId のみのエントリも反映する
      const rawGenes = patientData.value?.genotype_gene || [];
      const rawEnsembls = patientData.value?.genotype_ensembl_id || [];
      const rawEntrezs = patientData.value?.genotype_ncbi_gene_id || [];
      const rawZygosities = patientData.value?.genotype_allelic_state || [];
      const rawInheritances = patientData.value?.genotype_inheritance || [];
      const maxGenotypeLen = Math.max(rawGenes.length, rawEnsembls.length, rawEntrezs.length);
      const genotypeList = submissionChecked?.genotypesList ?? null;
      const seenGenotypeKeys = new Set();
      form.genotypes = [];
      for (let i = 0; i < maxGenotypeLen; i++) {
        const gene_symbol = rawGenes[i] || '';
        const ens = rawEnsembls[i] || '';
        const ent = rawEntrezs[i] || '';
        if (!gene_symbol && !ens && !ent) continue;
        const key = `${gene_symbol}|${ens}|${ent}`;
        if (seenGenotypeKeys.has(key)) continue;
        seenGenotypeKeys.add(key);
        const hasMatchingIds = (g) =>
          (gene_symbol && g.geneSymbols === gene_symbol) ||
          (ens && g.ensemblIds === ens) ||
          (ent && g.entrezIds === ent);

        const existingGenotype = existing.genotypes.find(hasMatchingIds);
        const checked = existingGenotype
          ? existingGenotype.checked
          : !genotypeList?.length || !!genotypeList.find(hasMatchingIds);

        form.genotypes.push({
          geneSymbols: gene_symbol,
          ensemblIds: ens,
          entrezIds: ent,
          zygosity: rawZygosities[i] || '',
          inheritance: rawInheritances[i] || '',
          checked,
        });
      }
    };

    /**
     * 初期化: 患者データ取得、API データ取得、フォームセット
     */
    const initialize = async () => {
      patientData.value = await getCurrentPatientData();
      if (!patientData.value) return;
      isFirstRegistration.value = !patientData.value.submission_id;
      convertedPatientData.value = convertPatientDataToSubmissionData(
        patientData.value
      );

      await Promise.all([fetchMappingTsv(), fetchHpoMappingFile()]);

      if (isFirstRegistration.value) {
        isEditMode.value = true;
        submissionForm.value.name = patientData.value.PCFNo;
        const loginUser = window.pcfLoginUserInfo;
        if (loginUser) {
          submissionForm.value.submitter_email = loginUser.email || '';
          submissionForm.value.submitter_first_name = loginUser.first_name_en || '';
          submissionForm.value.submitter_last_name = loginUser.last_name_en || '';
          submissionForm.value.submitter_institution = loginUser.affiliation_en || '';
        }
      } else {
        await fetchSubmissionData(
          patientData.value.submission_id,
          submissionData,
          isMatchActive
        );
        fetchMatchingCount(patientData.value.submission_id);

        // 既存 submission の値をフォームに反映
        const sub = submissionData.value;
        submissionForm.value.name = sub.name;
        submissionForm.value.submitter_email = sub.submitter_email;
        submissionForm.value.submitter_first_name = sub.submitter_first_name;
        submissionForm.value.submitter_last_name = sub.submitter_last_name;
        submissionForm.value.submitter_institution = sub.submitter_institution;
        submissionForm.value.matching_rule_genotype_info =
          sub.matching_rule_genotype_info;
        submissionForm.value.matching_rule_medical_info =
          sub.matching_rule_medical_info;
        submissionForm.value.matching_rule_phenotype_info =
          sub.matching_rule_phenotype_info;
        if (sub.restrict_matches_to_researchers)
          submissionForm.value.restrict_matches = 'researchers';
        if (sub.restrict_matches_to_providers)
          submissionForm.value.restrict_matches = 'providers';
        submissionForm.value.comment = sub.comment;

        // ローカル患者データが API より新しく、編集モードでない場合はアラートを表示して編集モードに移行
        const isLocalDataUpdated = Object.entries(
          convertedPatientData.value
        ).some(([key, value]) => {
          if (key === 'phenotype_labels' || key === 'phenotypes') return false;
          const submissionValue = sub[key]
            ? sub[key].trim().split(',').map((s) => s.trim()).filter(Boolean)
            : [];

          if (submissionValue.length !== (value?.length ?? 0)) return true;

          return (value || []).some((localValue) =>
            String(sub[key] || '').startsWith('MONDO:')
              ? !isMondoValueMatched(localValue, submissionValue)
              : !submissionValue.includes(localValue)
          );
        });
        if (isLocalDataUpdated && !isEditMode.value) {
          alert(elementTranslation['case-info-updated-alert'][lang]);
          isEditMode.value = true;
        }
      }

      // 編集モードの場合はキャンセル時に切り戻すため、フォームのスナップショットを保存
      if (isEditMode.value && !submissionFormSnapshot.value) {
        submissionFormSnapshot.value = JSON.parse(
          JSON.stringify(submissionForm.value)
        );
      }

      setInitialData();
      hasShownMatchReport.value = false;
      fetchMatchResults();
    };

    const fetchMatchResults = () => {
      if (activeTab.value !== 'matchReport' || hasShownMatchReport.value)
        return;

      if (patientData.value?.submission_id) {
        matchReportRef.value?.fetchMatchResults?.(
          patientData.value.submission_id
        );
      } else {
        matchReportRef.value?.clearMatchResults?.();
      }
      hasShownMatchReport.value = true;
    };

    const switchTab = (tabName) => {
      activeTab.value = tabName;
      fetchMatchResults();
    };

    const handleActiveToggle = () => {
      isMatchActive.value = !isMatchActive.value;
      if (isMatchActive.value) fetchMatchingCount(submissionData.value.id);
      else matchingCount.value = null;
      updateSubmissionStatus(
        submissionData.value.id,
        isMatchActive.value ? 'active' : 'suspend'
      );
    };

    const handleEdit = () => {
      submissionFormSnapshot.value = JSON.parse(
        JSON.stringify(submissionForm.value)
      );
      isEditMode.value = true;
    };

    const scrollToTop = () => {
      const container = document.querySelector('.matchingFormContent-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
      if (!validateForm()) return;

      isLoading.value = true;
      try {
        const requestBody = prepareRequestBody(submissionForm.value);
        delete requestBody.genotypes;
        delete requestBody.restrict_matches;

        let response;
        if (isFirstRegistration.value) {
          response = await createSubmission(requestBody);
        } else {
          const submissionId = submissionData.value.id;
          const oldRequestBody = submissionFormSnapshot.value
            ? prepareRequestBody(submissionFormSnapshot.value)
            : prepareRequestBody(submissionForm.value);
          delete oldRequestBody.genotypes;
          delete oldRequestBody.restrict_matches;
          const changedFields = getChangedFields(requestBody, oldRequestBody);

          if (changedFields.length === 0) {
            response = { status: 'success', data: submissionData.value };
          } else {
            const updates = Object.fromEntries(
              changedFields.map((f) => [f.column_name, f.new_value])
            );
            response = await updateSubmission(submissionId, updates, {
              fetchLatest: true,
            });
          }
        }

        if (response.status === 'success') {
          isEditMode.value = false;
          isFirstRegistration.value = false;
          clearValidationErrors();
          submissionFormSnapshot.value = null;
          showToastMessage(
            elementTranslation['submission-success-message'][lang],
            'success',
            3000
          );
          submissionData.value = response.data;
          isMatchActive.value = response.data.status === 'active';
          hasShownMatchReport.value = false;
          patientData.value.submission_id = response.data.id;
          fetchMatchingCount(response.data.id);

          const currentContentData = contentData.find(
            (data) => data.PCFNo === effectivePcfNo.value
          );
          currentContentData.submission_id = response.data.id;
          currentContentData.share_id = requestBody.name;

          addShareIdColumn();

          const exportData = getJSONDownload(
            contentData.map((data) =>
              data.PCFNo === effectivePcfNo.value ? currentContentData : data
            )
          );
          exportFile('json', exportData, {
            overwrite: !isFirstRegistration.value,
          });
        } else {
          throw new Error(
            response.body?.error?.message || 'Failed to save submission'
          );
        }
      } catch (error) {
        showToastMessage(error.message, 'error', 5000);
      } finally {
        isLoading.value = false;
        scrollToTop();
      }
    };

    const handleCancel = () => {
      // TODO: キャンセルボタンを押してもロールバックできない不具合を解決
      if (submissionFormSnapshot.value) {
        submissionForm.value = JSON.parse(
          JSON.stringify(submissionFormSnapshot.value)
        );
        submissionFormSnapshot.value = null;
      }
      isEditMode.value = false;
      clearValidationErrors();
    };

    const openDeleteSubmissionModal = () => {
      showDeleteModal.value = true;
    };
    const closeDeleteModal = () => {
      showDeleteModal.value = false;
    };
    const confirmDeleteSubmission = async () => {
      closeDeleteModal();
      await handleDeleteSubmission();
    };

    const handleDeleteSubmission = async () => {
      try {
        await deleteSubmission(submissionData.value.id);

        clearValidationErrors();
        showToastMessage(
          elementTranslation['submission-deleted-message'][lang],
          'success',
          3000
        );
        submissionData.value = {};
        isMatchActive.value = false;
        isFirstRegistration.value = true;
        matchingCount.value = null;
        submissionFormSnapshot.value = null;
        hasShownMatchReport.value = false;

        // フォームを初期状態にリセットして編集モードへ
        submissionForm.value = createInitialFormState();
        submissionForm.value.name = patientData.value.PCFNo;
        const loginUser = window.pcfLoginUserInfo;
        if (loginUser) {
          submissionForm.value.submitter_email = loginUser.email || '';
          submissionForm.value.submitter_first_name = loginUser.first_name_en || '';
          submissionForm.value.submitter_last_name = loginUser.last_name_en || '';
          submissionForm.value.submitter_institution = loginUser.affiliation_en || '';
        }
        setInitialData();
        isEditMode.value = true;

        const targetContentData = contentData.find(
          (data) => data.PCFNo === effectivePcfNo.value
        );
        delete targetContentData.submission_id;
        delete targetContentData.share_id;

        const exportData = getJSONDownload(contentData);
        exportFile('json', exportData, { overwrite: true });
      } catch (error) {
        showToastMessage(
          error.message || 'Failed to delete submission',
          'error',
          5000
        );
      }
    };

    onMounted(() => {
      initialize();
      window.matchingFormRefresh = initialize;
      if (!props.pcfNo) {
        window.matchingFormInitialize = initialize;
      }
    });

    onActivated(() => {
      if (props.pcfNo) {
        initialize();
        window.matchingFormRefresh = initialize;
      }
    });

    return {
      activeTab,
      switchTab,
      showMatchingRuleHelp,
      submissionForm,
      isFirstRegistration,
      medicalInfoItems,
      medicalInfoAllChecked,
      medicalInfoIndeterminate,
      onToggleAllMedicalInfo,
      phenotypeInfoAllChecked,
      phenotypeInfoIndeterminate,
      onToggleAllPhenotypeInfo,
      matchAgainstOtherSubmissions,
      agreeToSaveSubmissionId,
      mondoMapping,
      mondoMappingIdIndex,
      mondoMappingLabelIndex,
      hpoMapping,
      isMatchActive,
      handleActiveToggle,
      handleEdit,
      isEditMode,
      handleSave,
      handleCancel,
      handleDeleteSubmission,
      openDeleteSubmissionModal,
      closeDeleteModal,
      confirmDeleteSubmission,
      showDeleteModal,
      RESTRICT_MATCH_INFO,
      validationErrors,
      validateForm,
      clearValidationErrors,
      isLoading,
      toast,
      showToast,
      elementTranslation,
      lang,
      hideToast,
      hasShownMatchReport,
      matchReportRef,
      apiRequest,
      showToastMessage,
      matchingCount,
    };
  },
  template: getTemplate(),
});

// --- Helpers ---

function createInitialFormState() {
  return {
    name: '',
    submitter_email: '',
    submitter_first_name: '',
    submitter_last_name: '',
    submitter_institution: '',
    suspected_diseases: [],
    clinical_diagnoses: [],
    final_diagnoses: [],
    phenotypes: [],
    genotypes: [],
    matching_rule_medical_info: 'ignored',
    matching_rule_phenotype_info: 'ignored',
    matching_rule_genotype_info: 'ignored',
    restrict_matches: '',
    restrict_matches_to_researchers: false,
    restrict_matches_to_providers: false,
    comment: '',
  };
}

function getTemplate() {
  return `
    <div class="matchingFormContent-root">
      <div class="matchingFormContent-header">
        <div class="matchingFormContent-headerInner">
          <h1 class="matchingFormContent-headerTitle">CaseSharing Database</h1>
        </div>
      </div>

      <div class="matchingFormContent-container">
        <div class="matchingFormContent-containerInner">
          <!-- タブ: Submission / Match Report -->
          <div class="tabs">
            <div class="tab" :class="{ active: activeTab === 'submission' }" @click="switchTab('submission')">
              Submission
              <template v-if="!isFirstRegistration"> /
                <span v-if="isMatchActive" class="status-active">Active</span>
                <span v-else class="status-suspended">Suspended</span>
              </template>
            </div>
            <div class="tab" :class="{ active: activeTab === 'matchReport' }" @click="switchTab('matchReport')">
              Match Report
              <span v-if="matchingCount !== null" class="tab-badge">{{ matchingCount }}</span>
            </div>
          </div>

          <!-- Submission タブ: アクションボタン -->
          <div v-show="activeTab === 'submission'" class="action-buttons">
            <template v-if="!isEditMode">
              <button class="status-button" @click="handleActiveToggle">
                {{ isMatchActive ? 'Suspended' : 'Active' }}
              </button>
              <button class="status-button" @click="handleEdit">Edit</button>
            </template>
            <template v-else>
              <button class="editing-button">Editing</button>
            </template>
          </div>

          <!-- Submission フォーム本体 -->
          <div v-show="activeTab === 'submission'" class="submission-section">
            <!-- Submission Identification -->
            <div class="form-section">
              <h2 class="section-title">Submission Identification</h2>

              <div class="form-group" data-error-key="name">
                <label for="share_id">Share ID</label>
                <input v-if="isEditMode" v-model="submissionForm.name" type="text" id="share_id" class="form-input readonly-input" :class="{ 'error': validationErrors.name }" readonly tabindex="-1">
                <div v-else class="display-value">{{ submissionForm.name }}</div>
                <div v-if="validationErrors.name" class="error-message">{{ validationErrors.name }}</div>
              </div>

              <div v-if="isEditMode" class="form-group" data-error-key="submitter_email">
                <label for="submitterEmail">Submitter e-mail</label>
                <input v-model="submissionForm.submitter_email" type="email" id="submitterEmail" class="form-input" autocomplete="email" :class="{ 'error': validationErrors.submitter_email }">
                <div v-if="validationErrors.submitter_email" class="error-message">{{ validationErrors.submitter_email }}</div>
              </div>

              <div v-if="isEditMode" class="form-group" data-error-key="submitter_first_name">
                <label for="first_name">Submitter first name</label>
                <input v-model="submissionForm.submitter_first_name" type="text" id="first_name" class="form-input" autocomplete="given-name" :class="{ 'error': validationErrors.submitter_first_name }">
                <div v-if="validationErrors.submitter_first_name" class="error-message">{{ validationErrors.submitter_first_name }}</div>
              </div>

              <div v-if="isEditMode" class="form-group" data-error-key="submitter_last_name">
                <label for="last_name">Submitter last name</label>
                <input v-model="submissionForm.submitter_last_name" type="text" id="last_name" class="form-input" autocomplete="family-name" :class="{ 'error': validationErrors.submitter_last_name }">
                <div v-if="validationErrors.submitter_last_name" class="error-message">{{ validationErrors.submitter_last_name }}</div>
              </div>

              <div v-if="isEditMode" class="form-group" data-error-key="submitter_institution">
                <label for="submitterInstitution">Submitter institution</label>
                <input v-model="submissionForm.submitter_institution" type="text" id="submitterInstitution" class="form-input" autocomplete="organization" :class="{ 'error': validationErrors.submitter_institution }">
                <div v-if="validationErrors.submitter_institution" class="error-message">{{ validationErrors.submitter_institution }}</div>
              </div>

              <div v-if="!isEditMode" class="form-group">
                <label>Submitter</label>
                <div class="display-value">{{ submissionForm.submitter_email }} - {{ submissionForm.submitter_first_name }} {{ submissionForm.submitter_last_name }} - {{ submissionForm.submitter_institution }}</div>
              </div>

              <div v-if="!isEditMode" class="form-group">
                <label>Created</label>
                <div class="display-value">March 19, 2024</div>
              </div>

              <div v-if="!isEditMode" class="form-group">
                <label>Updated</label>
                <div class="display-value">March 19, 2024</div>
              </div>
            </div>

            <!-- Medical Info -->
            <div class="form-section">
              <h2 class="section-title">Medical Info</h2>

              <div v-if="isEditMode && medicalInfoItems.length > 0" class="checkbox-group">
                <label class="checkbox-label">
                  <input :checked="medicalInfoAllChecked" :indeterminate.prop="medicalInfoIndeterminate" type="checkbox" class="checkbox" @change="onToggleAllMedicalInfo">
                  Select All
                </label>
              </div>

              <template v-if="isEditMode">
                <div v-if="submissionForm.suspected_diseases.length > 0" class="subsection">
                  <h3 class="subsection-title">Suspected Disease Name</h3>
                  <div v-for="disease in submissionForm.suspected_diseases" :key="disease.id" class="checkbox-group">
                    <label class="checkbox-label">
                      <input v-model="disease.checked" type="checkbox" class="checkbox">
                      {{disease.id}} {{disease.name}}
                    </label>
                  </div>
                </div>

                <div v-if="submissionForm.clinical_diagnoses.length > 0" class="subsection">
                  <h3 class="subsection-title">Clinical Diagnosis</h3>
                  <div v-for="diagnosis in submissionForm.clinical_diagnoses" :key="diagnosis.id" class="checkbox-group">
                    <label class="checkbox-label">
                      <input v-model="diagnosis.checked" type="checkbox" class="checkbox">
                      {{diagnosis.id}} {{diagnosis.name}}
                    </label>
                  </div>
                </div>

                <div v-if="submissionForm.final_diagnoses.length > 0" class="subsection">
                  <h3 class="subsection-title">Final Diagnosis</h3>
                  <div v-for="diagnosis in submissionForm.final_diagnoses" :key="diagnosis.id + '_final'" class="checkbox-group">
                    <label class="checkbox-label">
                      <input v-model="diagnosis.checked" type="checkbox" class="checkbox">
                      {{diagnosis.id}} {{diagnosis.name}}
                    </label>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="medical-info-display">
                  <h3 class="medical-info-section-title">Suspected Disease Name</h3>
                  <div v-for="disease in submissionForm.suspected_diseases.filter(d => d.checked)" :key="disease.id" class="display-value">
                    {{disease.id}} {{disease.name}}
                  </div>

                  <h3 class="medical-info-section-title">Clinical Diagnosis</h3>
                  <div v-for="diagnosis in submissionForm.clinical_diagnoses.filter(d => d.checked)" :key="diagnosis.id" class="display-value">
                    {{diagnosis.id}} {{diagnosis.name}}
                  </div>

                  <h3 class="medical-info-section-title">Final Diagnosis</h3>
                  <div class="display-value">
                    {{ submissionForm.final_diagnoses.filter(d => d.checked).map(d => d.id + ' ' + d.name).join(', ') }}
                  </div>
                </div>
              </template>
            </div>

            <div class="form-section">
              <h2 class="section-title">Phenotype Info</h2>
              <template v-if="isEditMode && submissionForm.phenotypes.length > 0">
                <p class="section-description">Share the phenotypic features in the notification emails</p>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input :checked="phenotypeInfoAllChecked" type="checkbox" class="checkbox" :indeterminate.prop="phenotypeInfoIndeterminate" @change="onToggleAllPhenotypeInfo">
                    Select All
                  </label>
                </div>
              </template>

              <template v-if="isEditMode">
                <div class="subsection">
                  <div v-for="phenotype in submissionForm.phenotypes" :key="phenotype.name" class="checkbox-group">
                    <label class="checkbox-label">
                      <input v-model="phenotype.checked" type="checkbox" class="checkbox">
                      {{phenotype.name}} {{phenotype.label}}
                    </label>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="phenotype-info-display">
                  <div class="display-value">
                    {{ submissionForm.phenotypes.filter(p => p.checked).map(p => p.name + ' ' + p.label).join(', ') }}
                  </div>
                </div>
              </template>
            </div>

            <!-- Genotype Info -->
            <div class="form-section">
              <h2 class="section-title">
                Genotype Info
              </h2>

              <template v-if="isEditMode">
                <div v-for="(genotype, index) in submissionForm.genotypes" :key="index" class="genotype-item">
                  <label class="genotype-checkbox">
                    <input v-model="genotype.checked" type="checkbox" class="checkbox">
                    <div class="genotype-details">
                      <div class="genotype-row">
                        <div class="genotype-field">
                          <span class="field-label">Gene Symbol</span>
                          <span class="field-value">{{genotype.geneSymbols}}</span>
                        </div>
                        <div class="genotype-field">
                          <span class="field-label">Ensemble ID</span>
                          <span class="field-value">{{genotype.ensemblIds}}</span>
                        </div>
                        <div class="genotype-field">
                          <span class="field-label">NCBI Gene ID</span>
                          <span class="field-value">{{genotype.entrezIds}}</span>
                        </div>
                        <div v-if="genotype.zygosity" class="genotype-field">
                          <span class="field-label">Zygosity</span>
                          <span class="field-value">{{genotype.zygosity}}</span>
                        </div>
                        <div v-if="genotype.inheritance" class="genotype-field">
                          <span class="field-label">Inheritance</span>
                          <span class="field-value">{{genotype.inheritance}}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </template>

              <template v-else>
                <div v-for="(genotype, index) in submissionForm.genotypes.filter(g => g.checked)" :key="index" class="genotype-item">
                  <div class="genotype-details genotype-details-display">
                    <div class="genotype-row">
                      <div class="genotype-field">
                        <span class="field-label">Gene Symbol</span>
                        <span class="field-value">{{genotype.geneSymbols}}</span>
                      </div>
                      <div class="genotype-field">
                        <span class="field-label">Ensemble ID</span>
                        <span class="field-value">{{genotype.ensemblIds}}</span>
                      </div>
                      <div class="genotype-field">
                        <span class="field-label">NCBI Gene ID</span>
                        <span class="field-value">{{genotype.entrezIds}}</span>
                      </div>
                      <div v-if="genotype.zygosity" class="genotype-field">
                        <span class="field-label">Zygosity</span>
                        <span class="field-value">{{genotype.zygosity}}</span>
                      </div>
                      <div v-if="genotype.inheritance" class="genotype-field">
                        <span class="field-label">Inheritance</span>
                        <span class="field-value">{{genotype.inheritance}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Matching Rules -->
            <div class="form-section" data-error-key="matching_rules">
              <h2 class="section-title">
                Matching Rules
                <div class="help-icon" @mouseover="showMatchingRuleHelp = true" @mouseleave="showMatchingRuleHelp = false">
                  ?
                  <div v-if="showMatchingRuleHelp" class="matching-rule-help">
                    <div class="matching-rule-help-list">
                      <dl>
                        <dt class="matching-rule-help-list-title">Required:</dt>
                        <dd class="matching-rule-help-list-description">{{ elementTranslation['matching-rule-required-description'][lang] }}</dd>
                        <dt class="matching-rule-help-list-title">Optional:</dt>
                        <dd class="matching-rule-help-list-description">{{ elementTranslation['matching-rule-optional-description'][lang] }}</dd>
                        <dt class="matching-rule-help-list-title">Ignored:</dt>
                        <dd class="matching-rule-help-list-description">{{ elementTranslation['matching-rule-ignored-description'][lang] }}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </h2>

              <div v-if="validationErrors.matching_rules" class="error-message matching-rules-error">
                {{ validationErrors.matching_rules }}
              </div>

              <template v-if="isEditMode">
                <div class="matching-rules">
                  <div class="rule-group" data-error-key="medical_info">
                    <label for="medical_info_select" class="rule-label"><span>Medical Info</span></label>
                    <select v-model="submissionForm.matching_rule_medical_info" id="medical_info_select" class="form-select">
                      <option value="required">Required</option>
                      <option value="optional">Optional</option>
                      <option value="ignored">Ignored</option>
                    </select>
                    <div v-if="validationErrors.medical_info" class="error-message">{{ validationErrors.medical_info }}</div>
                  </div>

                  <div class="rule-group" data-error-key="phenotype_info">
                    <label for="phenotype_info_select" class="rule-label"><span>Phenotype Info</span></label>
                    <select v-model="submissionForm.matching_rule_phenotype_info" id="phenotype_info_select" class="form-select">
                      <option value="required">Required</option>
                      <option value="optional">Optional</option>
                      <option value="ignored">Ignored</option>
                    </select>
                    <div v-if="validationErrors.phenotype_info" class="error-message">{{ validationErrors.phenotype_info }}</div>
                  </div>

                  <div class="rule-group" data-error-key="genotype_info">
                    <label for="genotype_info_select" class="rule-label"><span>Genotype Info</span></label>
                    <select v-model="submissionForm.matching_rule_genotype_info" id="genotype_info_select" class="form-select">
                      <option value="required">Required</option>
                      <option value="optional">Optional</option>
                      <option value="ignored">Ignored</option>
                    </select>
                    <div v-if="validationErrors.genotype_info" class="error-message">{{ validationErrors.genotype_info }}</div>
                  </div>

                  <!-- SKIP: Restrict matches to（マッチングロジック未使用のため非表示）
                  <div class="restrict-section">
                    <h3>Restrict matches to</h3>
                    <div class="restrict-inner-section">
                      <div>
                        <label class="radio-label radio-group">
                          <input v-model="submissionForm.restrict_matches" value="researchers" type="radio" name="restrict-match" class="radio-button" />
                          Researchers
                        </label>
                        <label class="radio-label radio-group">
                          <input v-model="submissionForm.restrict_matches" value="providers" type="radio" name="restrict-match" class="radio-button" />
                          Health Care Providers
                        </label>
                      </div>
                      <div class="radio-clear" @click="submissionForm.restrict_matches=''">Clear</div>
                    </div>
                  </div>
                  -->
                </div>
              </template>

              <template v-else>
                <div class="matching-rules-display">
                  <div class="rule-display-group">
                    <span class="rule-display-label">Medical Info</span>
                    <span class="rule-display-value">{{ submissionForm.matching_rule_medical_info }}</span>
                  </div>
                  <div class="rule-display-group">
                    <span class="rule-display-label">Phenotype Info</span>
                    <span class="rule-display-value">{{ submissionForm.matching_rule_phenotype_info }}</span>
                  </div>
                  <div class="rule-display-group">
                    <span class="rule-display-label">Gene symbol</span>
                    <span class="rule-display-value">{{ submissionForm.matching_rule_genotype_info }}</span>
                  </div>
                  <!-- SKIP: Restrict matches to（マッチングロジック未使用のため非表示）
                  <div class="rule-display-group">
                    <span class="rule-display-label">Restrict matches to</span>
                    <span class="rule-display-value">{{ RESTRICT_MATCH_INFO[submissionForm.restrict_matches]?.label }}</span>
                  </div>
                  -->
                </div>
              </template>
            </div>

            <!-- Other (Comment) -->
            <div class="form-section">
              <h2 class="section-title">Other</h2>
              <div v-if="isEditMode" class="form-group">
                <label for="comment" class="form-label">Comment</label>
                <textarea v-model="submissionForm.comment" id="comment" class="form-textarea" rows="4" placeholder="Enter any additional comments..."></textarea>
              </div>
              <div v-else>
                <div class="form-group">
                  <label for="comment" class="form-label">Comment</label>
                  <div class="display-value" style="white-space: pre-wrap;">{{ submissionForm.comment }}</div>
                </div>
              </div>
            </div>

            <!-- Submission confirmation & matching / 保存・キャンセル・削除ボタン -->
            <div v-if="isEditMode" class="form-section">
              <h2 class="section-title">Submission confirmation & matching</h2>

              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input v-model="matchAgainstOtherSubmissions" type="checkbox" class="checkbox">
                  Match against other CaseSharing submissions when this submission is saved
                </label>
              </div>

              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input v-model="agreeToSaveSubmissionId" type="checkbox" class="checkbox">
                  I understand that a window will automatically open after Submit to save the Submission ID in the JSON file.
                </label>
              </div>

              <div v-if="isEditMode && isFirstRegistration" class="form-section">
                <button class="submit-button" @click="handleSave" :disabled="!agreeToSaveSubmissionId || isLoading">
                  <span v-if="isLoading" class="loading-spinner"></span>
                  {{ isLoading ? 'Submitting...' : 'Submit & Download File' }}
                </button>
              </div>
              <div v-else-if="isEditMode" class="edit-mode-buttons">
                <div>
                  <button class="save-button" @click="handleSave" :disabled="!agreeToSaveSubmissionId || !matchAgainstOtherSubmissions || isLoading">
                    <span v-if="isLoading" class="loading-spinner"></span>
                    {{ isLoading ? 'Saving...' : 'Save & Download File' }}
                  </button>
                  <button class="cancel-button" @click="handleCancel">Cancel</button>
                </div>
                <div>
                  <button class="delete-button" @click="openDeleteSubmissionModal">Delete submission</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Match Report タブ -->
          <MatchingReport
            ref="matchReportRef"
            v-show="activeTab === 'matchReport'"
            :mondoMapping="mondoMapping"
            :mondoMappingIdIndex="mondoMappingIdIndex"
            :mondoMappingLabelIndex="mondoMappingLabelIndex"
            :hpoMapping="hpoMapping"
            :lang="lang"
            :apiRequest="apiRequest"
            :showToastMessage="showToastMessage"
          />
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-show="showToast" class="toast-container" :class="toast.type">
        <span class="toast-message">{{ toast.message }}</span>
        <button v-if="toast.type === 'error'" @click="hideToast" class="toast-close-button" aria-label="Close">×</button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">{{ elementTranslation['delete-submission-modal-title'][lang] }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ elementTranslation['delete-submission-modal-message'][lang] }}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-button modal-button-cancel" @click="closeDeleteModal">
              {{ elementTranslation['delete-submission-modal-cancel'][lang] }}
            </button>
            <button class="modal-button modal-button-confirm" @click="confirmDeleteSubmission">
              {{ elementTranslation['delete-submission-modal-confirm'][lang] }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
