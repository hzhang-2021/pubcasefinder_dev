/**
 * MatchingFormWrapper - PCF No. ごとに MatchingForm を分離管理するラッパー
 *
 * keep-alive により症例切り替え時に各症例の状態を保持する。
 * CustomEvent 'matchingFormPatientChange' で症例変更を検知。
 */
import { ref, defineComponent, onMounted, onUnmounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import MatchingForm from './MatchingForm.vue.js';

const KEEP_ALIVE_MAX = 10; // メモリ制限のためキャッシュする症例数を上限

export default defineComponent({
  name: 'MatchingFormWrapper',
  components: { MatchingForm },
  setup() {
    const currentPatient = ref('');

    const handlePatientChange = (e) => {
      const pcfNo = e?.detail?.pcfNo ?? '';
      currentPatient.value = pcfNo;
    };

    onMounted(() => {
      window.addEventListener('matchingFormPatientChange', handlePatientChange);

      const pcfNo =
        (typeof window.__currentPatientForMatchingForm !== 'undefined'
          ? window.__currentPatientForMatchingForm
          : '') || '';
      currentPatient.value = pcfNo;

      window.matchingFormSetPatient = (pcfNo) => {
        currentPatient.value = pcfNo ?? '';
      };

      window.matchingFormInitialize = () => {
        const pcfNo =
          (typeof window.__currentPatientForMatchingForm !== 'undefined'
            ? window.__currentPatientForMatchingForm
            : '') || '';
        currentPatient.value = pcfNo;
        window.dispatchEvent(
          new CustomEvent('matchingFormPatientChange', { detail: { pcfNo } })
        );
        window.matchingFormRefresh?.();
      };
    });

    onUnmounted(() => {
      window.removeEventListener('matchingFormPatientChange', handlePatientChange);
      delete window.matchingFormSetPatient;
      delete window.matchingFormInitialize;
      delete window.matchingFormRefresh;
    });

    return { currentPatient };
  },
  template: `
    <keep-alive :max="KEEP_ALIVE_MAX">
      <MatchingForm
        v-if="currentPatient"
        :key="currentPatient"
        :pcf-no="currentPatient"
      />
    </keep-alive>
  `,
});
