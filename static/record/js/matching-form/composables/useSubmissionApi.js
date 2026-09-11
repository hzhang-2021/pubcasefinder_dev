/**
 * Submission 関連の API リクエストを管理する composable
 */
export function useSubmissionApi(showToastMessage) {
  const apiRequest = async (url, options = {}) => {
    const mergedOptions = { ...options };
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  };

  const fetchSubmissionData = async (
    submissionId,
    submissionDataRef,
    isMatchActiveRef
  ) => {
    const lang = document.documentElement.lang;
    try {
      const responseData = await apiRequest(
        `/casesharing/submissions/${submissionId}`,
        { method: 'GET' }
      );
      submissionDataRef.value = responseData.data;
      isMatchActiveRef.value = responseData.data.status === 'active';
    } catch (error) {
      showToastMessage(
        elementTranslation['fetch-submission-error'][lang],
        'error',
        5000
      );
    }
  };

  /** POST: 新規 submission 作成 */
  const createSubmission = async (requestBody) => {
    return apiRequest('/casesharing/submissions/', {
      method: 'POST',
      body: new URLSearchParams(requestBody),
    });
  };

  /**
   * PUT: submission 更新
   * @param {string} submissionId
   * @param {Object} updates - { column_name: new_value, ... }
   * @param {boolean} fetchLatest - 成功時に最新データを再取得するか
   */
  const updateSubmission = async (
    submissionId,
    updates,
    { fetchLatest = false } = {}
  ) => {
    const response = await apiRequest(
      `/casesharing/submissions/${submissionId}`,
      { method: 'PUT', body: new URLSearchParams(updates) }
    );
    if (fetchLatest && response.status === 'success') {
      const latestData = await apiRequest(
        `/casesharing/submissions/${submissionId}`,
        { method: 'GET' }
      );
      response.data = latestData.data;
    }
    return response;
  };

  /**
   * PUT: submission の status（active/suspend）を更新
   * @param {string} submissionId
   * @param {'active'|'suspend'} status
   */
  const updateSubmissionStatus = async (submissionId, status) => {
    return apiRequest(`/casesharing/submissions/${submissionId}`, {
      method: 'PUT',
      body: new URLSearchParams({
        status: status,
      }),
    });
  };

  /**
   * DELETE: submission 削除
   * レスポンスボディが空の可能性があるため raw fetch を使用
   */
  const deleteSubmission = async (submissionId) => {
    const response = await fetch(
      `/casesharing/submissions/${submissionId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  };

  /** GET: submission に紐づくマッチ件数取得 */
  const fetchMatchingCount = async (submissionId) => {
    return apiRequest(`/casesharing/count-matchings/${submissionId}`, {
      method: 'GET',
    });
  };

  return {
    apiRequest,
    fetchSubmissionData,
    createSubmission,
    updateSubmission,
    updateSubmissionStatus,
    deleteSubmission,
    fetchMatchingCount,
  };
}
