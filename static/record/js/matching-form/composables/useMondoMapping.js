/**
 * MONDO オントロジーのマッピングデータを取得・管理する composable
 * TSV ファイルを読み込み、ID やラベル名のインデックスを計算する
 */
import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

/**
 * @param {string} lang - 言語コード (ja / en)
 */
export function useMondoMapping(lang) {
  const mondoMapping = ref([]);

  const mondoMappingIdIndex = computed(() =>
    mondoMapping.value.length > 0 ? mondoMapping.value[0].indexOf('id') : -1
  );

  const mondoMappingLabelIndex = computed(() =>
    mondoMapping.value.length > 0
      ? lang === 'ja'
        ? mondoMapping.value[0].indexOf('label_ja')
        : mondoMapping.value[0].indexOf('label_en')
      : -1
  );

  const fetchMappingTsv = async () => {
    if (mondoMapping.value.length > 0) return;
    try {
      const response = await fetch('/static/data/mondo_utf8.tsv');
      const text = await response.text();
      mondoMapping.value = text.split('\n').map((row) =>
        row.split('\t').map((cell) => cell.replace(/^"|"$/g, ''))
      );
    } catch (error) {
      console.error('Failed to fetch MONDO mapping:', error);
    }
  };

  /**
   * ローカルデータの値が MONDO マッピング上で submission の値と一致するか判定
   * （親子関係など MONDO の階層を考慮した比較）
   */
  const isMondoValueMatched = (localValue, submissionValues) =>
    submissionValues.some((submissionValue) => {
      const mondoRow = mondoMapping.value.find((row) => row[0] === submissionValue);
      return mondoRow && mondoRow.includes(localValue);
    });

  /**
   * 名前から MONDO ID を取得する関数を生成
   * generateSingleCheckStates に渡すコールバック用
   */
  const createGetMondoId = () => {
    const idIdx = mondoMappingIdIndex.value;
    const labelIdx = mondoMappingLabelIndex.value;
    if (idIdx === -1 || labelIdx === -1) return () => '';

    return (name) =>
      mondoMapping.value.find((row) => row[labelIdx] === name)?.[idIdx] || '';
  };

  return {
    mondoMapping,
    mondoMappingIdIndex,
    mondoMappingLabelIndex,
    fetchMappingTsv,
    isMondoValueMatched,
    createGetMondoId,
  };
}
