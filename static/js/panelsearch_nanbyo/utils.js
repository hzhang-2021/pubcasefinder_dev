//
// common usage modules.
//
const ENUM_VAL_YES = "YES", ENUM_VAL_NO = "NO";

const KEY = {
	BACKSPACE:    8,
	TAB:          9,
	ENTER:        13,
	ESCAPE:       27,
	SPACE:        32,
	PAGE_UP:      33,
	PAGE_DOWN:    34,
	END:          35,
	HOME:         36,
	LEFT:         37,
	UP:           38,
	RIGHT:        39,
	DOWN:         40,
	DELETE:       46,
	NUMPAD_ENTER: 108,
	SEMICOLON:    186,
	COMMA:        188
  };

const ROOT_NANDO_ID_ALL         = 'ALL';
const ROOT_NANDO_ID_SPECIFIED   = 'NANDO:0000003';
const ROOT_NANDO_ID_UNSPECIFIED = 'UNSPECIFIED';

const TYPE_SPECIFIED   = 'SPECIFIED';
const TYPE_UNSPECIFIED = 'UNSPECIFIED';

const ENTITY_TYPE_ID_GENE=1,ENTITY_TYPE_ID_STR=2,ENTITY_TYPE_ID_REGION=3;

const
	RATING_DEFINITIVE	= 'Definitive',
	RATING_STRONG		= 'Strong',
	RATING_MODERATE		= 'Moderate',
	RATING_SUPPORTIVE	= 'Supportive',
	RATING_LIMITED		= 'Limited',
	RATING_DISPUTED		= 'Disputed',
	RATING_REFUTED		= 'Refuted',
	RATING_ANIMAL		= 'Animal',
	RATING_NOKNOWN		= 'No known',
	RATING_NORATING		= 'No rating',
	RATING_ID_HASH      = {
		10:        RATING_DEFINITIVE,
		20:        RATING_STRONG,
		30:        RATING_MODERATE,
		40:        RATING_SUPPORTIVE,
		50:        RATING_LIMITED,
		60:        RATING_DISPUTED,
		70:        RATING_REFUTED,
		80:        RATING_ANIMAL,
		90:        RATING_NOKNOWN,
		100:       RATING_NORATING
	},
	RATING_ORDER_HASH	= {
		[RATING_DEFINITIVE]:	10,
		[RATING_STRONG]:		20,
		[RATING_MODERATE]:		30,
		[RATING_SUPPORTIVE]:	40,
		[RATING_LIMITED]:		50,
		[RATING_DISPUTED]:		60,
		[RATING_REFUTED]:		70,
		[RATING_ANIMAL]:		80,
		[RATING_NOKNOWN]:		90,
		[RATING_NORATING]:		100
	},
	RATING_CLASS_HASH = {
		[RATING_DEFINITIVE]:	'vgp-rating-definitive',
		[RATING_STRONG]:		'vgp-rating-strong',
		[RATING_MODERATE]:		'vgp-rating-moderate',
		[RATING_SUPPORTIVE]:	'vgp-rating-supportive',
		[RATING_LIMITED]:		'vgp-rating-limited',
		[RATING_DISPUTED]:		'vgp-rating-disputed',
		[RATING_REFUTED]:		'vgp-rating-refuted',
		[RATING_ANIMAL]:		'vgp-rating-animal',
		[RATING_NOKNOWN]:		'vgp-rating-noknown',
		[RATING_NORATING]:		'vgp-rating-norating'
	},

	RATING_LIST_TAG_ID_HASH = {
		[RATING_DEFINITIVE]:	"vgp-rating-list-tag-definitive",
		[RATING_STRONG]:		"vgp-rating-list-tag-strong",
		[RATING_MODERATE]:      "vgp-rating-list-tag-moderate",
		[RATING_SUPPORTIVE]:	"vgp-rating-list-tag-supportive",
		[RATING_LIMITED]:		"vgp-rating-list-tag-limited",
		[RATING_DISPUTED]:      "vgp-rating-list-tag-disputed",
		[RATING_REFUTED]:       "vgp-rating-list-tag-refuted",
		[RATING_ANIMAL]:        "vgp-rating-list-tag-animal",
		[RATING_NOKNOWN]:       "vgp-rating-list-tag-noknown",
		[RATING_NORATING]:      "vgp-rating-list-tag-norating"
	};

