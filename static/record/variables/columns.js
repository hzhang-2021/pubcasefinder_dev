const country_codes = {
  ABW: {
    ja: "アルバ",
    en: "Aruba",
    ko: "아루바"
  },
  AFG: {
    ja: "アフガニスタン",
    en: "Afghanistan",
    ko: "아프가니스탄"
  },
  AGO: {
    ja: "アンゴラ",
    en: "Angola",
    ko: "앙골라"
  },
  AIA: {
    ja: "アンギラ",
    en: "Anguilla",
    ko: "앵귈라"
  },
  ALA: {
    ja: "オーランド諸島",
    en: "Åland Islands",
    ko: "올란드제도"
  },
  ALB: {
    ja: "アルバニア",
    en: "Albania",
    ko: "알바니아"
  },
  AND: {
    ja: "アンドラ",
    en: "Andorra",
    ko: "안도라"
  },
  ARE: {
    ja: "アラブ首長国連邦",
    en: "United Arab Emirates",
    ko: "아랍에미리트"
  },
  ARG: {
    ja: "アルゼンチン",
    en: "Argentina",
    ko: "아르헨티나"
  },
  ARM: {
    ja: "アルメニア",
    en: "Armenia",
    ko: "아르메니아"
  },
  ASM: {
    ja: "アメリカ領サモア",
    en: "American Samoa",
    ko: "아메리칸사모아"
  },
  ATA: {
    ja: "南極",
    en: "Antarctica",
    ko: "남극"
  },
  ATF: {
    ja: "フランス領南方・南極地域",
    en: "French Southern Territories",
    ko: "프랑스령남방및남극지역"
  },
  ATG: {
    ja: "アンティグア・バーブーダ",
    en: "Antigua and Barbuda",
    ko: "앤티가바부다"
  },
  AUS: {
    ja: "オーストラリア",
    en: "Australia",
    ko: "오스트레일리아"
  },
  AUT: {
    ja: "オーストリア",
    en: "Austria",
    ko: "오스트리아"
  },
  AZE: {
    ja: "アゼルバイジャン",
    en: "Azerbaijan",
    ko: "아제르바이잔"
  },
  BDI: {
    ja: "ブルンジ",
    en: "Burundi",
    ko: "부룬디"
  },
  BEL: {
    ja: "ベルギー",
    en: "Belgium",
    ko: "벨기에"
  },
  BEN: {
    ja: "ベナン",
    en: "Benin",
    ko: "베냉"
  },
  BES: {
    ja: "ボネール、シント・ユースタティウスおよびサバ",
    en: "Bonaire, Sint Eustatius and Saba",
    ko: "보네르섬"
  },
  BFA: {
    ja: "ブルキナファソ",
    en: "Burkina Faso",
    ko: "부르키나파소"
  },
  BGD: {
    ja: "バングラデシュ",
    en: "Bangladesh",
    ko: "방글라데시"
  },
  BGR: {
    ja: "ブルガリア",
    en: "Bulgaria",
    ko: "불가리아"
  },
  BHR: {
    ja: "バーレーン",
    en: "Bahrain",
    ko: "바레인"
  },
  BHS: {
    ja: "バハマ",
    en: "Bahamas",
    ko: "바하마"
  },
  BIH: {
    ja: "ボスニア・ヘルツェゴビナ",
    en: "Bosnia and Herzegovina",
    ko: "보스니아헤르체고비나"
  },
  BLM: {
    ja: "サン・バルテルミー",
    en: "Saint Barthélemy",
    ko: "생바르텔레미"
  },
  BLR: {
    ja: "ベラルーシ",
    en: "Belarus",
    ko: "벨라루스"
  },
  BLZ: {
    ja: "ベリーズ",
    en: "Belize",
    ko: "벨리즈"
  },
  BMU: {
    ja: "バミューダ",
    en: "Bermuda",
    ko: "버뮤다"
  },
  BOL: {
    ja: "ボリビア多民族国",
    en: "Bolivia, Plurinational State of",
    ko: "볼리비아"
  },
  BRA: {
    ja: "ブラジル",
    en: "Brazil",
    ko: "브라질"
  },
  BRB: {
    ja: "バルバドス",
    en: "Barbados",
    ko: "바베이도스"
  },
  BRN: {
    ja: "ブルネイ・ダルサラーム",
    en: "Brunei Darussalam",
    ko: "브루나이"
  },
  BTN: {
    ja: "ブータン",
    en: "Bhutan",
    ko: "부탄"
  },
  BVT: {
    ja: "ブーベ島",
    en: "Bouvet Island",
    ko: "부베섬"
  },
  BWA: {
    ja: "ボツワナ",
    en: "Botswana",
    ko: "보츠와나"
  },
  CAF: {
    ja: "中央アフリカ共和国",
    en: "Central African Republic",
    ko: "중앙아프리카공화국"
  },
  CAN: {
    ja: "カナダ",
    en: "Canada",
    ko: "캐나다"
  },
  CCK: {
    ja: "ココス(キーリング)諸島",
    en: "Cocos (Keeling) Islands",
    ko: "코코스제도"
  },
  CHE: {
    ja: "スイス",
    en: "Switzerland",
    ko: "스위스"
  },
  CHL: {
    ja: "チリ",
    en: "Chile",
    ko: "칠레"
  },
  CHN: {
    ja: "中華人民共和国",
    en: "China",
    ko: "중국"
  },
  CIV: {
    ja: "コートジボワール",
    en: "Côte d'Ivoire",
    ko: "코트디부아르"
  },
  CMR: {
    ja: "カメルーン",
    en: "Cameroon",
    ko: "카메룬"
  },
  COD: {
    ja: "コンゴ民主共和国",
    en: "Congo, Democratic Republic of the",
    ko: "콩고민주공화국"
  },
  COG: {
    ja: "コンゴ共和国",
    en: "Congo",
    ko: "콩고공화국"
  },
  COK: {
    ja: "クック諸島",
    en: "Cook Islands",
    ko: "쿡제도"
  },
  COL: {
    ja: "コロンビア",
    en: "Colombia",
    ko: "콜롬비아"
  },
  COM: {
    ja: "コモロ",
    en: "Comoros",
    ko: "코모로"
  },
  CPV: {
    ja: "カーボベルデ",
    en: "Cabo Verde",
    ko: "카보베르데"
  },
  CRI: {
    ja: "コスタリカ",
    en: "Costa Rica",
    ko: "코스타리카"
  },
  CUB: {
    ja: "キューバ",
    en: "Cuba",
    ko: "쿠바"
  },
  CUW: {
    ja: "キュラソー",
    en: "Curaçao",
    ko: "퀴라소"
  },
  CXR: {
    ja: "クリスマス島",
    en: "Christmas Island",
    ko: "크리스마스섬"
  },
  CYM: {
    ja: "ケイマン諸島",
    en: "Cayman Islands",
    ko: "케이맨제도"
  },
  CYP: {
    ja: "キプロス",
    en: "Cyprus",
    ko: "키프로스"
  },
  CZE: {
    ja: "チェコ",
    en: "Czechia",
    ko: "체코"
  },
  DEU: {
    ja: "ドイツ",
    en: "Germany",
    ko: "독일"
  },
  DJI: {
    ja: "ジブチ",
    en: "Djibouti",
    ko: "지부티"
  },
  DMA: {
    ja: "ドミニカ国",
    en: "Dominica",
    ko: "도미니카연방"
  },
  DNK: {
    ja: "デンマーク",
    en: "Denmark",
    ko: "덴마크"
  },
  DOM: {
    ja: "ドミニカ共和国",
    en: "Dominican Republic",
    ko: "도미니카공화국"
  },
  DZA: {
    ja: "アルジェリア",
    en: "Algeria",
    ko: "알제리"
  },
  ECU: {
    ja: "エクアドル",
    en: "Ecuador",
    ko: "에콰도르"
  },
  EGY: {
    ja: "エジプト",
    en: "Egypt",
    ko: "이집트"
  },
  ERI: {
    ja: "エリトリア",
    en: "Eritrea",
    ko: "에리트레아"
  },
  ESH: {
    ja: "西サハラ",
    en: "Western Sahara",
    ko: "서사하라"
  },
  ESP: {
    ja: "スペイン",
    en: "Spain",
    ko: "스페인"
  },
  EST: {
    ja: "エストニア",
    en: "Estonia",
    ko: "에스토니아"
  },
  ETH: {
    ja: "エチオピア",
    en: "Ethiopia",
    ko: "에티오피아"
  },
  FIN: {
    ja: "フィンランド",
    en: "Finland",
    ko: "핀란드"
  },
  FJI: {
    ja: "フィジー",
    en: "Fiji",
    ko: "피지"
  },
  FLK: {
    ja: "フォークランド(マルビナス)諸島",
    en: "Falkland Islands (Malvinas)",
    ko: "포클랜드제도"
  },
  FRA: {
    ja: "フランス",
    en: "France",
    ko: "프랑스"
  },
  FRO: {
    ja: "フェロー諸島",
    en: "Faroe Islands",
    ko: "페로제도"
  },
  FSM: {
    ja: "ミクロネシア連邦",
    en: "Micronesia, Federated States of",
    ko: "미크로네시아연방"
  },
  GAB: {
    ja: "ガボン",
    en: "Gabon",
    ko: "가봉"
  },
  GBR: {
    ja: "イギリス",
    en: "United Kingdom of Great Britain and Northern Ireland",
    ko: "영국"
  },
  GEO: {
    ja: "ジョージア",
    en: "Georgia",
    ko: "조지아"
  },
  GGY: {
    ja: "ガーンジー",
    en: "Guernsey",
    ko: "건지섬"
  },
  GHA: {
    ja: "ガーナ",
    en: "Ghana",
    ko: "가나"
  },
  GIB: {
    ja: "ジブラルタル",
    en: "Gibraltar",
    ko: "지브롤터"
  },
  GIN: {
    ja: "ギニア",
    en: "Guinea",
    ko: "기니"
  },
  GLP: {
    ja: "グアドループ",
    en: "Guadeloupe",
    ko: "과들루프"
  },
  GMB: {
    ja: "ガンビア",
    en: "Gambia",
    ko: "감비아"
  },
  GNB: {
    ja: "ギニアビサウ",
    en: "Guinea-Bissau",
    ko: "기니비사우"
  },
  GNQ: {
    ja: "赤道ギニア",
    en: "Equatorial Guinea",
    ko: "적도기니"
  },
  GRC: {
    ja: "ギリシャ",
    en: "Greece",
    ko: "그리스"
  },
  GRD: {
    ja: "グレナダ",
    en: "Grenada",
    ko: "그레나다"
  },
  GRL: {
    ja: "グリーンランド",
    en: "Greenland",
    ko: "그린란드"
  },
  GTM: {
    ja: "グアテマラ",
    en: "Guatemala",
    ko: "과테말라"
  },
  GUF: {
    ja: "フランス領ギアナ",
    en: "French Guiana",
    ko: "프랑스령기아나"
  },
  GUM: {
    ja: "グアム",
    en: "Guam",
    ko: "괌"
  },
  GUY: {
    ja: "ガイアナ",
    en: "Guyana",
    ko: "가이아나"
  },
  HKG: {
    ja: "香港",
    en: "Hong Kong",
    ko: "홍콩"
  },
  HMD: {
    ja: "ハード島とマクドナルド諸島",
    en: "Heard Island and McDonald Islands",
    ko: "허드맥도널드제도"
  },
  HND: {
    ja: "ホンジュラス",
    en: "Honduras",
    ko: "온두라스"
  },
  HRV: {
    ja: "クロアチア",
    en: "Croatia",
    ko: "크로아티아"
  },
  HTI: {
    ja: "ハイチ",
    en: "Haiti",
    ko: "아이티"
  },
  HUN: {
    ja: "ハンガリー",
    en: "Hungary",
    ko: "헝가리"
  },
  IDN: {
    ja: "インドネシア",
    en: "Indonesia",
    ko: "인도네시아"
  },
  IMN: {
    ja: "マン島",
    en: "Isle of Man",
    ko: "맨섬"
  },
  IND: {
    ja: "インド",
    en: "India",
    ko: "인도"
  },
  IOT: {
    ja: "イギリス領インド洋地域",
    en: "British Indian Ocean Territory",
    ko: "영국령인도양지역"
  },
  IRL: {
    ja: "アイルランド",
    en: "Ireland",
    ko: "아일랜드"
  },
  IRN: {
    ja: "イラン・イスラム共和国",
    en: "Iran, Islamic Republic of",
    ko: "이란"
  },
  IRQ: {
    ja: "イラク",
    en: "Iraq",
    ko: "이라크"
  },
  ISL: {
    ja: "アイスランド",
    en: "Iceland",
    ko: "아이슬란드"
  },
  ISR: {
    ja: "イスラエル",
    en: "Israel",
    ko: "이스라엘"
  },
  ITA: {
    ja: "イタリア",
    en: "Italy",
    ko: "이탈리아"
  },
  JAM: {
    ja: "ジャマイカ",
    en: "Jamaica",
    ko: "자메이카"
  },
  JEY: {
    ja: "ジャージー",
    en: "Jersey",
    ko: "저지섬"
  },
  JOR: {
    ja: "ヨルダン",
    en: "Jordan",
    ko: "요르단"
  },
  JPN: {
    ja: "日本",
    en: "Japan",
    ko: "일본"
  },
  KAZ: {
    ja: "カザフスタン",
    en: "Kazakhstan",
    ko: "카자흐스탄"
  },
  KEN: {
    ja: "ケニア",
    en: "Kenya",
    ko: "케냐"
  },
  KGZ: {
    ja: "キルギス",
    en: "Kyrgyzstan",
    ko: "키르기스스탄"
  },
  KHM: {
    ja: "カンボジア",
    en: "Cambodia",
    ko: "캄보디아"
  },
  KIR: {
    ja: "キリバス",
    en: "Kiribati",
    ko: "키리바시"
  },
  KNA: {
    ja: "セントクリストファー・ネイビス",
    en: "Saint Kitts and Nevis",
    ko: "세인트키츠네비스"
  },
  KOR: {
    ja: "大韓民国",
    en: "Korea, Republic of",
    ko: "대한민국"
  },
  KWT: {
    ja: "クウェート",
    en: "Kuwait",
    ko: "쿠웨이트"
  },
  LAO: {
    ja: "ラオス人民民主共和国",
    en: "Lao People's Democratic Republic",
    ko: "라오스"
  },
  LBN: {
    ja: "レバノン",
    en: "Lebanon",
    ko: "레바논"
  },
  LBR: {
    ja: "リベリア",
    en: "Liberia",
    ko: "라이베리아"
  },
  LBY: {
    ja: "リビア",
    en: "Libya",
    ko: "리비아"
  },
  LCA: {
    ja: "セントルシア",
    en: "Saint Lucia",
    ko: "세인트루시아"
  },
  LIE: {
    ja: "リヒテンシュタイン",
    en: "Liechtenstein",
    ko: "리히텐슈타인"
  },
  LKA: {
    ja: "スリランカ",
    en: "Sri Lanka",
    ko: "스리랑카"
  },
  LSO: {
    ja: "レソト",
    en: "Lesotho",
    ko: "레소토"
  },
  LTU: {
    ja: "リトアニア",
    en: "Lithuania",
    ko: "리투아니아"
  },
  LUX: {
    ja: "ルクセンブルク",
    en: "Luxembourg",
    ko: "룩셈부르크"
  },
  LVA: {
    ja: "ラトビア",
    en: "Latvia",
    ko: "라트비아"
  },
  MAC: {
    ja: "マカオ",
    en: "Macao",
    ko: "마카오"
  },
  MAF: {
    ja: "サン・マルタン(フランス領)",
    en: "Saint Martin (French part)",
    ko: "생마르탱"
  },
  MAR: {
    ja: "モロッコ",
    en: "Morocco",
    ko: "모로코"
  },
  MCO: {
    ja: "モナコ",
    en: "Monaco",
    ko: "모나코"
  },
  MDA: {
    ja: "モルドバ共和国",
    en: "Moldova, Republic of",
    ko: "몰도바"
  },
  MDG: {
    ja: "マダガスカル",
    en: "Madagascar",
    ko: "마다가스카르"
  },
  MDV: {
    ja: "モルディブ",
    en: "Maldives",
    ko: "몰디브"
  },
  MEX: {
    ja: "メキシコ",
    en: "Mexico",
    ko: "멕시코"
  },
  MHL: {
    ja: "マーシャル諸島",
    en: "Marshall Islands",
    ko: "마셜제도"
  },
  MKD: {
    ja: "マケドニア旧ユーゴスラビア共和国",
    en: "North Macedonia",
    ko: "북마케도니아"
  },
  MLI: {
    ja: "マリ",
    en: "Mali",
    ko: "말리"
  },
  MLT: {
    ja: "マルタ",
    en: "Malta",
    ko: "몰타"
  },
  MMR: {
    ja: "ミャンマー",
    en: "Myanmar",
    ko: "미얀마"
  },
  MNE: {
    ja: "モンテネグロ",
    en: "Montenegro",
    ko: "몬테네그로"
  },
  MNG: {
    ja: "モンゴル",
    en: "Mongolia",
    ko: "몽골"
  },
  MNP: {
    ja: "北マリアナ諸島",
    en: "Northern Mariana Islands",
    ko: "북마리아나제도"
  },
  MOZ: {
    ja: "モザンビーク",
    en: "Mozambique",
    ko: "모잠비크"
  },
  MRT: {
    ja: "モーリタニア",
    en: "Mauritania",
    ko: "모리타니"
  },
  MSR: {
    ja: "モントセラト",
    en: "Montserrat",
    ko: "몬트세랫"
  },
  MTQ: {
    ja: "マルティニーク",
    en: "Martinique",
    ko: "마르티니크"
  },
  MUS: {
    ja: "モーリシャス",
    en: "Mauritius",
    ko: "모리셔스"
  },
  MWI: {
    ja: "マラウイ",
    en: "Malawi",
    ko: "말라위"
  },
  MYS: {
    ja: "マレーシア",
    en: "Malaysia",
    ko: "말레이시아"
  },
  MYT: {
    ja: "マヨット",
    en: "Mayotte",
    ko: "마요트"
  },
  NAM: {
    ja: "ナミビア",
    en: "Namibia",
    ko: "나미비아"
  },
  NCL: {
    ja: "ニューカレドニア",
    en: "New Caledonia",
    ko: "누벨칼레도니"
  },
  NER: {
    ja: "ニジェール",
    en: "Niger",
    ko: "니제르"
  },
  NFK: {
    ja: "ノーフォーク島",
    en: "Norfolk Island",
    ko: "노퍽섬"
  },
  NGA: {
    ja: "ナイジェリア",
    en: "Nigeria",
    ko: "나이지리아"
  },
  NIC: {
    ja: "ニカラグア",
    en: "Nicaragua",
    ko: "니카라과"
  },
  NIU: {
    ja: "ニウエ",
    en: "Niue",
    ko: "니우에"
  },
  NLD: {
    ja: "オランダ",
    en: "Netherlands, Kingdom of the",
    ko: "네덜란드"
  },
  NOR: {
    ja: "ノルウェー",
    en: "Norway",
    ko: "노르웨이"
  },
  NPL: {
    ja: "ネパール",
    en: "Nepal",
    ko: "네팔"
  },
  NRU: {
    ja: "ナウル",
    en: "Nauru",
    ko: "나우루"
  },
  NZL: {
    ja: "ニュージーランド",
    en: "New Zealand",
    ko: "뉴질랜드"
  },
  OMN: {
    ja: "オマーン",
    en: "Oman",
    ko: "오만"
  },
  PAK: {
    ja: "パキスタン",
    en: "Pakistan",
    ko: "파키스탄"
  },
  PAN: {
    ja: "パナマ",
    en: "Panama",
    ko: "파나마"
  },
  PCN: {
    ja: "ピトケアン",
    en: "Pitcairn",
    ko: "핏케언제도"
  },
  PER: {
    ja: "ペルー",
    en: "Peru",
    ko: "페루"
  },
  PHL: {
    ja: "フィリピン",
    en: "Philippines",
    ko: "필리핀"
  },
  PLW: {
    ja: "パラオ",
    en: "Palau",
    ko: "팔라우"
  },
  PNG: {
    ja: "パプアニューギニア",
    en: "Papua New Guinea",
    ko: "파푸아뉴기니"
  },
  POL: {
    ja: "ポーランド",
    en: "Poland",
    ko: "폴란드"
  },
  PRI: {
    ja: "プエルトリコ",
    en: "Puerto Rico",
    ko: "푸에르토리코"
  },
  PRK: {
    ja: "朝鮮民主主義人民共和国",
    en: "Korea, Democratic People's Republic of",
    ko: "조선민주주의인민공화국"
  },
  PRT: {
    ja: "ポルトガル",
    en: "Portugal",
    ko: "포르투갈"
  },
  PRY: {
    ja: "パラグアイ",
    en: "Paraguay",
    ko: "파라과이"
  },
  PSE: {
    ja: "パレスチナ",
    en: "Palestine, State of",
    ko: "팔레스타인"
  },
  PYF: {
    ja: "フランス領ポリネシア",
    en: "French Polynesia",
    ko: "프랑스령폴리네시아"
  },
  QAT: {
    ja: "カタール",
    en: "Qatar",
    ko: "카타르"
  },
  REU: {
    ja: "レユニオン",
    en: "Réunion",
    ko: "레위니옹"
  },
  ROU: {
    ja: "ルーマニア",
    en: "Romania",
    ko: "루마니아"
  },
  RUS: {
    ja: "ロシア連邦",
    en: "Russian Federation",
    ko: "러시아"
  },
  RWA: {
    ja: "ルワンダ",
    en: "Rwanda",
    ko: "르완다"
  },
  SAU: {
    ja: "サウジアラビア",
    en: "Saudi Arabia",
    ko: "사우디아라비아"
  },
  SDN: {
    ja: "スーダン",
    en: "Sudan",
    ko: "수단"
  },
  SEN: {
    ja: "セネガル",
    en: "Senegal",
    ko: "세네갈"
  },
  SGP: {
    ja: "シンガポール",
    en: "Singapore",
    ko: "싱가포르"
  },
  SGS: {
    ja: "サウスジョージア・サウスサンドウィッチ諸島",
    en: "South Georgia and the South Sandwich Islands",
    ko: "사우스조지아사우스샌드위치제도"
  },
  SHN: {
    ja: "セントヘレナ・アセンションおよびトリスタンダクーニャ",
    en: "Saint Helena, Ascension and Tristan da Cunha",
    ko: "세인트헬레나"
  },
  SJM: {
    ja: "スヴァールバル諸島およびヤンマイエン島",
    en: "Svalbard and Jan Mayen",
    ko: "스발바르얀마옌"
  },
  SLB: {
    ja: "ソロモン諸島",
    en: "Solomon Islands",
    ko: "솔로몬제도"
  },
  SLE: {
    ja: "シエラレオネ",
    en: "Sierra Leone",
    ko: "시에라리온"
  },
  SLV: {
    ja: "エルサルバドル",
    en: "El Salvador",
    ko: "엘살바도르"
  },
  SMR: {
    ja: "サンマリノ",
    en: "San Marino",
    ko: "산마리노"
  },
  SOM: {
    ja: "ソマリア",
    en: "Somalia",
    ko: "소말리아"
  },
  SPM: {
    ja: "サンピエール島・ミクロン島",
    en: "Saint Pierre and Miquelon",
    ko: "생피에르미클롱"
  },
  SRB: {
    ja: "セルビア",
    en: "Serbia",
    ko: "세르비아"
  },
  SSD: {
    ja: "南スーダン",
    en: "South Sudan",
    ko: "남수단"
  },
  STP: {
    ja: "サントメ・プリンシペ",
    en: "Sao Tome and Principe",
    ko: "상투메프린시페"
  },
  SUR: {
    ja: "スリナム",
    en: "Suriname",
    ko: "수리남"
  },
  SVK: {
    ja: "スロバキア",
    en: "Slovakia",
    ko: "슬로바키아"
  },
  SVN: {
    ja: "スロベニア",
    en: "Slovenia",
    ko: "슬로베니아"
  },
  SWE: {
    ja: "スウェーデン",
    en: "Sweden",
    ko: "스웨덴"
  },
  SWZ: {
    ja: "スワジランド",
    en: "Eswatini",
    ko: "에스와티니"
  },
  SXM: {
    ja: "シント・マールテン(オランダ領)",
    en: "Sint Maarten (Dutch part)",
    ko: "신트마르턴"
  },
  SYC: {
    ja: "セーシェル",
    en: "Seychelles",
    ko: "세이셸"
  },
  SYR: {
    ja: "シリア・アラブ共和国",
    en: "Syrian Arab Republic",
    ko: "시리아"
  },
  TCA: {
    ja: "タークス・カイコス諸島",
    en: "Turks and Caicos Islands",
    ko: "터크스케이커스제도"
  },
  TCD: {
    ja: "チャド",
    en: "Chad",
    ko: "차드"
  },
  TGO: {
    ja: "トーゴ",
    en: "Togo",
    ko: "토고"
  },
  THA: {
    ja: "タイ",
    en: "Thailand",
    ko: "태국"
  },
  TJK: {
    ja: "タジキスタン",
    en: "Tajikistan",
    ko: "타지키스탄"
  },
  TKL: {
    ja: "トケラウ",
    en: "Tokelau",
    ko: "토켈라우"
  },
  TKM: {
    ja: "トルクメニスタン",
    en: "Turkmenistan",
    ko: "투르크메니스탄"
  },
  TLS: {
    ja: "東ティモール",
    en: "Timor-Leste",
    ko: "동티모르"
  },
  TON: {
    ja: "トンガ",
    en: "Tonga",
    ko: "통가"
  },
  TTO: {
    ja: "トリニダード・トバゴ",
    en: "Trinidad and Tobago",
    ko: "트리니다드토바고"
  },
  TUN: {
    ja: "チュニジア",
    en: "Tunisia",
    ko: "튀니지"
  },
  TUR: {
    ja: "トルコ",
    en: "Türkiye",
    ko: "튀르키예"
  },
  TUV: {
    ja: "ツバル",
    en: "Tuvalu",
    ko: "투발루"
  },
  TWN: {
    ja: "台湾",
    en: "Taiwan, Province of China",
    ko: "중화민국"
  },
  TZA: {
    ja: "タンザニア",
    en: "Tanzania, United Republic of",
    ko: "탄자니아"
  },
  UGA: {
    ja: "ウガンダ",
    en: "Uganda",
    ko: "우간다"
  },
  UKR: {
    ja: "ウクライナ",
    en: "Ukraine",
    ko: "우크라이나"
  },
  UMI: {
    ja: "合衆国領有小離島",
    en: "United States Minor Outlying Islands",
    ko: "미국령군소제도"
  },
  URY: {
    ja: "ウルグアイ",
    en: "Uruguay",
    ko: "우루과이"
  },
  USA: {
    ja: "アメリカ合衆国",
    en: "United States of America",
    ko: "미국"
  },
  UZB: {
    ja: "ウズベキスタン",
    en: "Uzbekistan",
    ko: "우즈베키스탄"
  },
  VAT: {
    ja: "バチカン市国",
    en: "Holy See",
    ko: "바티칸시국"
  },
  VCT: {
    ja: "セントビンセントおよびグレナディーン諸島",
    en: "Saint Vincent and the Grenadines",
    ko: "세인트빈센트그레나딘"
  },
  VEN: {
    ja: "ベネズエラ・ボリバル共和国",
    en: "Venezuela, Bolivarian Republic of",
    ko: "베네수엘라"
  },
  VGB: {
    ja: "イギリス領ヴァージン諸島",
    en: "Virgin Islands (British)",
    ko: "영국령버진아일랜드"
  },
  VIR: {
    ja: "アメリカ領ヴァージン諸島",
    en: "Virgin Islands (U.S.)",
    ko: "미국령버진아일랜드"
  },
  VNM: {
    ja: "ベトナム",
    en: "Viet Nam",
    ko: "베트남"
  },
  VUT: {
    ja: "バヌアツ",
    en: "Vanuatu",
    ko: "바누아투"
  },
  WLF: {
    ja: "ウォリス・フツナ",
    en: "Wallis and Futuna",
    ko: "왈리스푸투나"
  },
  WSM: {
    ja: "サモア",
    en: "Samoa",
    ko: "사모아"
  },
  YEM: {
    ja: "イエメン",
    en: "Yemen",
    ko: "예멘"
  },
  ZAF: {
    ja: "南アフリカ",
    en: "South Africa",
    ko: "남아프리카공화국"
  },
  ZMB: {
    ja: "ザンビア",
    en: "Zambia",
    ko: "잠비아"
  },
  ZWE: {
    ja: "ジンバブエ",
    en: "Zimbabwe",
    ko: "짐바브웨"
  },
  ZZZ: {
    ja: "不明",
    en: "Unknown",
    ko: "알 수 없음"
  }
};

