/**
 * Toast 通知の表示・非表示を管理する composable
 */
import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

export function useToast() {
  const showToast = ref(false);
  const toast = ref({
    message: '',
    type: 'info',
  });

  const showToastMessage = (message, type = 'info', duration = 3000) => {
    toast.value = { message, type };
    showToast.value = true;

    // エラーの場合は自動で消えない（×ボタンでのみ消せる）
    if (type !== 'error') {
      setTimeout(() => hideToast(), duration);
    }
  };

  const hideToast = () => {
    showToast.value = false;
    toast.value = { message: '', type: 'info' };
  };

  return {
    showToast,
    toast,
    showToastMessage,
    hideToast,
  };
}
