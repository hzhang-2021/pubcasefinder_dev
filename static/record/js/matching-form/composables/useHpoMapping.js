import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

export function useHpoMapping() {
  const hpoMapping = ref(new Map());

  const fetchHpoMappingFile = async () => {
    if (hpoMapping.value.size > 0) return;
    try {
      const response = await fetch('/static/data/HPO-japanese.20221104.txt');
      const text = await response.text();
      const map = new Map();
      text.split('\n').forEach(row => {
        const cols = row.split('\t');
        if (cols[4]?.trim() === 'label') {
          map.set(cols[0], { name_en: cols[1] || '', name_ja: cols[2] || '' });
        }
      });
      hpoMapping.value = map;
    } catch (error) {
      console.error('Failed to fetch HPO mapping:', error);
    }
  };

  return { hpoMapping, fetchHpoMappingFile };
}