function getCountryOptionName(lang, key) {
  return `${country_codes[key][lang]} (${key})`;
}

const country_code_values = Object.keys(country_codes);
const country_name_list_english = Object.keys(country_codes).map((key) =>
  getCountryOptionName("en", key)
);
const country_name_list_japanese = Object.keys(country_codes).map((key) =>
  getCountryOptionName("ja", key)
);
const country_name_list_korean = Object.keys(country_codes).map((key) =>
  getCountryOptionName("ko", key)
);

const state_name_list_japanese = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const relationshipColumnInfo = {
  columnId: "case_relationship",
  dataKey: "relationship",
  inputType: "select",
  section: "basic_info",
  type: "dropdown",
  table: true,
  displayName: elementTranslation["relationship"],
  options: {
    dataValue: [
      "proband_individual",
      "father",
      "mother",
      "parent_unknown",
      "spouse_proband",
      "spouse_child",
      "spouse_sibling",
      "spouse_uncle_aunt",
      "sibling",
      "child",
      "grandparent_paternal",
      "grandparent_maternal",
      "grandparent_unknown",
      "uncle_paternal",
      "uncle_maternal",
      "aunt_paternal",
      "aunt_maternal",
      "nephew_niece",
      "grandchild",
      "cousin",
      "unknown",
      "other_paternal",
      "other_maternal",
    ],
    en: [
      "Proband (the individual)",
      "Father",
      "Mother",
      "Parent (unknown details)",
      "Spouse of proband",
      "Spouse of child",
      "Spouse of sibling",
      "Spouse of uncle/aunt",
      "Siblings",
      "Child",
      "Grandparents (paternal)",
      "Grandparents (maternal)",
      "Grandparents (unknown details)",
      "Uncle (paternal)",
      "Uncle (maternal)",
      "Aunt (paternal)",
      "Aunt (maternal)",
      "Nephew/Niece",
      "Grandchild",
      "Cousin",
      "Unknown",
      "Other (paternal)",
      "Other (maternal)",
    ],
    ja: [
      "発端者（本人）",
      "父",
      "母",
      "親（詳細不明）",
      "本人の配偶者",
      "子どもの配偶者",
      "兄弟の配偶者",
      "おじおばの配偶者",
      "同胞",
      "子ども",
      "祖父母（父方）",
      "祖父母（母方）",
      "祖父母（詳細不明）",
      "おじ（父方）",
      "おじ（母方）",
      "おば（父方）",
      "おば（母方）",
      "甥姪",
      "孫",
      "いとこ",
      "不明",
      "その他（父方）",
      "その他（母方）",
    ],
    ko: [
      "발단자(본인)",
      "부",
      "모",
      "부모(상세 불명)",
      "본인의 배우자",
      "자녀의 배우자",
      "형제의 배우자",
      "삼촌의 배우자",
      "형제자매",
      "자식",
      "조부모(아버지 쪽)",
      "조부모(어머니 쪽)",
      "조부모(상세 불명)",
      "삼촌(아버지 쪽)",
      "삼촌(어머니 쪽)",
      "고모(아버지 쪽)",
      "이모(어머니 쪽)",
      "조카",
      "손자녀",
      "사촌",
      "불명",
      "기타(아버지 쪽)",
      "기타(어머니 쪽)",
    ],
    zh: [
      "发端者（本人）",
      "父亲",
      "母亲",
      "父母（详细不明）",
      "校长的配偶",
      "孩子的配偶",
      "兄弟姐妹的配偶",
      "叔叔和婶婶的配偶",
      "兄弟姐妹",
      "孩子",
      "祖父母（父方）",
      "祖父母（母方）",
      "祖父母（详细不明）",
      "叔叔（父方）",
      "叔叔（母方）",
      "姑姑（父方）",
      "姨妈（母方）",
      "侄子侄女",
      "孙子孙女",
      "表亲",
      "不明",
      "其他（父方）",
      "其他（母方）",
    ],
    zhcht: [
      "發端者（本人）",
      "父親",
      "母親",
      "父母（詳細不明）",
      "該人的配偶",
      "孩子的配偶",
      "兄弟姐妹的配偶",
      "叔叔和嬸嬸的配偶",
      "兄弟姊妹",
      "孩子",
      "祖父母（父方）",
      "祖父母（母方）",
      "祖父母（詳細不明）",
      "叔叔（父方）",
      "叔叔（母方）",
      "姑姑（父方）",
      "姨媽（母方）",
      "侄子侄女",
      "孫子孫女",
      "表親",
      "不明",
      "其他（父方）",
      "其他（母方）",
    ],
  },
};