function utils_isObject(value)  { return $.isPlainObject(value); }

function utils_isArray(value)   { return Array.isArray(value); }

function utils_isFunction(value) { return typeof value === "function"; }

function utils_isDefined(value) {return typeof value !== 'undefined';}

function utils_isEmpty(value, allowEmptyString) {
    return (value === null) || (value === undefined) ||
            (!allowEmptyString ? value === '' : false) ||
            (utils_isArray(value) && value.length === 0) ||
            (utils_isObject(value) && Object.keys(value).length === 0);
}

function utils_isExistVal(key, hash) {
    if (utils_isEmpty(hash)) return false;
    if (!(key in hash)) return false;
    return !utils_isEmpty(hash[key]);
}

function utils_capitalizeFirstLetter(string) {
    if (!string) return string; // Handle empty or null strings
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function utils_formatDateStr(str) {
    if (/^\d{6}$/.test(str)) {
        // YYYYMM → YYYY-MM
        return str.replace(/(\d{4})(\d{2})/, '$1-$2');
    } else if (/^\d{8}$/.test(str)) {
        // YYYYMMDD → YYYY-MM-DD
        return str.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    }
    return str;
}

function utils_format_date_to_day(date_gmt){
    const date = new Date(date_gmt);
    const pad = n => n.toString().padStart(2, '0');
    const formatted =
        date.getUTCFullYear() + "-" +
        pad(date.getUTCMonth() + 1) + "-" +
        pad(date.getUTCDate());
    return formatted;
};

function utils_format_date(date_gmt){
    const date = new Date(date_gmt);
    const pad = n => n.toString().padStart(2, '0');
    const formatted =
        date.getUTCFullYear() + "-" +
        pad(date.getUTCMonth() + 1) + "-" +
        pad(date.getUTCDate()) + " " +
        pad(date.getUTCHours()) + ":" +
        pad(date.getUTCMinutes()) + ":" +
        pad(date.getUTCSeconds());
    return formatted;
};

function utils_getTimeStamp(){
    let date = new Date();
    let year_str = date.getFullYear();
    let month_str = 1 + date.getMonth();
    let day_str = date.getDate();
    let hour_str = date.getHours();
    let minute_str = date.getMinutes();
    let second_str = date.getSeconds();
    month_str = ('0' + month_str).slice(-2);
    day_str = ('0' + day_str).slice(-2);
    hour_str = ('0' + hour_str).slice(-2);
    minute_str = ('0' + minute_str).slice(-2);
    second_str = ('0' + second_str).slice(-2);
    let format_str = 'YYYY-MM-DD hh:mm:ss';
    format_str = format_str.replace(/YYYY/g, year_str);
    format_str = format_str.replace(/MM/g, month_str);
    format_str = format_str.replace(/DD/g, day_str);
    format_str = format_str.replace(/hh/g, hour_str);
    format_str = format_str.replace(/mm/g, minute_str);
    format_str = format_str.replace(/ss/g, second_str);

    return format_str;
}


function utils_construct_hash_by_arr(arr,key){
	let ret = {};
	for(let item of arr){
		let key_v = item[key];
		if(!(key_v in ret)){
			ret[key_v] = [];
		}
		ret[key_v].push(item);
	}
	return ret;
}

function utils_trimAllSpaces(str) {
    return str.replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
}

function utils_nomarlize_input_text(v){
	let nv = utils_trimAllSpaces(v);
	if (typeof nv.normalize === "function") {
		mv = nv.normalize("NFC");
	}
	return nv;
}

function utils_parseJson(text) {
    var json_data = null;
    try {
        json_data = JSON.parse(text);
    } catch (d) {
        console.log(d);
    }
    return json_data;
}

function utils_attach_auto_search(input_id, do_search){
    $('#' + input_id)
	    .bind("input", function (event) {
		    if (String.fromCharCode(event.which)) {
		        setTimeout(function () { do_search(); }, 50);
		    }
	    })
	    .keydown(function (event) {
		    switch (event.keyCode) {
	            case KEY.LEFT:
		        case KEY.RIGHT:
		        case KEY.UP:
		        case KEY.DOWN:
		        case KEY.HOME:
		        case KEY.END:
			        break;
		        case KEY.DELETE:
		            setTimeout(function () { do_search(); }, 50);
			        break;
		        case KEY.BACKSPACE:
		            setTimeout(function () { do_search(); }, 50);
		            break;
		        case KEY.TAB:
		        case KEY.ENTER:
		        case KEY.NUMPAD_ENTER:
		            setTimeout(function () { do_search(); }, 50);
		            event.stopPropagation();
		            event.preventDefault();
		            return false;
		            break;
		        case KEY.ESCAPE:
		            return true;
		        default:
		            if (String.fromCharCode(event.which)) {
			            setTimeout(function () { do_search(); }, 50);
			        }
			        break;
		        }
	    });
}

function utils_download_tsvfile(tsvContent,fileName){
	let blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
	let url = URL.createObjectURL(blob);
	let a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// a utils function to copy text to clipboard
function utils_copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise(function(resolve, reject) {
        var textarea = document.createElement("textarea");
        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            var successful = document.execCommand("copy");
            document.body.removeChild(textarea);

            if (successful) {
                resolve();
            } else {
                reject(new Error("Copy command failed"));
            }
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}

function utils_attach_reload_with_scroll_event(){
	window.addEventListener('load', () => {
		const y = sessionStorage.getItem('scrollY');
		if (y !== null) {
			window.scrollTo(0, parseInt(y, 10));
			sessionStorage.removeItem('scrollY');
		}
	});
}

function utils_reload_with_scroll(){
    sessionStorage.setItem('scrollY', window.scrollY);
    location.reload();
}

function utils_countUrls(arr) {
    let count = 0;
    arr.forEach(item => {
        if (Array.isArray(item)) {
            count += utils_countUrls(item);
        } else if (typeof item === 'object' && item !== null) {
            if (item.url) {
                count++;
            }
        }
    });

    return count;
}

function utils_run_submit(url, data, callback, callback_error){
    // Perform AJAX POST request
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            if(callback_error && utils_isFunction(callback_error)){
                callback_error();
            }
        } else {
            // Reload the page on success
            if(callback && utils_isFunction(callback)){
                callback(data);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred.' + error);
        if(callback_error && utils_isFunction(callback_error)){
            callback_error();
        }
    });
}

function utils_makeAjaxRequest(url_str, callback, callback_fail) {
	$.ajax({
		url:	  url_str,
		type:	 'GET',
		async:	true,
		dataType: 'text'
	}).done(function (data, textStatus, jqXHR) {
		if(utils_isFunction(callback)){
			callback(data);
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if(utils_isFunction(callback_fail)){
			callback_fail();
		}
	}).always(function () {
	});
}

//
// for popup gene 
//
function utils_construct_popup_content_val(key, hash, delimer) {
	if (!utils_isExistVal(key, hash)) return '';
	if (utils_isEmpty(hash[key])) return '';
	if (utils_isArray(hash[key])) {
		if (utils_isEmpty(delimer)) return hash[key].join(',');
		return hash[key].join(delimer);
	}
	return hash[key];
}

function utils_construct_popup_content(gene_id, popup_data) {
	let max_text_len = gene_id.length;
	let popup_content_type_of_gene = utils_construct_popup_content_val('type_of_gene',popup_data);
	if(utils_isEmpty(popup_content_type_of_gene)){
		return ['no data found for '+ gene_id, max_text_len];
	}
	let popup_content_ncbi_gene_url    = utils_construct_popup_content_val('ncbi_gene_url',popup_data);
	let popup_content_hgnc_gene_url    = utils_construct_popup_content_val('hgnc_gene_url',popup_data);
	let popup_content_hgnc_gene_symbol = utils_construct_popup_content_val('hgnc_gene_symbol',popup_data);
	let popup_content_synonym          = utils_construct_popup_content_val('synonym',popup_data,', ');
	let popup_content_full_name	       = utils_construct_popup_content_val('full_name',popup_data);
	let popup_content_other_full_name  = utils_construct_popup_content_val('other_full_name',popup_data,', ');
	let popup_content_summary		   = utils_construct_popup_content_val('ncbi_gene_summary',popup_data,', ');
	let popup_content_location	       = utils_construct_popup_content_val('location',popup_data);
	if(popup_content_hgnc_gene_symbol) max_text_len  = 600;
	if(max_text_len < popup_content_synonym.length)	        max_text_len = popup_content_synonym.length;
	if(max_text_len < popup_content_full_name.length)	    max_text_len = popup_content_full_name.length;
	if(max_text_len < popup_content_other_full_name.length) max_text_len = popup_content_other_full_name.length;
	if(max_text_len < popup_content_summary.length)	        max_text_len = popup_content_summary.length;
	if(max_text_len < popup_content_type_of_gene.length)	max_text_len = popup_content_type_of_gene.length;
	if(max_text_len < popup_content_location.length)		max_text_len = popup_content_location.length;

	let content =
	'<table>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">NCBI Gene ID</th>'+
		'<td><a href=\"'+popup_content_ncbi_gene_url+'\" target=\"_blank\">'+gene_id+'</a></td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">HGNC symbol</th>'+
		'<td><a href=\"'+popup_content_hgnc_gene_url+'\" target=\"_blank\">'+popup_content_hgnc_gene_symbol+'</a></td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Synonym</th>'+
		'<td>'+popup_content_synonym+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Full name</th>'+
		'<td>'+popup_content_full_name+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Other full name</th>'+
		'<td>'+popup_content_other_full_name+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Summary</th>'+
		'<td>'+popup_content_summary+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Type of gene</th>'+
		'<td>'+popup_content_type_of_gene+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Location</th>'+
		'<td>'+popup_content_location+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Link</th>'+
		'<td>'+
		  '<a href=\"http://www.hgmd.cf.ac.uk/ac/gene.php?gene='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">HGMD</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/clinvar/?term='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">ClinVar</a>'+
		  '<a href=\"https://grch38.togovar.org/?mode=simple&term='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">TogoVar</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/research/litvar2/docsum?text='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">LitVar</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/research/pubtator3/docsum?text='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">PubTator</a>'+
		  '<a href=\"https://www.dgidb.org/results?searchType=gene&searchTerms='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">DGIdb</a>'+
		'</td>'+
	  '</tr>'+
	'</table>';

	return [content, max_text_len];
}

// 
//
function utils_extract_publication(text){
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // PMID/PMCID：匹配到下一个 PMID/PMCID/DOI 或文本结束
    // DOI：只匹配连续的非空白字符
    //const regex = /(PMID|PMCID)\s*:\s*([\s\S]*?)(?=\s+(?:PMID|PMCID|DOI)\s*:|$)|DOI\s*:\s*(\S+)/gi;
	//const regex = /(PMID|PMCID)\s*:\s*([\s\S]*?)(?=\s*(?:[A-Za-z][A-Za-z0-9_]*\s*:|[;；]|$))|DOI\s*:\s*([^\s,;；]+)/gi;

	const regex = /(PMID|PMCID)\s*:\s*([\s\S]*?)(?=\s*(?:[A-Za-z][A-Za-z0-9_]*\s*:|[;；]|$))|DOI\s*:\s*(\S+)/gi;

    let html = "";
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {

        // 保留前面的普通文本
        if (match.index > lastIndex) {
            html += escapeHtml(text.substring(lastIndex, match.index));
        }

        let type;
        let values;

        if (match[1]) {
            // PMID 或 PMCID
            type = match[1].toUpperCase();

            values = match[2]
                .trim()
                .split(/\s*[,，;；]\s*|\s+/)
                .filter(Boolean);

        } else {
            // DOI
            type = "DOI";
            values = [match[3]];
        }

        html += type + ": ";

        values.forEach(function (value, index) {

            let url;

            switch (type) {
                case "PMID":
                    url = "https://pubmed.ncbi.nlm.nih.gov/" + value + "/";
                    break;

                case "PMCID":
                    url = "https://pmc.ncbi.nlm.nih.gov/articles/" + value + "/";
                    break;

                case "DOI":
                    url = "https://doi.org/" + value;
                    break;
            }

            html += '<a href="' + escapeHtml(url) +
                '" target="_blank" rel="noopener noreferrer">' +
                escapeHtml(value) +
                '</a>';

            if (index < values.length - 1) {
                html += ", ";
            }
        });

        lastIndex = regex.lastIndex;
    }

    // 保留最后剩余的普通文本
    if (lastIndex < text.length) {
        html += escapeHtml(text.substring(lastIndex));
    }

    return html;
}




//
// MODE OF INHERITANCE, ENTITY TYPE, RATING TYPE
//
var MODE_OF_INHERITANCE_HASH = {};
var ENTITY_TYPE_HASH = {};
var RATING_TYPE_HASH = {};

function utils_init_type_hash(mode_of_inheritance_arr,entity_type_arr,rating_type_arr){
	MODE_OF_INHERITANCE_HASH = mode_of_inheritance_arr.reduce((acc, item) => {
		acc[item.id] = item.name; 
		return acc;
	}, {});

	ENTITY_TYPE_HASH = entity_type_arr.reduce((acc, item) => {
		acc[item.id] = item.name;
		return acc;
	}, {});

	RATING_TYPE_HASH = rating_type_arr.reduce((acc, item) => {
		acc[item.id] = item.name;
		return acc;
	}, {});
}

function utils_moi_ids_to_names(ids){
	let idArray   = ids.split(',');
	let nameArray = idArray.map(item => MODE_OF_INHERITANCE_HASH[item]);
	return nameArray.join(", ");
}
function utils_mode_of_inheritances_ids_to_names(ids,mode_of_inheritance_arr){
	let idArray   = ids.split(',');
	let nameArray = mode_of_inheritance_arr.filter(item => idArray.includes(item.id)).map(item => item.name);
	return nameArray.join(", ")
}
function utils_mode_of_inheritances_ids_to_names_list(ids,mode_of_inheritance_arr){
	let idArray   = ids.split(',');
	return mode_of_inheritance_arr.filter(item => idArray.includes(item.id)).map(item => item.name);
}



//
// check if malformed rating definition existed in the dataset
// 
function utils_check_rating_def(rating_def){

	if(!rating_def) return RATING_NORATING;

	if( rating_def === 'No Known Disease Relationship'){
		return RATING_NOKNOWN;
	}else if(rating_def === 'Disputed Evidence'){
		return RATING_DISPUTED;
	}else{
		if(!( rating_def in RATING_ORDER_HASH)){
			return RATING_NORATING;
		}
	}
	return rating_def;
}


// count the rating by rating definition type.
// based on definitive gene data, autoreview gene date, and user review gene data.
function utils_count_rating(panel_definitive_genes, panel_autoreview_genes, panel_review_genes){
	let rating_out = {};
	for (let rating_keyword in RATING_ORDER_HASH){
		rating_out[rating_keyword] = 0;
	}
	[panel_definitive_genes, panel_autoreview_genes, panel_review_genes].forEach((arr) => {
		if(!arr) return;
		arr.forEach((obj) => {
			if('rating' in obj){
				let rating_def = obj.rating;
				if(rating_def in rating_out){
					rating_out[rating_def] = rating_out[rating_def] + 1;
				}else if(rating_def === 'No Known Disease Relationship'){
					rating_out[RATING_NOKNOWN] = rating_out[RATING_NOKNOWN]+1;
				}else if(rating_def === 'Disputed Evidence'){
					rating_out[RATING_DISPUTED]++;
				}else{
					alert('Error: unknown rating found[' + rating_def + ']');
					rating_out[RATING_NORATING] = rating_out[RATING_NORATING]+1;
				}
			}else{
				rating_out[RATING_NORATING] = rating_out[RATING_NORATING]+1;
			}
		});
	});	return rating_out;
}

//
// treeview
//

function utils_create_treeview_data_from_ontology(
    ontology_json_data, lang, is_attach_descendant_cnt, isFirstTimeLoad
){
	//"nando_id"
	//"panel_id"
	//"descendant_cnt" 
	//"panel_name_en"
	//"panel_name_ja"
	//"children"

	ontology_json_data['isFirstTimeLoad'] = isFirstTimeLoad;

	ontology_json_data['lang']			= lang;

	let name = (lang === 'ja' ) ? ontology_json_data.panel_name_ja : ontology_json_data.panel_name_en;

	if(ontology_json_data.descendant_cnt > 0){
		if(is_attach_descendant_cnt){
			ontology_json_data['displayName'] = `${name} <font class="vgp-treeview-decendant-num">(${ontology_json_data.descendant_cnt})</font>`;
		}else{
			ontology_json_data['displayName'] = name;	
		}
		ontology_json_data['isParent'] = true;
		
		if(Array.isArray(ontology_json_data['children'])){
			for (let child of ontology_json_data['children']){
				utils_create_treeview_data_from_ontology(child, lang, is_attach_descendant_cnt, isFirstTimeLoad);
			}
		}
	}else{
		ontology_json_data['displayName'] = name;
		ontology_json_data['isParent'] = false;
        ontology_json_data['isFirstTimeLoad'] = false;
		delete ontology_json_data['children']
	}
}

function utils_sort_treeview_data_by_nando_id(json_node_data){
	if(json_node_data.descendant_cnt > 0){
		if(Array.isArray(json_node_data['children'])){

			json_node_data['children'].sort((a, b) => a.nando_id.localeCompare(b.nando_id));

			for(let child of json_node_data['children']){
				utils_sort_treeview_data_by_nando_id(child);
			}
		}
	}
}

function utils_treeview_open_all_level(json_node_data){
	if(json_node_data.descendant_cnt > 0){
		if('children' in json_node_data && json_node_data.children.length > 0){
			json_node_data['open'] = true;
			for(let child of json_node_data.children){
				utils_treeview_open_all_level(child);
			}
		}
	}
}

function utils_create_treeview_descendant_data(json_arr, lang){

    let ret_arr = [];
	for (let obj of json_arr){

        obj['lang']			= lang;

    	let name = (lang === 'ja' ) ? obj.panel_name_ja : obj.panel_name_en;

    	if(obj.descendant_cnt > 0){
		   	obj['displayName'] = `${name} <font class="vgp-treeview-decendant-num">(${obj.descendant_cnt})</font>`;
		    obj['isParent'] = true;
            obj['isFirstTimeLoad'] = true;
	    }else{
		    obj['displayName'] = name;
		    obj['isParent'] = false;
            obj['isFirstTimeLoad'] = false;
	    }
		ret_arr.push(obj);
	}
	return ret_arr;
}

function utils_highlight_upstream_treeview_startNode(zTree, nodes, panel_id) {
	for (var i = 0; i < nodes.length; i++) {
	
		if (nodes[i].panel_id == panel_id) {
			zTree.selectNode(nodes[i], true, true);
		}

		// 递归处理子节点
		if (nodes[i].isParent && nodes[i].children) {
			utils_highlight_upstream_treeview_startNode(zTree, nodes[i].children, panel_id);
		}
	}
}




//
// collapse text
//

function utils_create_collapse_text_box($wrapper, text){
	let $box =$(`
<div class="collapse-text-box">
    <div class="text-content">${text}</div>
    <a href="#" class="toggle">Show more</a>
</div>
	`).appendTo($wrapper);

	utils_init_collapse_text_box($box);
}


function utils_updateTextBox($box) {

    const $text = $box.find(".text-content");
    const $btn  = $box.find(".toggle");

    if ($text.hasClass("expanded")) {
        return;
    }

    if ($text[0].scrollHeight > $text[0].clientHeight + 1) {
        $btn.show().text("Show more");
    } else {
        $btn.hide();
    }
}

function utils_init_collapse_text_box($box){
	const $text = $box.find(".text-content");
	const $btn = $box.find(".toggle");
	utils_updateTextBox($box);
	$btn.on("click", function (e) {
		e.preventDefault();
		if ($text.hasClass("expanded")) {
			$text.removeClass("expanded");
			 $box.removeClass("expanded");
			$btn.text("Show more");
			utils_updateTextBox($box);
		} else {
			$text.addClass("expanded");
			 $box.addClass("expanded");
			$btn.text("Show less");
		}
	});
}

function utils_call_update_all_collapse_text_box(){
	$(".collapse-text-box").each(function () {
		utils_updateTextBox($(this));
	});
}

function utils_attach_update_collapse_text_onresize(){
	$(window).on("resize", function () {
		utils_call_update_all_collapse_text_box();
	});
}
