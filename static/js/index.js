
let infoTranslations = {
    en: [
        { 'What is DiseaseSearch?': 'DiseaseSearch is a web-based clinical decision support system that provides ranked lists of genetic and rare diseases using Human Phenotype Ontology (HPO)-based phenotypic similarities.' },
        { 'Narrow search results': 'The filter function enables you to filter ranked lists in DiseaseSearch to specify a National Center for Biotechnology Information (NCBI) Gene ID as a causative gene, an Human Phenotype Ontology (HPO) term as a mode of inheritance, and/or a Monarch Disease Ontology (Mondo) term as a disease name. ' },
        { 'Share search results': 'You can download the result in tsv or json format and get a link to share the result.' },
        { 'Disclaimer': 'Please refer to <a href="/termsofservice?lang=en" target="_blank">this link</a>.' }
    ],
    ja: [
        { 'DiseaseSearchとは？': 'DiseaseSearchは兆候および症状を入力とし、それらと関連性が高い順に希少疾患、遺伝性疾患、疾患原因遺伝子、類似症例をランキング提示する希少・遺伝性疾患検索システムです。' },
        { '検索結果を絞り込む': 'Filterボックスに疾患原因遺伝子、遺伝形式、疾患名を入力することができ、それらと関連する結果のみにフィルタリングすることが出来ます。' },
        { '検索結果を共有する': '検索結果をTSVもしくはJSON形式でダウンロード出来ます。また、結果を共有するためのリンクを得ることも出来ます。' },
        { '免責事項': '<a href="/termsofservice" target="_blank">リンク先</a>を参照してください。' }
    ],
    ko: [
        { 'DiseaseSearch이란?': 'DiseaseSearch는 징후와 증상을 입력하면, 이와 연관성이 높은 순서대로 희귀질환, 유전질환, 질환 원인 유전자, 유사사례를 랭킹으로 제시하는 희귀-유전질환 검색 시스템이다.' },
        { '검색 결과 좁히기': 'Filter 상자에 질병 원인 유전자, 유전형, 질병명을 입력할 수 있으며, 이와 관련된 결과만 필터링할 수 있습니다.' },
        { '검색 결과 공유': '검색 결과를 TSV 또는 JSON 형식으로 다운로드할 수 있습니다. 또한 결과 공유를 위한 링크를 얻을 수 있습니다.' },
        { '면책 사항': '<a href="/termsofservice?lang=ko" target="_blank">링크</a>를 참조해 주시기 바랍니다.' }
    ],
    zh: [
        { '什么是 DiseaseSearch？': 'DiseaseSearch 是一个罕见病和遗传病搜索系统，它将体征和症状作为输入，并根据相关性对罕见病、遗传病、致病基因和类似病例进行排序。' },
        { '细化搜索结果': '您可以在 "筛选器 "框中输入致病基因、遗传形式或疾病名称，然后只筛选与之相关的结果。' },
        { '分享搜索结果': '您可以下载 TSV 或 JSON 格式的搜索结果。 您还可以通过链接共享搜索结果。' },
        { '免责声明': '<a href="/termsofservice?lang=en" target="_blank">请参考这</a>个链接。' }
    ],
    zhcht: [
        { '什麼是 DiseaseSearch？': 'DiseaseSearch 是一種罕見疾病和遺傳疾病搜尋系統，以體徵和症狀作為輸入，並按相關性順序對罕見疾病、遺傳疾病、致病基因和類似病例進行排名。' },
        { '細化搜尋結果': '您可以在「過濾」方塊中輸入致病基因、遺傳模式和疾病名稱，並僅過濾與它們相關的結果。' },
        { '分享搜尋結果': '您可以下載 TSV 或 JSON 格式的搜尋結果。 您還可以獲得分享結果的連結。' },
        { '免責聲明': '請參考<a href="/termsofservice?lang=en" target="_blank">此鏈接</a>。' }
    ]
}