let sexColumnInfo = {
  columnId: "case_sex",
  dataKey: "sex",
  section: "basic_info",
  inputType: "radio",
  type: "dropdown",
  table: true,
  displayName: elementTranslation["sex"],
  options: {
    dataValue: ["unknown", "male", "female", "other"],
    en: ["Unknown", "Male", "Female", "Other"],
    ja: ["不明", "男性", "女性", "その他"],
    ko: ["불명", "남성", "여성", "기타"],
    zh: ["未知", "男性", "女性", "其他"],
    zhcht: ["未知", "男性", "女性", "其他"],
  },
};

const lifeStatusColumnInfo = {
  columnId: "case_life_status",
  dataKey: "lifeStatus",
  inputType: "radio",
  section: "basic_info",
  type: "dropdown",
  table: true,
  displayName: elementTranslation["life_status"],
  options: {
    dataValue: ["unknown", "alive", "deceased"],
    en: ["Unknown", "Alive", "Deceased"],
    ja: ["不明", "生存", "故人"],
    ko: ["불명", "생존", "고인"],
    zh: ["不明", "活着的", "已故的"],
    zhcht: ["不明", "活着的", "已故的"],
  },
};

let groupLabels = {
  medical_body_info: {
    en: "Body Info at Examination",
    ja: "診察時身体情報",
    ko: "검사 시 신체 정보",
  },
  family_cancer_history_details: {
    en: "Cancer History Details",
    ja: "がん罹患歴詳細",
    ko: "암 발병 이력 상세",
  },
  sample_prescription_info: {
    en: "Prescription details at the time of collection",
    ja: "検体採取時の処方内容",
    ko: "검체 채취 시 처방 내용",
  },
  medical_suspected_disease: {
    en: "Suspected Disease Name",
    ja: "疑い病名",
    ko: "의심 병명",
  },
  medical_clinical_diagnosis: {
    en: "Clinical Diagnosis",
    ja: "臨床診断",
    ko: "임상 진단",
  },
  medical_final_diagnosis: elementTranslation["final_diagnosis"],
  medical_disease_of_previous_history:
    elementTranslation["medical-disease-name-of-previous-history-name"],
  medical_complication_history:
    elementTranslation["medical-complication-history-name"],
  medical_applied_intractable_disease:
    elementTranslation["medical-interactable-disease"],
  medical_applied_pediatric_disease:
    elementTranslation["medical-pediatric-disease"],
};

