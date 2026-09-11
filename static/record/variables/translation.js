let elementTranslation = {
  sample: {
    en: "",
    ja: "",
    ko: "",
  },
  search_input: {
    en: "Search keyword",
    ja: "キーワード検索",
    ko: "키워드 검색",
  },
  add: {
    en: "Add",
    ja: "追加",
    ko: "추가",
  },
  "add-column": {
    en: "Add item",
    ja: "項目追加",
    ko: "항목 추가",
  },
  "add-row": {
    en: "Add case",
    ja: "症例追加",
    ko: "사례 추가",
  },
  select: {
    en: "- Select -",
    ja: "- 選択 -",
    ko: "- 선택 -",
  },
  "select-family": {
    en: "- Registered Family -",
    ja: "- 登録済み家族ID -",
    ko: "- 등록된 가족 ID -",
  },
  "select-group": {
    en: "- Registered Group -",
    ja: "- 登録済みグループ名 -",
    ko: "- 등록된 그룹명 -",
  },
  "select-year": {
    en: "- Select Year -",
    ja: "- 年を選択 -",
    ko: "- 연도 선택 -",
  },
  "select-month": {
    en: "- Select Month -",
    ja: "- 月を選択 -",
    ko: "- 월 선택 -",
  },
  "select-age-month": {
    en: "- Select Month -",
    ja: "- ヶ月を選択 -",
    ko: "- 월 선택 -",
  },
  "select-day": {
    en: "- Select Day -",
    ja: "- 日を選択 -",
    ko: "- 날짜 선택 -",
  },
  "select-spouse": {
    en: "- Select Spouse -",
    ja: "- 誰の配偶者かを選択 -",
    ko: "- 배우자 선택 -",
  },
  "select-parent": {
    en: "- Select Parent -",
    ja: "- 親を選択 -",
    ko: "- 부모 선택 -",
  },
  medical_body_info: {
    en: "Growth Chart",
    ja: "身体情報",
    ko: "신체 정보",
  },
  medical_body_info_date: {
    en: "Date(yyyy/mm/dd)",
    ja: "日付(yyyy/mm/dd)",
    ko: "날짜(yyyy/mm/dd)",
  },
  growthChart: {
    en: "Growth Chart",
    ja: "身体情報",
    ko: "신체 정보",
  },
  date: {
    en: "Date(yyyy/mm/dd)",
    ja: "日付(yyyy/mm/dd)",
    ko: "날짜(yyyy/mm/dd)",
  },
  // modified by hzhang@bits start
  //'phenotypic-info-search': {
  //    en: 'Search Phenotypic Information',
  //    ja: 'ここに表現型情報が検索できます。',
  //    ko: ''
  //}
  "phenotypic-info-add": {
    en: "ADD TO LIST",
    ja: "一覧に追加",
    ko: "목록에 추가",
  },
  "phenotypic-info-anytext": {
    en: "Any Text",
    ja: "任意のテキスト",
    ko: "임의의 텍스트",
  },
  "phenotypic-info-list": {
    en: "Symptoms list",
    ja: "症状一覧",
    ko: "증상 목록",
  },
  "phenotypic-info-detail": {
    en: "Show details",
    ja: "詳細を表示",
    ko: "자세히 보기",
  },
  "phenotypic-info-filter-selectall": {
    en: "Select all",
    ja: "すべて選択",
    ko: "모두 선택",
  },
  "phenotypic-info-filter-clearall": {
    en: "CLEAR ALL",
    ja: "すべてクリア",
    ko: "모두 클리어",
  },
  "comfirm-delete": {
    en: "Are you sure you want to delete this item?",
    ja: "削除しますか？",
    ko: "삭제하시겠습니까?",
  },
  "confirm-case-delete": {
    en: "Are you sure you want to delete case {caseId}?",
    ja: "症例ID {caseId} を削除しますか？",
    ko: "케이스 ID {caseId}를 삭제하시겠습니까?",
  },
  "confirm-file-import": {
    en: "When the file is opened, the entered data will be lost. Are you sure you want to open the file?",
    ja: "ファイルを開くと、入力されたデータが失われます。ファイルを開きますか？",
    ko: "파일을 열면 입력된 데이터가 손실됩니다. 파일을 열겠습니까?",
  },
  "confirm-file-merge": {
    en: "The uploaded data will be merged with the data currently being edited. This operation cannot be undone. Do you want to merge data?",
    ja: "アップロードしたデータは、現在編集中のデータにマージされます。この操作は元に戻せません。データをマージしますか？",
    ko: "업로드한 데이터는 현재 편집 중인 데이터에 병합됩니다. 이 작업은 되돌릴 수 없습니다. 데이터를 병합하시겠습니까?",
  },
  // modified by hzhang@bits end
  "add-column-input": {
    en: "New custom column",
    ja: "新規項目",
    ko: "신규 항목",
  },
  "add-column-button": {
    en: "Create",
    ja: "作成",
    ko: "만들기",
  },
  "chart-title-case-count": {
    en: "Number of cases",
    ja: "症例数",
    ko: "사례 수",
  },
  "chart-title-family-count": {
    en: "Number of families",
    ja: "家系数",
    ko: "가족 수",
  },
  "chart-count-most-family": {
    en: "The most common family",
    ja: "一番多い家系",
    ko: "가장 많은 가족",
  },
  "chart-title-group-count": {
    en: "Number of groups",
    ja: "グループ数",
    ko: "그룹 수",
  },
  "chart-count-most-group": {
    en: "The most common group",
    ja: "一番多いグループ",
    ko: "가장 많은 그룹",
  },
  "chart-title-age": {
    en: 'Age on registration',
    ja: '登録時年齢',
    ko: "등록시 연령",
    zh: "年龄",
    zhcht: "年龄",
  },
  "chart-title-sex": {
    en: "Sex",
    ja: "性別",
    ko: "성별",
    zh: "性别",
    zhcht: "性别",
  },
  "chart-title-group": {
    en: "Group",
    ja: "グループ名",
    ko: "그룹",
    zh: "团体",
    zhcht: "团体",
  },
  "chart-title-sympton": {
    en: "Temporal progression and severity of symptoms (by disease)",
    ja: "症状の経時的推移と重症度（疾患別）",
    ko: "질병별 증상의 시간적 경과와 중증도",
  },
  "chart-title-null": {
    en: "Null",
    ja: "未記入",
    ko: "미기입",
    zh: "未填写",
    zhcht: "未填写",
  },
  "chart-label-null": {
    en: "Null",
    ja: "未記入",
    ko: "미기입",
  },
  "chart-multiple-age-sex-x": {
    en: "Age",
    ja: "年齢",
    ko: "시대",
  },
  "chart-multiple-age-sex-y": {
    en: "# of cases",
    ja: "症例数",
    ko: "사례 수",
  },
  case_id: {
    en: "Case ID",
    ja: "症例ID",
    ko: "의료사례 ID",
    zh: "案件ID",
    zhcht: "案件ID",
  },
  final_diagnosis: {
    en: "Final Diagnosis",
    ja: "確定診断",
    ko: "최종진단",
    zh: "确诊诊断",
    zhcht: "確診診斷",
  },
  final_diagnosis_name: {
    en: "Final Diagnosis Name",
    ja: "確定診断_疾患名",
    ko: "최종진단명",
    zh: "确诊诊断名称",
    zhcht: "確診診斷名稱",
  },
  age_ymd: {
    en: "Age on Registration (YMD)",
    ja: "登録時年齢 (YMD)",
    ko: "등록시 연령 (YMD)",
    zh: "登记时年龄 (YMD)",
    zhcht: "登記時年齡 (YMD)",
  },
  age_on_examination_ymd: {
    en: "Age on Examination (YMD)",
    ja: "診察時年齢 (YMD)",
    ko: "진찰시 연령 (YMD)",
    zh: "诊察时年龄 (YMD)",
    zhcht: "診察時年齡 (YMD)",
  },
  sex: {
    en: "Sex",
    ja: "性別",
    ko: "성별",
    zh: "性别",
    zhcht: "性别",
  },
  relationship: {
    en: "Relationship",
    ja: "続柄",
    ko: "관계",
    zh: "关系",
    zhcht: "關係",
  },
  life_status: {
    en: "Life Status",
    ja: "状態",
    ko: "상태",
    zh: "生活状态",
    zhcht: "生活狀態",
  },
  message_for_pedigree_error: {
    en: "Failed to visualize pedigree. Please check FAQ.",
    ja: "家系図の表示に失敗しました。FAQを確認してください。",
    ko: "가계도 시각화에 실패했습니다. FAQ를 확인하십시오.",
  },
  message_for_warning_spouse_with_no_child: {
    en: "{spouse_name} a spouse that that has no child. It is not included in the pedigree。",
    ja: "{spouse_name} は子どものいない配偶者です。家系図上では描画されません。",
    ko: "{spouse_name}은 자녀가 없는 배우자입니다. 가계도에는 그려지지 않습니다.",
  },
  message_for_error_no_proband_in_family: {
    en: "No proband in the family. {target} cannot be generated.",
    ja: "家系に発端者（本人）がいないため、{target}を生成できません。",
    ko: "가족에 대상자가 없습니다. {target}를 생성할 수 없습니다.",
  },
  message_for_error_multiple_proband_in_family: {
    en: "There are multiple probands in the family. {target} cannot be generated.",
    ja: "家系に複数の発端者（本人）がいるため、{target}を生成できません。",
    ko: "가족에 여러 대상자가 있습니다. {target}를 생성할 수 없습니다.",
  },
  message_for_error_same_gender_parent: {
    en: "The same gender parent is included in the family. {target} cannot be generated.",
    ja: "家系に同性の親がいるため、{target}を生成できません。",
    ko: "가족에 동성의 부모가 있기 때문에 {target}를 생성할 수 없습니다.",
  },
  "chart-phenotype-x": {
    en: "Age",
    ja: "年齢",
    ko: "시대",
  },
  "chart-phenotype-y": {
    en: "Phenotype",
    ja: "症状",
    ko: "시대",
  },
  Custom: {
    en: "Custom",
    ja: "カスタム",
    ko: "커스텀",
  },
  Unknown: {
    en: "Unknown",
    ja: "不明",
    ko: "알 수 없음",
  },
  mild: {
    en: "mild",
    ja: "軽度",
    ko: "경증",
  },
  moderate: {
    en: "moderate",
    ja: "中等度",
    ko: "보통 높음",
  },
  borderline: {
    en: "borderline",
    ja: "境界域",
    ko: "경계영역",
  },
  severe: {
    en: "severe",
    ja: "重度",
    ko: "중증",
  },
  profound: {
    en: "profound",
    ja: "最重度",
    ko: "최중증도",
  },
  unknown: {
    en: "Unknown",
    ja: "不明",
    ko: "알 수 없음",
  },
  "navigation-top": {
    en: "Top",
    ja: "トップ",
  },
  "pedigree-auto-generation": {
    en: "Auto generated pedigree",
    ja: "家系図自動生成",
    ko: "가계도 자동 생성",
  },
  "clinical-symptom": {
    en: "Clinical Symptom",
    ja: "臨床症状",
    ko: "임상 증상",
  },
  "not-applicable": {
    en: "Not applicable",
    ja: "該当なし",
    ko: "해당 없음",
  },
  "medical-clinical-diagnosis": {
    en: "Clinical Diagnosis",
    ja: "臨床診断",
    ko: "임상 진단",
  },
  "medical-clinical-diagnosis-name": {
    en: "Clinical Diagnosis Name",
    ja: "臨床診断_疾患名",
    ko: "임상 진단명",
  },
  "medical-suspected-disease-name": {
    en: "Suspected Disease",
    ja: "疑い病名",
    ko: "의심 병명",
  },
  "medical-disease-name-of-previous-history-name": {
    en: "Disease Name of Previous History",
    ja: "既往歴疾患名",
    ko: "병력 질환명",
  },
  "medical-complication-history-name": {
    en: "Disease Name of Complications",
    ja: "合併症疾患名",
    ko: "합병증 질환명",
  },
  "medical-interactable-disease": {
    en: "Designated intractable disease applied for",
    ja: "申請した指定難病",
    ko: "신청한 난치병 병명",
  },
  "medical-pediatric-disease": {
    en: "Designated Pediatric Chronic Specific Disease",
    ja: "申請した小児慢性特定疾病",
    ko: "신청한 소아 만성 특정질환",
  },
  "matching-rule-required-description": {
    en: "Must match. If any rule is Required, all Required criteria must be met — Optional rules are disregarded.",
    ja: "必須条件です。Required が一つでも設定されている場合、全ての Required 項目が一致したときのみマッチします（Optional は無視されます）。",
    ko: "Must match. If any rule is Required, all Required criteria must be met — Optional rules are disregarded.",
  },
  "matching-rule-optional-description": {
    en: "OR condition: a match occurs if any one of the Optional criteria is met. Only meaningful when two or more rules are set to Optional and none are Required — has no effect otherwise.",
    ja: "OR条件：Optional に設定した項目のうち、いずれか一つが一致すればマッチします。ただし、Required が一つでもある場合は無視され、Optional が一つだけの場合は Required と同じ動作になります。",
    ko: "OR condition: a match occurs if any one of the Optional criteria is met. Only meaningful when two or more rules are set to Optional and none are Required — has no effect otherwise.",
  },
  "matching-rule-ignored-description": {
    en: "Excluded from matching entirely.",
    ja: "マッチング判定の対象外です。",
    ko: "Excluded from matching entirely.",
  },
  "case-info-updated-alert": {
    en: "The case information has been updated. Switching to Edit mode.",
    ja: "症例情報が変更されました。Editモードに移行します。",
    ko: "The case information has been updated. Switching to Edit mode.",
  },
  "submission-success-message": {
    en: "Submission completed successfully",
    ja: "送信が完了しました",
    ko: "Submission completed successfully",
  },
  "submission-deleted-message": {
    en: "Submission deleted successfully",
    ja: "Submissionが正常に削除されました",
    ko: "Submission deleted successfully",
  },
  "fetch-submission-error": {
    en: "Failed to fetch submission data",
    ja: "Submissionデータの取得に失敗しました",
    ko: "Failed to fetch submission data",
  },
  "delete-submission-modal-title": {
    en: "Delete Submission & Overwrite JSON",
    ja: "Submissionの削除 & JSONの上書き保存",
    ko: "Delete Submission & Overwrite JSON",
  },
  "delete-submission-modal-message": {
    en: "Are you sure you want to delete this submission? Deleting it will save a new JSON file with the linked IDs cleared.",
    ja: "サブミッション情報を削除しますか？削除すると、サブミッションに紐づくIDがクリアされた新しいJSONファイルが保存されます。",
    ko: "Are you sure you want to delete this submission? Deleting it will save a new JSON file with the linked IDs cleared."
  },
  "delete-submission-modal-cancel": {
    en: "Cancel",
    ja: "キャンセル",
    ko: "Cancel",
  },
  "delete-submission-modal-confirm": {
    en: "Delete & Download JSON",
    ja: "削除 & JSONのダウンロード",
    ko: "Delete & Download JSON",
  },
  "alert-row-cannot-delete-with-submission": {
    en: "This row is linked to a submission and cannot be deleted. To delete it, please remove the submission from the sharing tab first, then delete the row.",
    ja: "この症例はサブミッションと紐づいているため削除できません。削除するには、共有タブからサブミッションを削除してから症例を削除してください。",
    ko: "이 증례는 서브미션과 연결되어 있어 삭제할 수 없습니다. 삭제하려면 공유 탭에서 서브미션을 먼저 삭제한 후 증례를 삭제해 주세요.",
  },
};

const choicesForPresence = {
  dataValue: ["unknown", "absent", "present"],
  en: ["Unknown", "Absent", "Present"],
  ja: ["不明", "なし", "あり"],
  ko: ["알 수 없음", "없음", "있음"],
};