let modalContent = document.getElementById('modal-info-content')
modalContent.innerHTML = `
<img src="/static/images/pcf/top/logo_DiseaseSearch.svg" class="info-disease-img">    
<ul>
        <li>
            <i>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <clipPath id="clip-Info-case-01">
                <rect width="400" height="400"/>
                </clipPath>
            </defs>
            <g id="Info-case-01" clip-path="url(#clip-Info-case-01)">
                <path id="パス_124801" data-name="パス 124801" d="M33-16H295a49.056,49.056,0,0,1,49,49V178a49.056,49.056,0,0,1-49,49H33a49.056,49.056,0,0,1-49-49V33A49.056,49.056,0,0,1,33-16ZM295,195a17.019,17.019,0,0,0,17-17V33a17.019,17.019,0,0,0-17-17H33A17.019,17.019,0,0,0,16,33V178a17.019,17.019,0,0,0,17,17Z" transform="translate(36 45)"/>
                <path id="パス_124802" data-name="パス 124802" d="M26-16H302a42,42,0,0,1,0,84H26a42,42,0,0,1,0-84ZM302,36a10,10,0,0,0,0-20H26a10,10,0,0,0,0,20Z" transform="translate(36 303)"/>
                <circle id="楕円形_478" data-name="楕円形 478" cx="21.5" cy="21.5" r="21.5" transform="translate(88 96)" fill="#11101d"/>
                <circle id="楕円形_479" data-name="楕円形 479" cx="21.5" cy="21.5" r="21.5" transform="translate(88 157)" fill="#11101d"/>
                <path id="線_970" data-name="線 970" d="M128,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H128A16,16,0,0,1,144,0,16,16,0,0,1,128,16Z" transform="translate(174.5 117.5)"/>
                <path id="線_971" data-name="線 971" d="M128,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H128A16,16,0,0,1,144,0,16,16,0,0,1,128,16Z" transform="translate(174.5 178.5)"/>
            </g>
            </svg>
            </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][0])}</h4>
                <p>${Object.values(infoTranslations[lang][0])}
                </p>
            </span>
        </li>
        <li>
        <i>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
        <defs>
            <clipPath id="clip-Info-case-02">
            <rect width="400" height="400"/>
            </clipPath>
        </defs>
        <g id="Info-case-02" clip-path="url(#clip-Info-case-02)">
            <g id="グループ_56859" data-name="グループ 56859" transform="translate(119.571 119.777)">
            <path id="長方形_8102" data-name="長方形 8102" d="M-1.373-7.5h244.74A6.458,6.458,0,0,1,249.5-1.373v244.74a6.458,6.458,0,0,1-6.127,6.127H-1.373A6.458,6.458,0,0,1-7.5,243.367V-1.373A6.458,6.458,0,0,1-1.373-7.5ZM238.1,3.9H3.9V238.1H238.1Z" transform="translate(7.5 7.5)" fill="#1a1311"/>
            <path id="長方形_8102_-_アウトライン" data-name="長方形 8102 - アウトライン" d="M-1.373-15H243.368A13.984,13.984,0,0,1,257-1.373v244.74a13.984,13.984,0,0,1-13.627,13.627H-1.373A13.984,13.984,0,0,1-15,243.367V-1.373A13.984,13.984,0,0,1-1.373-15ZM230.6,11.4H11.4V230.6H230.6Z" transform="translate(7.5 7.5)" fill="#1a1311"/>
            <path id="楕円形_427" data-name="楕円形 427" d="M41.789-7.5A49.289,49.289,0,1,1-7.5,41.789,49.345,49.345,0,0,1,41.789-7.5Zm0,88.613A39.324,39.324,0,1,0,2.465,41.789,39.368,39.368,0,0,0,41.789,81.113Z" transform="translate(81.615 48.258)" fill="#1a1311"/>
            <path id="楕円形_427_-_アウトライン" data-name="楕円形 427 - アウトライン" d="M41.789-15A56.789,56.789,0,1,1-15,41.789,56.853,56.853,0,0,1,41.789-15Zm0,88.613A31.824,31.824,0,1,0,9.965,41.789,31.86,31.86,0,0,0,41.789,73.613Z" transform="translate(81.615 48.258)" fill="#1a1311"/>
            <path id="パス_104805" data-name="パス 104805" d="M4.089,91.084A5.7,5.7,0,0,1-1.585,84.8c.084-.814,9.3-81.436,83.471-82.639,67.63-1.088,84.865,78.341,85.031,79.143a5.7,5.7,0,0,1-11.158,2.317c-.607-2.9-15.529-71-73.689-70.066-64,1.038-72.01,69.513-72.32,72.427A5.7,5.7,0,0,1,4.089,91.084Z" transform="translate(45.803 163.786)" fill="#1a1311"/>
            <path id="パス_104805_-_アウトライン" data-name="パス 104805 - アウトライン" d="M4.089,98.584H3.7L2.7,98.511A13.214,13.214,0,0,1-9.045,84.028c.091-.88,10.061-88.055,90.809-89.364l1.495-.012c72.53,0,90.826,84.282,91,85.133a13.2,13.2,0,0,1-25.843,5.374c-.548-2.618-14-64.111-65.164-64.111l-1.064.009c-57.435.931-64.7,63.076-64.983,65.721A13.171,13.171,0,0,1,4.089,98.584Z" transform="translate(45.803 163.786)" fill="#1a1311"/>
            </g>
            <g id="グループ_56860" data-name="グループ 56860" transform="translate(22.572 19.714)">
            <path id="前面オブジェクトで型抜き_3" data-name="前面オブジェクトで型抜き 3" d="M98.67,256.993H6.133A6.454,6.454,0,0,1,0,250.868V6.13A6.457,6.457,0,0,1,6.133,0H250.869A6.459,6.459,0,0,1,257,6.13V100.5H245.6V11.4H11.4V245.6H98.67v11.394Z" transform="translate(0 0)" fill="#1a1311"/>
            <path id="前面オブジェクトで型抜き_3_-_アウトライン" data-name="前面オブジェクトで型抜き 3 - アウトライン" d="M98.67,264.493H6.133A13.985,13.985,0,0,1-7.5,250.868V6.13A13.987,13.987,0,0,1,6.133-7.5H250.869A13.987,13.987,0,0,1,264.5,6.13V108H238.1V18.9H18.9V238.1H106.17v26.394Z" transform="translate(0 0)" fill="#1a1311"/>
            </g>
        </g>
        </svg>
        </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][1])}</h4>
                <p>${Object.values(infoTranslations[lang][1])}
                </p>
            </span>
        </li>
        <li>
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <clipPath id="clip-path">
                <rect id="長方形_8895" data-name="長方形 8895" width="379.264" height="336.2" fill="none" stroke="#707070" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                </clipPath>
                <clipPath id="clip-Info-case-03">
                <rect width="400" height="400"/>
                </clipPath>
            </defs>
            <g id="Info-case-03" clip-path="url(#clip-Info-case-03)">
                <g id="グループ_56862" data-name="グループ 56862" transform="translate(10.367 31.9)">
                <g id="グループ_56861" data-name="グループ 56861" transform="translate(0 0)" clip-path="url(#clip-path)">
                    <path id="パス_124800" data-name="パス 124800" d="M179.281,321.138A51.336,51.336,0,0,1,142.733,306L55.943,219.2a51.961,51.961,0,0,1-.713-72.388l46.186-48.033a44.863,44.863,0,0,1,62.9-1.542l22.317,21.04a12.461,12.461,0,0,0,17.356-17.88L130.355,26.769a19.7,19.7,0,0,0-27.858,0L26.769,102.5a19.721,19.721,0,0,0,0,27.858A16,16,0,1,1,4.142,152.983a51.757,51.757,0,0,1,0-73.113L79.87,4.142a51.7,51.7,0,0,1,73.114,0L179.7,30.86l19.8-18.147a44.852,44.852,0,0,1,60.933.478l87.594,82.859a51.7,51.7,0,0,1,1.383,73.756L216.2,305.638a51.315,51.315,0,0,1-36.643,15.5ZM133.649,117.083a12.683,12.683,0,0,0-9.168,3.883L78.3,169a19.8,19.8,0,0,0,.273,27.579l86.79,86.793a19.7,19.7,0,0,0,27.987-.135L326.569,147.4a19.7,19.7,0,0,0-.527-28.1l-87.6-82.862a12.745,12.745,0,0,0-17.316-.135L202.35,53.509l24.265,24.265a44.461,44.461,0,0,1-61.936,63.79l-22.313-21.037A12.671,12.671,0,0,0,133.649,117.083Z" transform="translate(13.029 13.03)"/>
                    <path id="線_972" data-name="線 972" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(95.96 172.732)"/>
                    <path id="線_973" data-name="線 973" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(128.415 205.186)"/>
                    <path id="線_974" data-name="線 974" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(163.476 239.247)"/>
                </g>
                </g>
            </g>
            </svg>
            </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][2])}</h4>
                <p>${Object.values(infoTranslations[lang][2])}
                </p>
            </span>
        </li>
        <li>
        <i>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
        <defs>
            <clipPath id="clip-path">
            <rect id="長方形_8897" data-name="長方形 8897" width="309" height="377" transform="translate(-0.285 0.346)" fill="none" stroke="#707070" stroke-width="32"/>
            </clipPath>
            <clipPath id="clip-Info-case-04">
            <rect width="400" height="400"/>
            </clipPath>
        </defs>
        <g id="Info-case-04" clip-path="url(#clip-Info-case-04)">
            <g id="グループ_56864" data-name="グループ 56864" transform="translate(46.777 11.79)">
            <g id="グループ_56863" data-name="グループ 56863" transform="translate(-0.492 -0.136)" clip-path="url(#clip-path)">
                <path id="長方形_8896" data-name="長方形 8896" d="M0-16H269A16,16,0,0,1,285,0V261a16,16,0,0,1-16,16H0a16,16,0,0,1-16-16V0A16,16,0,0,1,0-16ZM253,16H16V245H253Z" transform="translate(19.715 19.346)"/>
                <path id="パス_124801" data-name="パス 124801" d="M273.458,168.7H34.709A45.761,45.761,0,0,1-11,123V71a16,16,0,0,1,32,0v52A13.725,13.725,0,0,0,34.709,136.7H257.458V71a16,16,0,0,1,32,0v81.7A16,16,0,0,1,273.458,168.7Z" transform="translate(14.986 205.386)"/>
                <path id="線_975" data-name="線 975" d="M121,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H121A16,16,0,0,1,137,0,16,16,0,0,1,121,16Z" transform="translate(93.715 97.346)"/>
                <path id="線_976" data-name="線 976" d="M121,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H121A16,16,0,0,1,137,0,16,16,0,0,1,121,16Z" transform="translate(93.715 163.346)"/>
            </g>
            </g>
        </g>
        </svg>
        </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][3])}</h4>
                <p>${Object.values(infoTranslations[lang][3])}
                </p>
            </span>
        </li>
    </ul>
`