let categories = [
  {
    categoryId: columnKeys.CASE_INFO,
    dataKey: "caseInfo",
    iconClass: "modal-icon modal-patient",
    iconName: "",
    displayName: {
      en: "Case Info",
      ja: "症例基本情報",
      ko: "의료사례 기본 정보",
      zh: "案件基本信息",
      zhcht: "案件基本信息",
    },
    sections: [
      {
        name: "id",
        displayName: {
          en: "ID",
        },
      },
      {
        name: "basic_info",
        displayName: {
          en: "Basic Info",
          ja: "基本情報",
          ko: "기본 정보",
        },
      },
      {
        name: "ethnicity",
        displayName: {
          en: "Etnicity",
          ja: "民族・出生地",
          ko: "민족・출신지",
        },
      },
      {
        name: "birth",
        displayName: {
          en: "Birth Info",
          ja: "出生時",
          ko: "출생 정보",
        },
      },
      {
        name: "assisted_reproduction",
        displayName: {
          en: "Assisted Reproduction",
          ja: "生殖補助",
          ko: "보조 생식",
        },
      },
      {
        name: "inputter_info",
        displayName: {
          en: "Inputter Info",
          ja: "入力者情報",
          ko: "입력자 정보",
        },
      },
    ],

    columns: [
      {
        columnId: "PCFNo",
        dataKey: "PCFNo",
        type: "display",
        section: "id",
        table: false,
        displayName: {
          en: "PCF No.",
          ja: "PCF No.",
          ko: "PCF No.",
        },
      },
      {
        columnId: "share_id",
        type: "text",
        section: "id",
        readOnly: true,
        table: true,
        displayName: {
          en: "Share ID",
          ja: "Share ID",
          ko: "Share ID",
        },
      },
      {
        columnId: "case_id",
        dataKey: "caseId",
        inputType: "text",
        section: "id",
        phenoKey: "",
        type: "text",
        table: true,
        displayName: elementTranslation["case_id"],
      },
      {
        columnId: "case_family_id",
        dataKey: "familyId",
        inputType: "input-select",
        phenoKey: "",
        section: "id",
        type: "text",
        table: true,
        displayName: {
          en: "Family ID",
          ja: "家族ID",
          ko: "가족 ID",
          zh: "家人ID",
          zhcht: "家人ID",
        },
      },
      {
        columnId: "case_group",
        dataKey: "group",
        inputType: "input-select",
        section: "id",
        type: "text",
        table: true,
        displayName: {
          en: "Group",
          ja: "グループ名",
          ko: "그룹명",
          zh: "集团名称",
          zhcht: "集團名稱",
        },
      },
      relationshipColumnInfo,
      {
        columnId: "case_parent_id",
        dataKey: "caseParentId",
        inputType: "select",
        section: "basic_info",
        table: false,
        parentInputInModal: "case_relationship",
        inSameRow: true,
        displayName: {
          en: "Parent Case ID",
          ja: "親の症例ID",
          ko: "부모 사례 ID",
        },
        options: {
          dataValue: [],
          en: [],
          ja: [],
          ko: [],
          zh: [],
          zhcht: [],
        },
      },
      {
        columnId: "case_spouse_id",
        dataKey: "caseSpouseId",
        inputType: "select",
        section: "basic_info",
        table: false,
        parentInputInModal: "case_relationship",
        inSameRow: true,
        displayName: {
          en: "Spouse's Case ID",
          ja: "配偶者の症例ID",
          ko: "배우자의 사례 ID",
        },
        options: {
          dataValue: [],
          en: [],
          ja: [],
          ko: [],
          zh: [],
          zhcht: [],
        },
      },
      {
        columnId: "case_participation_of_relatives_in_this_study",
        inputType: "radio",
        type: "dropdown",
        section: "basic_info",
        table: true,
        displayName: {
          en: "Participation of relatives in this study",
          ja: "血縁者の本研究参加の有無",
          ko: "본 연구에 가족이 참여하는지 여부",
        },
        options: {
          dataValue: [
            "not_applicable",
            "not_participated",
            "already_participated",
            "plan_to_participate",
          ],
          en: [
            "Not applicable",
            "Not participated",
            "Participated",
            "Plan to participate",
          ],
          ja: ["該当なし", "なし", "あり", "参加予定"],
          ko: ["해당사항 없음", "불참", "참여", "참여 예정"],
        },
      },
      sexColumnInfo,
      {
        columnId: "case_sex_details",
        dataKey: "sexDetails",
        inputType: "text",
        section: "basic_info",
        type: "text",
        readOnly: true,
        parentInputInModal: "case_sex",
        noBorder: true,
        enableWhen: ["other"],
        table: true,
        displayName: {
          en: "Sex Other Details",
          ja: "性別 その他詳細",
          ko: "성별 기타 상세 정보",
        },
      },
      {
        columnId: "case_presence_or_absence_of_onset",
        dataKey: "presenceOrAbsenceOfOnset",
        inputType: "radio",
        section: "basic_info",
        type: "dropdown",
        table: true,
        displayName: {
          en: "Presence or absence of onset",
          ja: "発症の有無",
          ko: "발병 유무",
          zh: "发病的有无",
          zhcht: "發病的有無",
        },
        options: {
          dataValue: ["unknown", "onset", "asymptomatic"],
          en: ["Unknown", "Onset", "Asymptomatic"],
          ja: ["不明", "発症", "未発症"],
          ko: ["알 수 없음", "발병", "무증상"],
          zh: ["不明", "发病", "无症状"],
          zhcht: ["不明", "發病", "無症狀"],
        },
      },
      lifeStatusColumnInfo,
      {
        columnId: "case_birth",
        dataKey: "birth",
        inputType: "select-date",
        section: "basic_info",
        type: "date",
        table: true,
        displayName: {
          en: "Birth (yyyy/mm)",
          ja: "生年月 (yyyy/mm)",
          ko: "출생 연월 (yyyy/mm)",
          zh: "出生日期 (yyyy/mm)",
          zhcht: "出生日期 (yyyy/mm)",
        },
      },
      {
        columnId: "case_age",
        dataKey: "age",
        inputType: "select-age",
        section: "basic_info",
        type: "text",
        readOnly: true,
        table: true,
        displayName: elementTranslation["age_ymd"],
      },
      {
        columnId: "case_age_on_examination",
        dataKey: "ageOnExamination",
        inputType: "select-age",
        section: "basic_info",
        type: "text",
        readOnly: true,
        table: true,
        displayName: elementTranslation["age_on_examination_ymd"],
      },

      {
        columnId: "case_death",
        dataKey: "death",
        inputType: "select-date",
        section: "basic_info",
        type: "date",
        parentInputInModal: "case_life_status",
        enableWhen: ["deceased"],
        table: true,
        displayName: {
          en: "Death (yyyy/mm)",
          ja: "没年月 (yyyy/mm)",
          ko: "사망 연월 (yyyy/mm)",
          zh: "已故日期 (yyyy/mm)",
          zhcht: "已故日期 (yyyy/mm)",
        },
      },
      {
        columnId: "case_cause_of_death",
        dataKey: "causeOfDeath",
        inputType: "select",
        section: "basic_info",
        type: "dropdown",
        table: true,
        parentInputInModal: "case_life_status",
        enableWhen: ["deceased"],
        displayName: {
          en: "Cause of death",
          ja: "死因",
          ko: "사망 원인",
        },
        options: {
          dataValue: ["concerned_disease", "other_disease"],
          en: ["Concerned disease", "Other disease"],
          ja: ["当該疾患", "当該疾患以外"],
          ko: ["해당 질병", "기타 질병"],
          zh: [],
          zhcht: [],
        },
      },
      {
        columnId: "case_cause_of_death_details",
        dataKey: "causeOfDeathDetails",
        inputType: "text",
        section: "basic_info",
        table: true,
        parentInputInModal: "case_cause_of_death",
        inSameRow: true,
        enableWhen: ["other_disease"],
        displayName: {
          en: "Detail of Cause of death",
          ja: "当該疾患以外のときの死因詳細",
          ko: "기타 질병으로 인한 사망 원인 상세 정보",
        },
      },
      {
        columnId: "case_icd_11_code_of_cause_of_death",
        dataKey: "icd11CodeOfCauseOfDeath",
        inputType: "text",
        table: true,
        parentInputInModal: "case_life_status",
        enableWhen: ["deceased"],
        section: "basic_info",
        inSameRow: true,
        additionalLink: {
          label: {
            en: "detail",
            ja: "詳細",
            ko: "상세",
          },
          url: "https://www.e-stat.go.jp/classifications/terms/40",
        },
        displayName: {
          en: "ICD-11 code of cause of death",
          ja: "死因ICD-11コード",
          ko: "사망 원인 ICD-11 코드",
        },
      },
      {
        // Last date of confirmation of survival
        columnId: "case_last_date_of_confirmation_of_survival",
        dataKey: "lastDateOfConfirmationOfSurvival",
        inputType: "date",
        section: "basic_info",
        dateFormat: "YYYY/MM/DD",
        type: "date",
        includeDay: true,
        table: true,
        displayName: {
          en: "Last date of confirmation of survival (yyyy/mm/dd)",
          ja: "最終生存確認日 (yyyy/mm/dd)",
          ko: "생존 확인 최종 일자 (yyyy/mm/dd)",
        },
      },

      {
        columnId: "case_ethnicity_group",
        dataKey: "ethnicityGroup",
        inputType: "select",
        section: "ethnicity",
        autocomplete: true,
        type: "dropdown",
        table: true,
        displayName: {
          en: "Ethnicity / Group",
          ja: "民族 / 集団",
          ko: "민족 / 그룹",
        },
        options: {
          dataValue: country_code_values,
          en: country_name_list_english,
          ja: country_name_list_japanese,
          ko: country_name_list_korean,
          zh: [],
          zhcht: [],
        },
      },
      {
        columnId: "case_free_comment_about_ethnicity_group",
        dataKey: "freeCommentAboutEthnicityGroup",
        inputType: "text",
        parentInputInModal: "case_ethnicity_group",
        inSameRow: true,
        fullWidth: true,
        section: "ethnicity",
        type: "text",
        table: true,
        displayName: {
          en: "Free Comment (Ethnicity / Group)",
          ja: "自由記載（民族 / 集団）",
          ko: "기타 (민족 / 그룹)",
        },
      },
      {
        columnId: "case_country_of_birth",
        dataKey: "countryOfBirth",
        inputType: "select",
        section: "ethnicity",
        autocomplete: true,
        strict: true,
        allowInvalid: false,
        type: "dropdown",
        table: true,
        additionalLabel: {
          en: "Birth information",
          ja: "出生地",
          ko: "출생지",
        },
        displayName: {
          en: "Country",
          ja: "国",
          ko: "국가",
        },
        options: {
          dataValue: country_code_values,
          en: country_name_list_english,
          ja: country_name_list_japanese,
          ko: country_name_list_korean
        },
      },
      {
        columnId: "case_state_of_birth",
        dataKey: "stateOfBirth",
        inputType: "select",
        parentInputInModal: "case_country_of_birth",
        inSameRow: true,
        section: "ethnicity",
        autocompleteWhen: [
          getCountryOptionName("ja", "JPN"),
          getCountryOptionName("en", "JPN"),
        ],
        autocomplete: true,
        fullWidth: true,
        type: "text",
        table: true,
        displayName: {
          en: "State",
          ja: "都道府県",
          ko: "시도",
        },
        options: {
          en: state_name_list_japanese,
          ja: state_name_list_japanese,
        },
      },
      {
        columnId: "case_city_of_birth",
        dataKey: "cityOfBirth",
        parentInputInModal: "case_country_of_birth",
        inSameRow: true,
        inputType: "text",
        fullWidth: true,
        section: "ethnicity",
        type: "text",
        table: true,
        displayName: {
          en: "City",
          ja: "市区町村",
          ko: "시군구",
        },
      },
      {
        columnId: "case_free_comment_about_birth",
        dataKey: "freeCommentAboutBirth",
        inputType: "text",
        parentInputInModal: "case_country_of_birth",
        inSameRow: true,
        fullWidth: true,
        section: "ethnicity",
        type: "text",
        table: true,
        displayName: {
          en: "Free Comment (Birth information)",
          ja: "自由記載（出生地）",
          ko: "상세 주소 (출생지)",
        },
      },
      // Birth section
      {
        columnId: "case_presence_of_prenatal_abnormalities",
        dataKey: "presenceOfPrenatalAbnormalities",
        inputType: "radio",
        section: "birth",
        type: "dropdown",
        table: true,
        displayName: {
          en: "Presence of prenatal abnormalities",
          ja: "出生前（胎児）の異常の有無",
          ko: "출산 전(태아) 이상의 유무",
        },
        options: choicesForPresence,
      },
      {
        columnId: "case_presence_of_abnormalities_at_birth",
        dataKey: "presenceOfAbnormalitiesAtBirth",
        inputType: "radio",
        section: "birth",
        type: "dropdown",
        table: true,
        displayName: {
          en: "Presence of abnormalities (jaundice, etc.)",
          ja: "異常（黄疸等）の有無",
          ko: "이상 유무 (황달 등)",
        },
        options: choicesForPresence,
      },
      {
        columnId: "case_presence_of_medical_assistance_at_birth",
        dataKey: "presenceOfMedicalAssistanceAtBirth",
        inputType: "radio",
        section: "birth",
        type: "dropdown",
        table: true,
        displayName: {
          en: "Presence of medical assistance at birth",
          ja: "医療介助の有無（出産時）",
          ko: "출산 시 의료 지원의 유무",
        },
        options: choicesForPresence,
      },
      {
        columnId: "case_gestational_age_at_birth",
        dataKey: "gestationalAgeAtBirth",
        inputType: "number",
        type: "numeric",
        section: "birth",
        table: true,
        displayName: {
          en: "Gestational age at (weeks)",
          ja: "在胎週数 (週)",
          ko: "임신 주수 (주)",
        },
      },
      {
        columnId: "case_age_of_mother_at_birth",
        dataKey: "ageOfMotherAtBirth",
        inputType: "select-age",
        type: "text",
        readOnly: true,
        section: "birth",
        table: true,
        displayName: {
          en: "Age of mother (YMD)",
          ja: "母親の年齢 (YMD)",
          ko: "어머니의 나이 (YMD)",
        },
      },
      {
        columnId: "case_age_of_father_at_birth",
        dataKey: "ageOfFatherAtBirth",
        inputType: "select-age",
        type: "text",
        readOnly: true,
        section: "birth",
        table: true,
        displayName: {
          en: "Age of father (YMD)",
          ja: "父親の年齢 (YMD)",
          ko: "아버지의 나이 (YMD)",
        },
      },
      // Assisted Reproduction section
      {
        columnId: "case_presence_of_assisted_reproductive_technology",
        dataKey: "presenceOfAssistedReproductiveTechnology",
        inputType: "radio",
        section: "assisted_reproduction",
        type: "dropdown",
        table: true,
        displayName: {
          en: "Presence of assisted reproductive technology",
          ja: "生殖補助医療の有無",
          ko: "보조 생식 기술의 사용 유무",
        },
        options: choicesForPresence,
      },
      {
        columnId: "case_type_of_assisted_reproductive_technology",
        dataKey: "typeOfAssistedReproductiveTechnology",
        inputType: "multi-checkbox",
        section: "assisted_reproduction",
        type: "text",
        readOnly: true,
        additionalClass: "full-width-checkbox",
        table: true,
        displayName: {
          en: "Type of assisted reproductive technology",
          ja: "生殖補助医療の種類",
          ko: "보조 생식 기술의 종류",
        },
        options: {
          dataValue: ["ivf_et", "icsi", "frozen_embryo", "other", "unknown"],
          en: [
            "In vitro fertilization/embryo transfer（IVF-ET）",
            "Intracytoplasmic sperm injection（ICSI）",
            "Frozen embryo / thawing transfer",
            "Other",
            "Unknown",
          ],
          ja: [
            "体外受精・胚移植（IVF-ET）",
            "顕微授精（卵細胞質内精子注入法、ICSI）",
            "凍結胚・融解移植",
            "その他",
            "不明",
          ],
          ko: [
            "체외수정-배아 이식 (IVF-ET)",
            "세포질내 정자 주입법 (ICSI)",
            "냉동 배아 및 해동 이식",
            "기타",
            "알 수 없음",
          ],
          zh: [],
          zhcht: [],
        },
      },
      // Inputter Info section
      {
        columnId: "case_date_of_survey",
        dataKey: "dateOfSurvey",
        inputType: "date",
        dateFormat: "YYYY/MM/DD",
        section: "inputter_info",
        type: "date",
        includeDay: true,
        table: true,
        displayName: {
          en: "Date of survey",
          ja: "調査実施日 (yyyy/mm/dd)",
          ko: "조사 날짜 (yyyy/mm/dd)",
        },
      },
      {
        columnId: "case_examination_day",
        dataKey: "examinationDay",
        inputType: "date",
        section: "inputter_info",
        dateFormat: "YYYY/MM/DD",
        type: "date",
        includeDay: true,
        table: true,
        displayName: {
          en: "Examination day",
          ja: "診察日 (yyyy/mm/dd)",
          ko: "진찰 날짜 (yyyy/mm/dd)",
          zh: "诊察日 (yyyy/mm/dd)",
          zhcht: "診察日 (yyyy/mm/dd)",
        },
      },
      {
        columnId: "case_name_of_facility",
        dataKey: "nameOfFacility",
        inputType: "text",
        section: "inputter_info",
        table: true,
        displayName: {
          en: "Facility",
          ja: "施設名",
          ko: "시설명",
        },
      },
      {
        columnId: "case_code_of_facility",
        dataKey: "codeOfFacility",
        inputType: "text",
        section: "inputter_info",
        parentInputInModal: "case_name_of_facility",
        fullWidth: true,
        inSameRow: true,
        contextMenuLabel: {
          en: "Code Of Facility",
          ja: "施設コード",
          ko: "시설 코드",
        },
        table: true,
        displayName: {
          en: "Code Of Facility",
          ja: "施設コード",
          ko: "시설 코드",
        },
      },
      {
        columnId: "case_family_name_of_doctor_in_charge",
        dataKey: "familyNameOfDoctorInCharge",
        section: "inputter_info",
        inputType: "text",
        table: true,
        contextMenuLabel: {
          en: "Name Of Doctor In Charge",
          ja: "担当医師名",
          ko: "담당 의사 이름",
        },
        displayName: {
          en: "Family Name Of Doctor In Charge",
          ja: "担当医師名（姓）",
          ko: "담당 의사 성",
        },
      },
      {
        columnId: "case_first_name_of_doctor_in_charge",
        dataKey: "firstNameOfDoctorInCharge",
        section: "inputter_info",
        inputType: "text",
        parentInputInModal: "case_family_name_of_doctor_in_charge",
        inSameRow: true,
        fullWidth: true,
        table: true,
        displayName: {
          en: "First Name Of Doctor In Charge",
          ja: "担当医師名（名）",
          ko: "담당 의사 이름",
        },
      },

      {
        columnId: "case_family_name_of_inputter",
        dataKey: "familyNameOfInputter",
        inputType: "text",
        section: "inputter_info",
        table: true,
        contextMenuLabel: {
          en: "Name of Inputter",
          ja: "入力者名",
          ko: "입력자 이름",
        },
        displayName: {
          en: "Family Name Of Inputter",
          ja: "入力者名（姓）",
          ko: "입력자 성",
        },
      },
      {
        columnId: "case_first_name_of_inputter",
        dataKey: "firstNameOfInputter",
        parentInputInModal: "case_family_name_of_inputter",
        inSameRow: true,
        section: "inputter_info",
        fullWidth: true,
        inputType: "text",
        table: true,
        displayName: {
          en: "First Name Of Inputter",
          ja: "入力者名（名）",
          ko: "입력자 이름",
        },
      },
      {
        columnId: "case_note",
        dataKey: "note",
        inputType: "textarea",
        section: "inputter_info",
        type: "text",
        table: true,
        displayName: {
          en: "Note",
          ja: "備考",
          ko: "비고",
          zh: "备注",
          zhcht: "備註",
        },
        displayNameOnTable: {
          en: "Inputter Info Note",
          ja: "入力者情報_備考",
          ko: "입력자 정보 비고",
          zh: "输入用户信息备注",
          zhcht: "輸入使用者資訊備註",
        },
      },
      {
        columnId: "case_created_at",
        dataKey: "created_at",
        section: "inputter_info",
        inputType: "readOnly",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Created At",
          ja: "作成日時",
          ko: "작성 날짜",
        },
      },
      {
        columnId: "case_updated_at",
        dataKey: "updated_at",
        section: "inputter_info",
        inputType: "readOnly",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Updated At",
          ja: "更新日時",
          ko: "업데이트 날짜",
        },
      },
    ],
  },
  medicalInfoCategory,
  {
    categoryId: "phenotype_info",
    dataKey: "phenotypicInfo",
    iconClass: "modal-icon modal-phenotype",
    iconName: "",
    displayName: {
      en: "Phenotype",
      ja: "表現型",
      ko: "표현형 정보",
      zh: "表型信息",
      zhcht: "表型信息",
    },
    // modified by hzhang@bits.cc start
    doc_list: [
      {
        docId: "phenotype_medical_current_history",
        title: null,
        text: null,
        hpo_list: [],
        withUI: "yes",
        schema: "auto",
        dataSrcColumnId: "medical_current_history",
      },
      {
        docId: "phenotype_medical_previous_history",
        title: null,
        text: null,
        hpo_list: [],
        withUI: "yes",
        schema: "auto",
        dataSrcColumnId: "medical_previous_history",
      },
      {
        docId: "phenotype_process",
        withUI: "yes",
        title: null,
        text: null,
        hpo_list: [],
        schema: "auto",
        dataSrcColumnId: "medical_process",
      },
      {
        docId: "phenotype_family_history",
        withUI: "yes",
        title: null,
        text: null,
        hpo_list: [],
        schema: "auto",
        dataSrcColumnId: "family_history",
      },
    ],
    columns: [
      {
        columnId: "phenotype_hpo_id",
        dataKey: "id",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "HPO ID",
          ja: "HPO ID",
          ko: "HPO ID",
          zh: "HPO ID",
          zhcht: "HPO ID",
        },
      },
      {
        columnId: "phenotype_hpo_label",
        dataKey: "name",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Symptom",
          ja: "症状",
          ko: "증상",
          zh: "症状",
          zhcht: "症狀",
        },
        languages: ["en", "ja", "ko", "zh", "zhcht"],
      },
      {
        columnId: "phenotype_medical_current_history",
        dataKey: "source_medical_history_current",
        inputType: "checkbox",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Current Medical History",
          ja: "現病歴",
          ko: "현재 병력",
          zh: "现病史",
          zhcht: "現病史",
        },
        options: {
          dataValue: ["no", "yes"],
          en: ["No", "Yes"],
          ja: ["無", "有"],
          ko: ["없음", "있음"],
          zh: ["No", "Yes"],
          zhcht: ["No", "Yes"],
        },
      },
      {
        columnId: "phenotype_medical_previous_history",
        dataKey: "source_medical_history_previous",
        inputType: "checkbox",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Previous Medical History",
          ja: "既往歴",
          ko: "과거 병력",
          zh: "既往病史",
          zhcht: "既往病史",
        },
        options: {
          dataValue: ["no", "yes"],
          en: ["No", "Yes"],
          ja: ["無", "有"],
          ko: ["없음", "있음"],
          zh: ["No", "Yes"],
          zhcht: ["No", "Yes"],
        },
      },
      {
        columnId: "phenotype_process",
        dataKey: "source_medical_history_process",
        inputType: "checkbox",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Process",
          ja: "経過",
          ko: "경과",
          zh: "进程",
          zhcht: "進程",
        },
        options: {
          dataValue: ["no", "yes"],
          en: ["No", "Yes"],
          ja: ["無", "有"],
          ko: ["없음", "있음"],
          zh: ["No", "Yes"],
          zhcht: ["No", "Yes"],
        },
      },
      {
        columnId: "phenotype_family_history",
        dataKey: "source_medical_history_family",
        inputType: "checkbox",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Family History",
          ja: "家族歴",
          ko: "가족력",
          zh: "家族史",
          zhcht: "家族史",
        },
        options: {
          dataValue: ["no", "yes"],
          en: ["No", "Yes"],
          ja: ["無", "有"],
          ko: ["없음", "있음"],
          zh: ["No", "Yes"],
          zhcht: ["No", "Yes"],
        },
      },
      {
        columnId: "phenotype_excluded",
        dataKey: "is_observed",
        inputType: "select",
        phenoKey: "",
        type: "dropdown",
        readOnly: true,
        table: true,
        displayName: {
          en: "Excluded",
          ja: "症状の有無",
          ko: "증상의 유무",
          zh: "有无症状",
          zhcht: "有無症狀",
        },
        options: {
          dataValue: ["no", "yes"],
          en: ["No", "Yes"],
          ja: ["症状あり", "症状なし"],
          ko: ["증상 있음", "증상 없음"],
          zh: ["有症状", "无症状"],
          zhcht: ["有症狀", "無症狀"],
        },
      },
      {
        columnId: "phenotype_clinical_relevance",
        dataKey: "hpo_clinical_relevance",
        inputType: "select",
        phenoKey: "",
        type: "dropdown",
        readOnly: true,
        table: true,
        displayName: {
          en: "Clinical relevance",
          ja: "重要性",
          ko: "중요성",
          zh: "重要性",
          zhcht: "重要性",
        },
        options: {
          dataValue: ["normal", "distinctive", "minor"],
          en: ["Normal", "Distinctive finding", "Minor finding"],
          ja: ["通常", "高い", "低い"],
          ko: ["보통", "높은", "낮은"],
          zh: ["Normal", "Distinctive finding", "Minor finding"],
          zhcht: ["Normal", "Distinctive finding", "Minor finding"],
        },
      },
      {
        columnId: "phenotype_severity",
        dataKey: "hpo_severity",
        inputType: "select",
        phenoKey: "",
        type: "dropdown",
        readOnly: true,
        table: true,
        displayName: {
          en: "Severity",
          ja: "重症度",
          ko: "중증도",
          zh: "重症程度",
          zhcht: "重症程度",
        },
        options: {
          dataValue: ["borderline", "severe", "profound", "moderate", "mild"],
          en: ["Borderline", "Severe", "Profound", "Moderate", "Mild"],
          ja: ["境界域", "重度", "最重度", "中等度", "軽度"],
          ko: ["경계영역", "중증", "가장 무거운", "보통 높음", "경증"],
          zh: ["Borderline", "Severe", "Profound", "Moderate", "Mild"],
          zhcht: ["Borderline", "Severe", "Profound", "Moderate", "Mild"],
        },
      },
      {
        columnId: "phenotype_age_onset",
        dataKey: "hpo_age_of_onset",
        inputType: "age",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Age of Onset (YMD)",
          ja: "発症年齢 (YMD)",
          ko: "발병연령 (YMD)",
          zh: "发病年龄 (YMD)",
          zhcht: "發病年齡 (YMD)",
        },
        displayNameOnTable: {
          en: "Age of Onset of Symptoms (YMD)",
          ja: "症状の発症年齢 (YMD)",
          ko: "증상의 발병연령 (YMD)",
          zh: "发病年龄 (YMD)",
          zhcht: "發病年齡 (YMD)",
        },
      },
      {
        columnId: "phenotype_temporal_pattern",
        dataKey: "hpo_temporal_pattern",
        inputType: "select",
        phenoKey: "",
        type: "dropdown",
        readOnly: true,
        table: true,
        displayName: {
          en: "Temporal pattern",
          ja: "発症パターン",
          ko: "발병 패턴",
          zh: "发症模式",
          zhcht: "發症模式",
        },
        options: {
          dataValue: [
            "unknown",
            "recurrent",
            "subacute",
            "fluctuating",
            "migratory",
            "diurnal",
            "stable",
            "insidious",
            "prolonged",
            "nocturnal",
            "chronic",
            "transient",
          ],
          en: [
            "Unknown",
            "Recurrent Acute",
            "Subacute",
            "Fluctuating",
            "Migratory",
            "Diurnal",
            "Stable",
            "Insidious onset",
            "Prolonged",
            "Nocturnal",
            "Chronic",
            "Transient",
          ],
          ja: [
            "Unknown",
            "Recurrent Acute",
            "Subacute",
            "Fluctuating",
            "Migratory",
            "Diurnal",
            "Stable",
            "Insidious onset",
            "Prolonged",
            "Nocturnal",
            "Chronic",
            "Transient",
          ],
          ko: [
            "Unknown",
            "Recurrent Acute",
            "Subacute",
            "Fluctuating",
            "Migratory",
            "Diurnal",
            "Stable",
            "Insidious onset",
            "Prolonged",
            "Nocturnal",
            "Chronic",
            "Transient",
          ],
          zh: [
            "Unknown",
            "Recurrent Acute",
            "Subacute",
            "Fluctuating",
            "Migratory",
            "Diurnal",
            "Stable",
            "Insidious onset",
            "Prolonged",
            "Nocturnal",
            "Chronic",
            "Transient",
          ],
          zhcht: [
            "Unknown",
            "Recurrent Acute",
            "Subacute",
            "Fluctuating",
            "Migratory",
            "Diurnal",
            "Stable",
            "Insidious onset",
            "Prolonged",
            "Nocturnal",
            "Chronic",
            "Transient",
          ],
        },
      },
      {
        columnId: "phenotype_pace_progression",
        dataKey: "hpo_pace_of_progression",
        inputType: "select",
        phenoKey: "",
        type: "dropdown",
        readOnly: true,
        table: true,
        displayName: {
          en: "Pace of progression",
          ja: "進行速度",
          ko: "진행 속도",
          zh: "进展速度",
          zhcht: "進展速度",
        },
        options: {
          dataValue: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
          en: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
          ja: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
          ko: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
          zh: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
          zhcht: [
            "Unknown",
            "Progressive",
            "Variable progression rate",
            "Slowly progressive",
            "Nonprogressive",
            "Rapidly progressive",
          ],
        },
      },
      {
        columnId: "phenotype_resolution",
        dataKey: "hpo_resolution",
        inputType: "age",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Resolution",
          ja: "消失年齢 (YMD)",
          ko: "실종 연령(YMD)",
          zh: "Resolution",
          zhcht: "Resolution",
        },
        displayNameOnTable: {
          en: "Resolution of Symptoms",
          ja: "症状の消失年齢 (YMD)",
          ko: "증상의 실종 연령(YMD)",
          zh: "Resolution of Symptoms",
          zhcht: "Resolution of Symptoms",
        },
      },
      {
        columnId: "phenotype_comments",
        dataKey: "hpo_comments",
        inputType: "text",
        phenoKey: "",
        type: "text",
        readOnly: true,
        table: true,
        displayName: {
          en: "Comments",
          ja: "コメント",
          ko: "코멘트",
          zh: "注释",
          zhcht: "註釋",
        },
      },
    ],
    // modified by hzhang@bits.cc end
  },
  genotypeInfoCategory,
  familyInfoCategory,
  sampleTestCategory,
  registrationCategory,
];

// Map in the form of {groupId: {columns:[columns], shareHeader: boolean}}
let inputGroupInfo = {
  medical_body_info: {
    shareHeader: true,
  },
  medical_disease_of_previous_history: {
    shareHeader: true,
  },
  medical_complication_history: {
    shareHeader: true,
  },
  medical_suspected_disease: {
    shareHeader: true,
  },
  medical_clinical_diagnosis: {
    shareHeader: true,
  },
  medical_final_diagnosis: {
    shareHeader: true,
  },
  medical_applied_intractable_disease: {
    onlyJapanese: true,
    shareHeader: true,
  },
  medical_applied_pediatric_disease: {
    onlyJapanese: true,
    shareHeader: true,
  },
  genotype_testing_info: {
    shareHeader: false,
  },
  genotype: {
    shareHeader: false,
  },
  family_cancer_info: {
    shareHeader: false,
  },
  sample_prescription_info: {
    shareHeader: true,
  },
  sample_test_info: {
    shareHeader: true,
  },
};

let nestedGroupInfo = {};

// Automatically add columns with "groupBy" to the inputGroupInfo
for (let cat of categories) {
  for (let col of cat.columns) {
    if (col.groupBy) {
      if (!inputGroupInfo[col.groupBy]) {
        inputGroupInfo[col.groupBy] = {};
      }
      if (!inputGroupInfo[col.groupBy].columns) {
        inputGroupInfo[col.groupBy].columns = [];
      }
      inputGroupInfo[col.groupBy].columns.push(col);
      if (col.nestedGroup) {
        if (!nestedGroupInfo[col.nestedGroup]) {
          nestedGroupInfo[col.nestedGroup] = {};
        }
        if (!nestedGroupInfo[col.nestedGroup].columns) {
          nestedGroupInfo[col.nestedGroup].columns = [];
        }
        nestedGroupInfo[col.nestedGroup].columns.push(col);
      }
    }
  }
}

// ontologyClassId → annotationへの変換はpriorityFlagがtrueのものだけを対象にする
const annotationMap = [
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001589',
    ontologyClassLabel: 'frameshift_variant',
    annotation: 'frameshift deletion',
  },
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001589',
    ontologyClassLabel: 'frameshift_variant',
    annotation: 'frameshift insertion',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001589',
    ontologyClassLabel: 'frameshift_variant',
    annotation: 'frameshift substitution',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001578',
    ontologyClassLabel: 'inframe_deletion',
    annotation: 'nonframeshift deletion',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001589',
    ontologyClassLabel: 'inframe_insertion',
    annotation: 'nonframeshift insertion',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001583',
    ontologyClassLabel: 'missense_variant',
    annotation: 'nonframeshift substitution',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001819',
    ontologyClassLabel: 'synonymous_variant',
    annotation: 'synonymous SNV',
  },
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001583',
    ontologyClassLabel: 'missense_variant',
    annotation: 'nonsynonymous SNV',
  },
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001587',
    ontologyClassLabel: 'nonsense_variant',
    annotation: 'stopgain SNV',
  },
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001575',
    ontologyClassLabel: 'stop_lost',
    annotation: 'stoploss SNV',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001587',
    ontologyClassLabel: 'nonsense_variant',
    annotation: 'stopgain',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001575',
    ontologyClassLabel: 'stop_lost',
    annotation: 'stoploss',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001629',
    ontologyClassLabel: 'splice_region_variant',
    annotation: 'splicing',
  },
  {
    priorityFlag: true,
    ontologyClassId: 'SO:0001060',
    ontologyClassLabel: 'sequence_variant',
    annotation: 'other',
  },
  {
    priorityFlag: false,
    ontologyClassId: 'SO:0001060',
    ontologyClassLabel: 'sequence_variant',
    annotation: 'unknown',
  }
]
