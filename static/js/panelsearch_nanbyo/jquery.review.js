
function _vgp_init_inputmodal(mode_of_inheritance_arr,entity_type_arr,rating_type_arr, moi_treeview_data){

	$('<div>').attr('id',"panel_review_div").appendTo('body');

	$("#panel_review_div").panel_review({
		[$.fn.panel_review.KEY_MOI_SUGGESTION_LIST]:         mode_of_inheritance_arr,
		[$.fn.panel_review.KEY_MOI_TREEVIEW_DATA]:           moi_treeview_data,
		[$.fn.panel_review.KEY_RATING_SUGGESTION_LIST]:      rating_type_arr,
		[$.fn.panel_review.KEY_ENTITY_TYPE_SUGGESTION_LIST]: entity_type_arr
	});
}

function _vgp_init_inputmodal_gene_symbol_suggestion_review(gene_symbol_suggestion_review){
	$("#panel_review_div").panel_review(
		'init_inputmodal_gene_symbol_suggestion_review', 
		gene_symbol_suggestion_review
	);
}

function _vgp_init_inputmodal_create_add_or_edit_review_btn(
	$wrapper, isEditBtn, is_in_sortable_table, 
	panel_id, nando_id,panel_name,
	review_id,gene_id,gene_symbol,entity_name,
	entity_type_id,rating,rating_id,is_from_user
){
	let inputdata = {};
	inputdata[$.fn.panel_review.KEY_PANEL_ID]         = panel_id;
	inputdata[$.fn.panel_review.KEY_NANDO_ID]         = nando_id;
	inputdata[$.fn.panel_review.KEY_PANEL_NAME]       = panel_name;
	inputdata[$.fn.panel_review.KEY_REVIEW_ID]        = review_id;
	inputdata[$.fn.panel_review.KEY_GENE_ID]          = gene_id;
	inputdata[$.fn.panel_review.KEY_GENE_SYMBOL]      = gene_symbol;
	inputdata[$.fn.panel_review.KEY_ENTITY_NAME]      = entity_name;
	inputdata[$.fn.panel_review.KEY_ENTITY_TYPE_ID]   = entity_type_id;
	inputdata[$.fn.panel_review.KEY_IS_FROM_USER]     = is_from_user;
	inputdata[$.fn.panel_review.KEY_RATING]           = rating;
	inputdata[$.fn.panel_review.KEY_RATING_ID]        = rating_id;

	$("#panel_review_div").panel_review(
		'create_add_or_edit_review_btn', 
		$wrapper, 
		isEditBtn, 
		inputdata, 
		is_in_sortable_table
	);
}

function _vgp_inputmodal_create_add_entity_btn($wrapper,panel_id,nando_id,panel_name,skip_list) {
	let inputdata = {};
	inputdata[$.fn.panel_review.KEY_PANEL_ID]         = panel_id;
	inputdata[$.fn.panel_review.KEY_NANDO_ID]         = nando_id;
	inputdata[$.fn.panel_review.KEY_PANEL_NAME]       = panel_name;
	inputdata[$.fn.panel_review.KEY_IS_FROM_USER]     = ENUM_VAL_YES;
	inputdata[$.fn.panel_review.KEY_GENE_SKIP_LIST]   = skip_list;
	$("#panel_review_div").panel_review(
		'create_add_entity_btn', 
		$wrapper, inputdata
	);
}

function _vgp_inputmodal_attach_add_or_edit_review_btn_in_sortable_table_click_event(wrapper_class){
	$("#panel_review_div").panel_review(
		'attach_add_or_edit_review_btn_in_sortable_table_click_event', 
		wrapper_class
	);
}

function _vgp_inputmodal_create_delete_review_btn($wrapper, review, entity_type_id, comment_arr){
	$("#panel_review_div").panel_review(
		'create_delete_review_btn', 
		$wrapper, review, entity_type_id, comment_arr
	);
}
function _vgp_inputmodal_create_edit_review_btn($wrapper, review){
	$("#panel_review_div").panel_review(
		'create_edit_review_btn', 
		$wrapper, review
	);
}

function _vgp_inputmodal_create_add_review_comment_panel($wrapper,review_id,original_review_id){
	$("#panel_review_div").panel_review(
		'create_add_review_comment_panel', 
		$wrapper,review_id,original_review_id
	);
}

function _vgp_inputmodal_create_delete_review_comment_btn($wrapper,review_comment_container_id, review_comment){
	$("#panel_review_div").panel_review(
		'create_delete_review_comment_btn', 
		$wrapper,review_comment_container_id, review_comment
	);
}

function _vgp_inputmodal_create_edit_review_comment_btn($wrapper, review_comment_container_id, review_comment){
	$("#panel_review_div").panel_review(
		'create_edit_review_comment_btn', 
		$wrapper, review_comment_container_id, review_comment
	);
}

function _vgp_init_entity_definition_edit_table(
	panel_gene_definitive_arr, panel_entity_definition_arr, 
	panel_id, nando_id, panel_name,	  
	ncbi_gene_id, gene_symbol, entity_type_id, entity_name, 
	phenotype_treeview_data, is_from_user, text_source
){

	let options = {
		[$.fn.panel_review.KEY_REVIEW_ID]           : '',
		[$.fn.panel_review.KEY_RATING]              : RATING_NORATING,
		[$.fn.panel_review.KEY_RATING_ID]           : RATING_ORDER_HASH[RATING_NORATING],
		[$.fn.panel_review.KEY_PANEL_ID]            : panel_id,
		[$.fn.panel_review.KEY_PANEL_NAME]          : panel_name,
		[$.fn.panel_review.KEY_NANDO_ID]            : nando_id,
		[$.fn.panel_review.KEY_ENTITY_TYPE_ID]      : entity_type_id,
		[$.fn.panel_review.KEY_ENTITY_NAME]         : entity_name,
		[$.fn.panel_review.KEY_GENE_ID]             : ncbi_gene_id,
		[$.fn.panel_review.KEY_GENE_SYMBOL]         : gene_symbol,
		[$.fn.panel_review.KEY_IS_FROM_USER]        : is_from_user,
		[$.fn.panel_review.KEY_SOURCE]              : text_source,
		[$.fn.panel_review.KEY_PHENOTYPE]           : `${nando_id}--${panel_name}`,
		[$.fn.panel_review.KEY_PUBLICATION]         : '',
		[$.fn.panel_review.KEY_MODE_OF_INHERITANCE] : '',
			[$.fn.panel_review.KEY_COMMENT]             : '',
			[$.fn.panel_review.KEY_PHENOTYPE_TREEVIEW_DATA]: phenotype_treeview_data,
			has_current_definition: panel_entity_definition_arr && panel_entity_definition_arr.length > 0
	}

	let data_arr = 
		(panel_entity_definition_arr && panel_entity_definition_arr.length > 0) ? 
		panel_entity_definition_arr : panel_gene_definitive_arr;
	
	if(data_arr && data_arr.length > 0){
		let review = data_arr[0];

		[
			$.fn.panel_review.KEY_REVIEW_ID,
			$.fn.panel_review.KEY_IS_FROM_USER,
			$.fn.panel_review.KEY_RATING_ID,
			$.fn.panel_review.KEY_RATING,
			$.fn.panel_review.KEY_MODE_OF_INHERITANCE,
			$.fn.panel_review.KEY_SOURCE,
			$.fn.panel_review.KEY_PUBLICATION,
			$.fn.panel_review.KEY_PHENOTYPE,
			$.fn.panel_review.KEY_COMMENT
		].forEach((item) => {
			if(item in review && review[item]){
				options[item] = review[item];
			}
		});

		if(!('rating_id' in review) && ('rating' in review)){
			options[$.fn.panel_review.KEY_RATING_ID] = RATING_ORDER_HASH[review.rating];
			options[$.fn.panel_review.KEY_RATING]    = review.rating;
		}

		if('nando_en' in review || 'nando_ja' in review){
			// from definitive gene 
			options[$.fn.panel_review.KEY_PHENOTYPE] = `${review.nando_id}--${lang === 'ja' ? review.nando_ja : review.nando_en}`;
		}else if('phenotypes' in review && review['phenotypes']){
			// from curator 
			options[$.fn.panel_review.KEY_PHENOTYPE] = review.phenotypes
		}
	}

	let $wrapper = ('#vgp-panel-entity-summary-wrapper');

	$("#panel_review_div").panel_review('create_definition_edit_table', $wrapper, options);
}



;(function ($) {

	const	
		URL_PANELSEARCH_NANBYO_REGIST_REVIEW                      = "/panelsearch_nanbyo_regist_review",
		URL_PANEL_ENTITY_DETAIL                                   = '/panelsearch_nanbyo_panel_entity_detail',
		URL_GET_PANEL_UPSTREAM_HIERARCHY                          = '/panelsearch_nanbyo_get_panel_upstream_trace',
		URL_PANELSEARCH_NANBYO_DELETE_PANEL_ENTITY_REVIEW         = "/panelsearch_nanbyo_delete_panel_entity_review", 
		URL_PANELSEARCH_NANBYO_DELETE_PANEL_ENTITY_REVIEW_COMMENT = "/panelsearch_nanbyo_delete_panel_entity_review_comment",
		URL_PANELSEARCH_NANBYO_MODIFY_PANEL_ENTITY_REVIEW_COMMENT = "/panelsearch_nanbyo_modify_panel_entity_review_comment",
		URL_GENE_SYMBOL_DATA                                      = '/static/data/panelsearch_nanbyo/gene_symbol.txt',
		URL_PANELSEARCH_NANBYO_REGIST_DEFINITION                  = "/panelsearch_nanbyo_regist_entity_definition",
		URL_PANELSEARCH_NANBYO_DELETE_DEFINITION                  = "/panelsearch_nanbyo_delete_entity_definition",
		URL_ADD_REVIEW_COMMENT                                    = "/panelsearch_nanbyo_add_panel_entity_review_comment";

	const	
		SETTINGS_KEY = 'VGP_Review_Settings', OBJECT_KEY = 'VGP_Review_Object',
		KEY_LANG = 'language', LANGUAGE_EN = 'en', LANGUAGE_JA = 'ja',
		ENTITY_TYPE_ID_GENE	= 1, ENTITY_TYPE_ID_STR = 2, ENTITY_TYPE_ID_REGION = 3,

		ACTION_ADD = "add", ACTION_EDIT = "edit", ACTION_GOTO_DETAIL = "open_entity_detail_page",

		KEY_ENTITY_TYPE_SUGGESTION_LIST        = 'entity_type_suggestion_list',
		KEY_MOI_SUGGESTION_LIST                = 'mode_of_inheritance_suggestion_list',
		KEY_MOI_TREEVIEW_DATA                  = 'moi_treeview_data',
		KEY_MOI_TREEVIEW_DATA_ID               = 'id',
		KEY_MOI_TREEVIEW_DATA_NAME             = 'name',
		KEY_PHENOTYPE_TREEVIEW_DATA            = 'phenotype_treeview_data',
		KEY_PHENOTYPE_TREEVIEW_DATA_ID         = 'nando_id',
		KEY_PHENOTYPE_TREEVIEW_DATA_NAME       = 'name',
		KEY_RATING_SUGGESTION_LIST             = 'rating_suggestion_list',
		KEY_RATING                             = 'rating',
		KEY_RATING_ID			               = 'rating_id',
		KEY_PANEL_ID		  	               = 'panel_id',
		KEY_PANEL_NAME			               = 'panel_name',
		KEY_NANDO_ID                           = 'nando_id',
		KEY_REVIEW_ID			               = 'review_id',
		KEY_ENTITY_TYPE_ID		               = 'entity_type_id',
		KEY_ENTITY_NAME		                   = 'entity_name',
		KEY_IS_FROM_USER                       = 'is_from_user',
		KEY_GENE_ID			                   = 'gene_id',
		KEY_GENE_SYMBOL		                   = 'gene_symbol',
		KEY_GENE_SYMBOL_IS_STATIC              = 'gene_symbol_is_static',
		KEY_GENE_SUGGESTION_LIST               = 'gene_suggestion_list',
		KEY_GENE_SUGGESTION_LIST_REVIEW        = 'gene_suggestion_list_review',
		KEY_GENE_SUGGESTION_LIST_TOTAL         = 'gene_suggestion_list_total',
		KEY_GENE_SKIP_LIST                     = 'gene_skip_list',
		KEY_SOURCE                             = 'source',
		KEY_PHENOTYPE			               = 'phenotypes',
		KEY_PUBLICATION		                   = 'publications',		
		KEY_MODE_OF_INHERITANCE				   = 'mode_of_inheritances',
		KEY_COMMENT			                   = "comment",
		KEY_POSITION_CHROMOSOME                = "position_chromosome",
		KEY_POSITION_GRCH37_START              = "position_grch37_start",
		KEY_POSITION_GRCH37_END                = "position_grch37_end",
		KEY_POSITION_GRCH38_START              = "position_grch38_start",
		KEY_POSITION_GRCH38_END                = "position_grch38_end",
		KEY_STR_REPEATED_SEQUENCE              = "str_repeated_sequence",
		KEY_STR_NORMAL_REPEATS                 = "str_normal_repeats",
		KEY_STR_PATHOGENIC_REPEATS             = "str_pathogenic_repeats",
		KEY_REGION_HAPLOINSUFFICIENCY_SCORE    = "region_haploinsufficiency_score",
		KEY_REGION_TRIPLOSENSITIVITY_SCORE     = "region_triplosensitivity_score",
		KEY_REGION_REQUIRED_OVERLAP_PERCENTAGE = "region_required_overlap_percentage",
		KEY_REGION_VARIANT_TYPE                = "region_variant_type",
		KEY_REGION_VERBOSE_NAME                = "region_verbose_name",

		HIDDEN_INPUT_LIST = [
			{id:"input_review_panel_name",           setting_key: KEY_PANEL_NAME},
			{id:"input_review_panel_id",             setting_key: KEY_PANEL_ID},
			{id:"input_review_review_id",            setting_key: KEY_REVIEW_ID},
			{id:"input_review_rating_id",            setting_key: KEY_RATING_ID},
			{id:"input_review_entity_type_id",       setting_key: KEY_ENTITY_TYPE_ID},
			{id:"input_review_is_from_user",         setting_key: KEY_IS_FROM_USER},
			{id:"input_review_gene_symbol",          setting_key: KEY_GENE_SYMBOL},
			{id:"input_review_phenotype",            setting_key: KEY_PHENOTYPE},
			{id:"input_review_mode_of_inheritances", setting_key: KEY_MODE_OF_INHERITANCE}
		],

		INPUT_LIST =[ 
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_rating', 
				type: "dropdown", 
				label: "Rating", 
				setting_key_suggesting: KEY_RATING_SUGGESTION_LIST, 
				setting_key: KEY_RATING_ID, 
				hidden_input_id: "input_review_rating_id"
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_entity_type', 
				type: "dropdown", 
				label: "<mark>*</mark>Entity Type", 
				setting_key_suggesting: KEY_ENTITY_TYPE_SUGGESTION_LIST, 
				setting_key: KEY_ENTITY_TYPE_ID, 
				hidden_input_id: "input_review_entity_type_id",
				static: true
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_entity_name', 
				type: "text", 
				label: "<mark>*</mark>Entity Name", 
				id: 'input_review_entity_name', 
				setting_key: KEY_ENTITY_NAME
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_gene_symbol', 
				type: "gene", 
				label: "<mark>*</mark>Gene Symbol", 
				id: 'tokenInput_gene_symbol', 
				hidden_input_id: 'input_review_gene_symbol', 
				setting_key:  KEY_GENE_SYMBOL
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_phenotype', 
				type: "phenotype", 
				label: "<mark>*</mark>Phenotype", 
				id: 'tokenInput_phenotype', 
				hidden_input_id: "input_review_phenotype", 
				setting_key: KEY_PHENOTYPE
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_moi', 
				type: "moi", 
				label: "Mode Of Inheritance", 
				id: 'tokenInput_inheritance', 
				hidden_input_id: 'input_review_mode_of_inheritances', 
				setting_key: KEY_MODE_OF_INHERITANCE
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_publication', 
				type: "text", 
				label: "Publications (PMID or DOI)", 
				id: 'input_review_publications', 
				setting_key: KEY_PUBLICATION, 
				placeholder: "PMID:1234;doi:10.1186/s12911-025-02910-2"
			},
			{
				wrapper_id: 'input_subwrapper_left',  
				form_group_id: 'wrapper_input_review_comment', 
				type: "textarea", 
				label: "Comments", 
				id: 'input_review_comment', 
				setting_key: KEY_COMMENT
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_position_chromosome', 
				type: "text", 
				label: "Position Chromosome", 
				id: 'input_review_position_chromosome', 
				setting_key: KEY_POSITION_CHROMOSOME
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_position_grch37_start', 
				type: "text", 
				label: "Position GRCh37 Start", 
				id: 'input_review_position_grch37_start', 
				setting_key: KEY_POSITION_GRCH37_START
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_position_grch37_end', 
				type: "text", label: "Position GRCh37 End", 
				id: 'input_review_position_grch37_end', 
				setting_key: KEY_POSITION_GRCH37_END
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_position_grch38_start', 
				type: "text", 
				label: "Position GRCh38 Start", 
				id: 'input_review_position_grch38_start', 
				setting_key: KEY_POSITION_GRCH38_START
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_position_grch38_end', 
				type: "text", 
				label: "Position GRCh38 End", 
				id: 'input_review_position_grch38_end', 
				setting_key: KEY_POSITION_GRCH38_END
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_str_repeated_sequence', 
				type: "text", 
				label: "STR Repeated Sequence", 
				id: 'input_review_str_repeated_sequence', 
				setting_key: KEY_STR_REPEATED_SEQUENCE
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_str_normal_repeats', 
				type: "text", label: "STR Normal Repeats", 
				id: 'input_review_str_normal_repeats', 
				setting_key: KEY_STR_NORMAL_REPEATS
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_str_pathogenic_repeats', 
				type: "text", 
				label: "STR Pathogenic Repeats", 
				id: 'input_review_str_pathogenic_repeats', 
				setting_key: KEY_STR_PATHOGENIC_REPEATS
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_region_haploinsufficiency_score', 
				type: "text", 
				label: "Region Haploinsufficiency Score", 
				id: 'input_review_region_haploinsufficiency_score', 
				setting_key: KEY_REGION_HAPLOINSUFFICIENCY_SCORE
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_region_triplosensitivity_score', 
				type: "text",  
				label: "Region Triplosensitivity Score",  
				id: 'input_review_region_triplosensitivity_score', 
				setting_key: KEY_REGION_TRIPLOSENSITIVITY_SCORE
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_region_required_overlap_percentage', 
				type: "text", 
				label: "Region Required Overlap Percentage", 
				id: 'input_review_region_required_overlap_percentage', 
				setting_key: KEY_REGION_REQUIRED_OVERLAP_PERCENTAGE
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_region_variant_type', 
				type: "text", 
				label: "Region Variant Type", 
				id: 'input_review_region_variant_type', 
				setting_key: KEY_REGION_VARIANT_TYPE
			},
			{
				wrapper_id: 'input_subwrapper_right', 
				form_group_id: 'wrapper_input_review_region_verbose_name', 
				type: "text", 
				label: "Region Verbose Name", 
				id: 'input_review_region_verbose_name', 
				setting_key: KEY_REGION_VERBOSE_NAME
			}
		],

		INPUT_WRAPPPER_IDS = [
			'wrapper_input_review_rating',
			'wrapper_input_review_entity_type',
			'wrapper_input_review_gene_symbol',
			"wrapper_input_review_entity_name",
			'wrapper_input_review_phenotype',
			'wrapper_input_review_publication',
			'wrapper_input_review_moi',
			'wrapper_input_review_comment',
			"wrapper_input_review_position_chromosome",
			"wrapper_input_review_position_grch37_start",
			"wrapper_input_review_position_grch37_end",
			"wrapper_input_review_position_grch38_start",
			"wrapper_input_review_position_grch38_end",
			"wrapper_input_review_str_repeated_sequence",
			"wrapper_input_review_str_normal_repeats",
			"wrapper_input_review_str_pathogenic_repeats",
			"wrapper_input_review_region_haploinsufficiency_score",
			"wrapper_input_review_region_triplosensitivity_score",
			"wrapper_input_review_region_required_overlap_percentage",
			"wrapper_input_review_region_variant_type",
			"wrapper_input_review_region_verbose_name"
		],

		INPUT_WRAPPPER_IDS_BY_ENTITY_TYPE = {
			[ENTITY_TYPE_ID_GENE]: [
				'wrapper_input_review_rating',
				'wrapper_input_review_entity_type',
				'wrapper_input_review_gene_symbol',
				'wrapper_input_review_phenotype',
				'wrapper_input_review_publication',
				'wrapper_input_review_moi',
				'wrapper_input_review_comment'
			],
			[ENTITY_TYPE_ID_STR]:[
				'wrapper_input_review_rating',
				'wrapper_input_review_entity_type',
				'wrapper_input_review_gene_symbol',
				"wrapper_input_review_entity_name",
				'wrapper_input_review_phenotype',
				'wrapper_input_review_publication',
				'wrapper_input_review_moi',
				'wrapper_input_review_comment',
				"wrapper_input_review_position_chromosome",
				"wrapper_input_review_position_grch37_start",
				"wrapper_input_review_position_grch37_end",
				"wrapper_input_review_position_grch38_start",
				"wrapper_input_review_position_grch38_end",
				"wrapper_input_review_str_repeated_sequence",
				"wrapper_input_review_str_normal_repeats",
				"wrapper_input_review_str_pathogenic_repeats",
				"wrapper_input_review_region_haploinsufficiency_score"
			],
			[ENTITY_TYPE_ID_REGION]:[
				'wrapper_input_review_rating',
				'wrapper_input_review_entity_type',
				"wrapper_input_review_entity_name",
				'wrapper_input_review_phenotype',
				'wrapper_input_review_publication',
				'wrapper_input_review_moi',
				'wrapper_input_review_comment',
				"wrapper_input_review_position_chromosome",
				"wrapper_input_review_position_grch37_start",
				"wrapper_input_review_position_grch37_end",
				"wrapper_input_review_position_grch38_start",
				"wrapper_input_review_position_grch38_end",
				"wrapper_input_review_region_triplosensitivity_score",
				"wrapper_input_review_region_required_overlap_percentage",
				"wrapper_input_review_region_variant_type",
				"wrapper_input_review_region_verbose_name"
			]
		},
		CONFIRM_TYPE_DELETE='delete', CONFIRM_TYPE_ADD='add', CONFIRM_TYPE_DEFINITION='definition',
		CONFIRM_TYPE_DEFINITION_DELETE='definition_delete',
		CONFIRM_DIALOG_TEXT = {
			[CONFIRM_TYPE_DELETE]: {
				'label_text': 'Confirm Deletion',
				'msg_text':   'Are you sure you want to delete this dataset? This action cannot be undone.',
				'btn_text':   'Delete'
			},
			[CONFIRM_TYPE_ADD]: {
				'label_text': 'Confirm Addition',
				'msg_text':   'Are you sure you want to add this review? Please review the details carefully.',
				'btn_text':   'Add'
			},
			[CONFIRM_TYPE_DEFINITION]: {
				'label_text': 'Confirm Addition of Entity Definition',
				'msg_text':   'Are you sure you want to add this entity definition? Please review the details carefully.',
				'btn_text':   'Add Definition'
			},
			[CONFIRM_TYPE_DEFINITION_DELETE]: {
				'label_text': 'Confirm Deletion of Entity Definition',
				'msg_text':   'Are you sure you want to delete this entity definition? This action cannot be undone.',
				'btn_text':   'Delete Definition'
			}
		},
		CONFIRM_INPUT_IDS_DEFINITION = [
			{label:"*Panel",               id: "input_definition_panel_name",           type: "text" },
			{label:"*Panel ID",            id: "input_definition_panel_id",             type: "text" },
			{label:"Gene Symbol",          id: "input_definition_gene_symbol",          type: "text" },
			{label:"*Entity Type",         id: "input_definition_entity_type_id",       type: "ids", id_review: 'entity_type_id'},
			{label:"*Entity Name",         id: "input_definition_entity_name",          type: "text" },
			{label:"*Created By User",     id: "input_definition_is_from_user",         type: "text" },
			{label:"Entity Definition ID", id: "input_definition_review_id",            type: "text" },
			{label:"Rating",               id: "input_definition_rating_id",            type: "ids", id_review: 'rating_id'},
			{label:"Phenotype",            id: "input_definition_phenotype",            type: "id-name-list" },
			{label:"Publications",         id: "input_definition_publications",         type: "publications" },
			{label:"Mode of inheritance",  id: "input_definition_mode_of_inheritances", type: "ids", id_review: 'mode_of_inheritances'},
			{label:"Source",               id: "input_definition_source",               type: "text"  },
			{label:"Comments",             id: "input_definition_comment",              type: "long-text" }
		],
		CONFIRM_INPUT_IDS_BY_ENTITY_TYPE_HASH = {
			[ENTITY_TYPE_ID_GENE]: [
				{label:"Panel",					id_review: 'panel_name',			id: "input_review_panel_name",				type: "text" },
				{label:"Panel ID",              id_review: 'panel_id',              id: "input_review_panel_id",                type: "text" },                
				{label:"Review ID",				id_review: 'review_id',				id: "input_review_review_id",				type: "text" },
				{label:"Rating",				id_review: 'rating_id',				id: "input_review_rating_id",				type: "ids"  },
				{label:"*Entity Type",			id_review: 'entity_type_id',		id: "input_review_entity_type_id",			type: "ids"  },
				{label:"*Gene Symbol",			id_review: 'gene_symbol',			id: "input_review_gene_symbol",				type: "text" },
				{label:"*Created By User",      id_review: 'is_from_user',          id: "input_review_is_from_user",            type: "text" },
				{label:"Phenotype",				id_review: 'phenotypes',			id: "input_review_phenotype",				type: "id-name-list" },
				{label:"Publications",			id_review: 'publications',			id: "input_review_publications",			type: "publications" },
				{label:"Mode of inheritance",	id_review: 'mode_of_inheritances',	id: "input_review_mode_of_inheritances",	type: "ids" },
				{label:"Comments",				id_review: 'comment',				id: "input_review_comment",					type: "long-text" }
			],
			[ENTITY_TYPE_ID_STR]: [
				{label:"Panel",                     id_review: 'panel_name',            id: "input_review_panel_name",              type: "text" },
				{label:"Panel ID",                  id_review: 'panel_id',              id: "input_review_panel_id",                type: "text" },
				{label:"Review ID",                 id_review: 'review_id',             id: "input_review_review_id",               type: "text" },
				{label:"Rating",                    id_review: 'rating_id',				id: "input_review_rating_id",               type: "ids"  },
				{label:"*Entity Type",              id_review: 'entity_type_id',		id: "input_review_entity_type_id",          type: "ids"  },
				{label:"*Entity Name",              id_review: 'entity_name',			id: "input_review_entity_name",             type: "text" },
				{label:"*Created By User",          id_review: 'is_from_user',          id: "input_review_is_from_user",            type: "text" },
				{label:"*Gene Symbol",              id_review: 'gene_symbol',           id: "input_review_gene_symbol",             type: "text" },
				{label:"*Phenotype",                id_review: 'phenotypes',            id: "input_review_phenotype",               type: "id-name-list" },
				{label:"Publications (PMID or DOI)",id_review: 'publications',          id: "input_review_publications",            type: "text" },
				{label:"Mode of inheritance",       id_review: 'mode_of_inheritances',  id: "input_review_mode_of_inheritances",    type: "ids" },
				{label:"Position Chromosome",	    id_review: 'position_chromosome',	id: "input_review_position_chromosome",		type: "text" },
				{label:"Position GRCh37 Start",	    id_review: 'position_grch37_start',	id: "input_review_position_grch37_start",	type: "text" },
				{label:"Position GRCh37 End",	    id_review: 'position_grch37_end',	id: "input_review_position_grch37_end",		type: "text" },
				{label:"Position GRCh38 Start",     id_review: 'position_grch38_start',	id: "input_review_position_grch38_start",	type: "text" },
				{label:"Position GRCh38 End",       id_review: 'position_grch38_end',	id: "input_review_position_grch38_end",		type: "text" },
				{label:"STR Repeated Sequence",	    id_review: 'str_repeated_sequence',	id: "input_review_str_repeated_sequence",	type: "text" },
				{label:"STR Normal Repeats",	    id_review: 'str_normal_repeats',	id: "input_review_str_normal_repeats",		type: "text" },
				{label:"STR Pathogenic Repeats",    id_review: 'str_pathogenic_repeats',id: "input_review_str_pathogenic_repeats",	type: "text" },
				{label:"Comments",				    id_review: 'comment',				id: "input_review_comment",					type: "long-text" }
		
			],
			[ENTITY_TYPE_ID_REGION]: [
				{label:"Panel",								id_review: 'panel_name',						id: "input_review_panel_name",              			type: "text" },
				{label:"Panel ID",							id_review: 'panel_id',							id: "input_review_panel_id",	        			type: "text" },
				{label:"Review ID",             			id_review: 'review_id',             			id: "input_review_review_id",               			type: "text" },
				{label:"Rating",                			id_review: 'rating_id',             			id: "input_review_rating_id",               			type: "ids"  },
				{label:"*Entity Type",          			id_review: 'entity_type_id',        			id: "input_review_entity_type_id",          			type: "ids"  },
				{label:"*Entity Name",          			id_review: 'entity_name',           			id: "input_review_entity_name",             			type: "text" },
				{label:"*Created By User",					id_review: 'is_from_user',                      id: "input_review_is_from_user",                        type: "text" },
				{label:"*Phenotype",             			id_review: 'phenotypes',            			id: "input_review_phenotype",               			type: "id-name-list" },
				{label:"Publications (PMID or DOI)",		id_review: 'publications',          			id: "input_review_publications",            			type: "text" },
				{label:"Mode of inheritance",   			id_review: 'mode_of_inheritances',  			id: "input_review_mode_of_inheritances",    			type: "ids" },
				{label:"Position Chromosome",   			id_review: 'position_chromosome',   			id: "input_review_position_chromosome",     			type: "text" },
				{label:"Position GRCh37 Start", 			id_review: 'position_grch37_start', 			id: "input_review_position_grch37_start",   			type: "text" },
				{label:"Position GRCh37 End",   			id_review: 'position_grch37_end',   			id: "input_review_position_grch37_end",     			type: "text" },
				{label:"Position GRCh38 Start",				id_review: 'position_grch38_start', 			id: "input_review_position_grch38_start",   			type: "text" },
				{label:"Position GRCh38 End",   			id_review: 'position_grch38_end',   			id: "input_review_position_grch38_end",     			type: "text" },
				{label:"Region Haploinsufficiency Score",   id_review: 'region_haploinsufficiency_score',	id: "input_review_region_haploinsufficiency_score",		type: "text" },
				{label:"Region Triplosensitivity Score",	id_review: 'region_triplosensitivity_score',	id: "input_review_region_triplosensitivity_score",		type: "text" },
				{label:"Region Required Overlap Percentage",id_review: 'region_required_overlap_percentage',id: "input_review_region_required_overlap_percentage",	type: "text" },
				{label:"Region Variant Type",				id_review: 'region_variant_type',				id: "input_review_region_variant_type",					type: "text" },
				{label:"Region Verbose Name",				id_review: 'region_verbose_name',				id: "input_review_region_version_name",					type: "text" },
				{label:"Comments",              			id_review: 'comment', 							id: "input_review_comment",								type: "long-text" }
		
			]
		};

	var DEFAULT_SETTINGS = {
		[KEY_LANG]:							LANGUAGE_JA,
		[KEY_ENTITY_TYPE_ID]:				ENTITY_TYPE_ID_GENE,
		[KEY_RATING_ID]:					RATING_ORDER_HASH[RATING_NORATING],
		[KEY_GENE_SYMBOL_IS_STATIC]:		false,
		[KEY_MOI_SUGGESTION_LIST]:			null,
		[KEY_RATING_SUGGESTION_LIST]:		null,
		[KEY_ENTITY_TYPE_SUGGESTION_LIST]:	null,
		[KEY_MOI_TREEVIEW_DATA]:			null,
		[KEY_GENE_SUGGESTION_LIST_REVIEW]:	[],
		[KEY_GENE_SUGGESTION_LIST_TOTAL]:	[]
	};
	
	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.PanelReview(this));
			});
		},
		set_data_and_open_review_input_modal: function(input_data){
			this.data(OBJECT_KEY).set_data_and_open_review_input_modal(input_data);
			return this;
		},
		init_inputmodal_gene_symbol_suggestion_review: function(gene_suggestion_list){
			this.data(OBJECT_KEY).init_inputmodal_gene_symbol_suggestion_review(gene_suggestion_list);
			return this;
		},
		create_add_or_edit_review_btn:function($wrapper, isEditBtn, input_data, is_in_sortable_table){
			this.data(OBJECT_KEY).create_add_or_edit_review_btn($wrapper, isEditBtn, input_data, is_in_sortable_table);
			return this;
		},
		create_add_entity_btn: function($wrapper, input_data) {
			this.data(OBJECT_KEY).create_add_entity_btn($wrapper, input_data);
			return this;
		},
		attach_add_or_edit_review_btn_in_sortable_table_click_event: function(wrapper_class){
			this.data(OBJECT_KEY).attach_add_or_edit_review_btn_in_sortable_table_click_event(wrapper_class);
			return this;
		},
		create_delete_review_btn: function($wrapper, review, entity_type_id, comment_arr){
			this.data(OBJECT_KEY).create_delete_review_btn($wrapper, review, entity_type_id, comment_arr);
			return this;
		},
		create_edit_review_btn: function($wrapper, review){
			this.data(OBJECT_KEY).create_edit_review_btn($wrapper, review);
			return this;
		},
		create_delete_review_comment_btn: function($wrapper,review_comment_container_id, review_comment){
			this.data(OBJECT_KEY).create_delete_review_comment_btn($wrapper,review_comment_container_id, review_comment);
			return this;
		},
		create_add_review_comment_panel: function($wrapper, review_id, original_review_id){
			this.data(OBJECT_KEY).create_add_review_comment_panel($wrapper, review_id, original_review_id);
			return this;
		},
		create_edit_review_comment_btn: function($wrapper, review_comment_container_id, review_comment){
			this.data(OBJECT_KEY).create_edit_review_comment_btn($wrapper, review_comment_container_id, review_comment);
			return this;
		},
		create_definition_edit_table: function($wrapper, input_definition_data){
			this.data(OBJECT_KEY).create_definition_edit_table($wrapper, input_definition_data);
			return this;
		}
	};
	
	$.fn.panel_review = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};
	
	$.fn.panel_review.KEY_RATING                             = KEY_RATING;
	$.fn.panel_review.KEY_RATING_ID			                 = KEY_RATING_ID;
	$.fn.panel_review.KEY_PANEL_ID		  	                 = KEY_PANEL_ID;
	$.fn.panel_review.KEY_PANEL_NAME			             = KEY_PANEL_NAME;
	$.fn.panel_review.KEY_NANDO_ID                           = KEY_NANDO_ID;
	$.fn.panel_review.KEY_REVIEW_ID			                 = KEY_REVIEW_ID;
	$.fn.panel_review.KEY_ENTITY_TYPE_ID		             = KEY_ENTITY_TYPE_ID;
	$.fn.panel_review.KEY_ENTITY_NAME		                 = KEY_ENTITY_NAME;
	$.fn.panel_review.KEY_IS_FROM_USER                       = KEY_IS_FROM_USER;
	$.fn.panel_review.KEY_GENE_ID			                 = KEY_GENE_ID;
	$.fn.panel_review.KEY_GENE_SYMBOL		                 = KEY_GENE_SYMBOL;
	$.fn.panel_review.KEY_MOI_SUGGESTION_LIST                = KEY_MOI_SUGGESTION_LIST;
	$.fn.panel_review.KEY_MOI_TREEVIEW_DATA                  = KEY_MOI_TREEVIEW_DATA;
	$.fn.panel_review.KEY_PHENOTYPE_TREEVIEW_DATA            = KEY_PHENOTYPE_TREEVIEW_DATA;
	$.fn.panel_review.KEY_RATING_SUGGESTION_LIST             = KEY_RATING_SUGGESTION_LIST;
	$.fn.panel_review.KEY_ENTITY_TYPE_SUGGESTION_LIST        = KEY_ENTITY_TYPE_SUGGESTION_LIST;
	$.fn.panel_review.KEY_GENE_SUGGESTION_LIST               = KEY_GENE_SUGGESTION_LIST;
	$.fn.panel_review.KEY_GENE_SUGGESTION_LIST_REVIEW        = KEY_GENE_SUGGESTION_LIST_REVIEW;
	$.fn.panel_review.KEY_GENE_SUGGESTION_LIST_TOTAL         = KEY_GENE_SUGGESTION_LIST_TOTAL;
	$.fn.panel_review.KEY_GENE_SKIP_LIST                     = KEY_GENE_SKIP_LIST;
	$.fn.panel_review.KEY_SOURCE                             = KEY_SOURCE;
	$.fn.panel_review.KEY_PHENOTYPE			                 = KEY_PHENOTYPE;
	$.fn.panel_review.KEY_PUBLICATION	                     = KEY_PUBLICATION;
	$.fn.panel_review.KEY_MODE_OF_INHERITANCE		         = KEY_MODE_OF_INHERITANCE;
	$.fn.panel_review.KEY_COMMENT			                 = KEY_COMMENT;
	$.fn.panel_review.KEY_POSITION_CHROMOSOME                = KEY_POSITION_CHROMOSOME;
	$.fn.panel_review.KEY_POSITION_GRCH37_START              = KEY_POSITION_GRCH37_START;
	$.fn.panel_review.KEY_POSITION_GRCH37_END                = KEY_POSITION_GRCH37_END;
	$.fn.panel_review.KEY_POSITION_GRCH38_START              = KEY_POSITION_GRCH38_START;
	$.fn.panel_review.KEY_POSITION_GRCH38_END                = KEY_POSITION_GRCH38_END;
	$.fn.panel_review.KEY_STR_REPEATED_SEQUENCE              = KEY_STR_REPEATED_SEQUENCE;
	$.fn.panel_review.KEY_STR_NORMAL_REPEATS                 = KEY_STR_NORMAL_REPEATS;
	$.fn.panel_review.KEY_STR_PATHOGENIC_REPEATS             = KEY_STR_PATHOGENIC_REPEATS;
	$.fn.panel_review.KEY_REGION_HAPLOINSUFFICIENCY_SCORE    = KEY_REGION_HAPLOINSUFFICIENCY_SCORE;
	$.fn.panel_review.KEY_REGION_TRIPLOSENSITIVITY_SCORE     = KEY_REGION_TRIPLOSENSITIVITY_SCORE;
	$.fn.panel_review.KEY_REGION_REQUIRED_OVERLAP_PERCENTAGE = KEY_REGION_REQUIRED_OVERLAP_PERCENTAGE;
	$.fn.panel_review.KEY_REGION_VARIANT_TYPE                = KEY_REGION_VARIANT_TYPE;
	$.fn.panel_review.KEY_REGION_VERBOSE_NAME                = KEY_REGION_VERBOSE_NAME;


	$.PanelReview = function (root_panel) {

		const $root_panel = $(root_panel);
		const settings = $root_panel.data(SETTINGS_KEY);	

		const entity_type_hash = {};
		settings[KEY_ENTITY_TYPE_SUGGESTION_LIST].map(suggestion_item =>{
			entity_type_hash[suggestion_item[$.fn.token_typeahaed.KEY_ID]] = suggestion_item[$.fn.token_typeahaed.KEY_NAME];
		});

		const mode_of_inheritance_hash = {};
		settings[KEY_MOI_SUGGESTION_LIST].map(suggestion_item =>{
			mode_of_inheritance_hash[suggestion_item[$.fn.token_typeahaed.KEY_ID]] = suggestion_item[$.fn.token_typeahaed.KEY_NAME];
		});

		const rating_hash = {};
		settings[KEY_RATING_SUGGESTION_LIST].map(suggestion_item =>{
			rating_hash[suggestion_item[$.fn.token_typeahaed.KEY_ID]] = suggestion_item[$.fn.token_typeahaed.KEY_NAME];
		});

		// construct ui
		// ui: resizer
		$('<div>').attr('id','panel_review_div_resizer').appendTo($root_panel);

		// ui: titile
		let $panel_review_titleDiv = $('<div>').attr('id','panel_review_titleDiv').appendTo($root_panel);
		let $panel_review_titleDiv_letter = $("<div>")
			.attr('id', "panel_review_title_text")
			.addClass('title')
			.text('ADD REVIEW')
			.appendTo($panel_review_titleDiv);
		$(`<span class="material-symbols-outlined">add</span>`).prependTo($panel_review_titleDiv_letter);
		let $panel_review_titleDiv_ctl = $("<div>").addClass('buttons').appendTo($panel_review_titleDiv);
		$('<span>').attr('id', 'minimizeBtn').addClass("material-symbols-outlined").text('keyboard_double_arrow_down')
			.data('root_panel_id', root_panel.id)
			.click(function(){
				let root_panel_id = $(this).data('root_panel_id');
				let panel_review_div = document.getElementById(root_panel_id);
				
				if (panel_review_div.classList.contains('minimized')) {
					panel_review_div.classList.remove('minimized');
					$(this).text('keyboard_double_arrow_down');
					review_modal_adjustHeight();
				} else {
					panel_review_div.classList.add('minimized');
					$(this).text('keyboard_double_arrow_up');
				}
			})
			.appendTo($panel_review_titleDiv_ctl);
		$('<span>').attr('id', 'closeBtn').addClass("material-symbols-outlined").text('close')
			.data('root_panel_id', root_panel.id)
			.click(function(){
				let root_panel_id = $(this).data('root_panel_id');
				let panel_review_div = document.getElementById(root_panel_id);
				panel_review_div.style.display = 'none';
			})
			.appendTo($panel_review_titleDiv_ctl);
		
		// ui: input form
		let $panel_review_formContainer = $('<div>').attr('id',"panel_review_formContainer").appendTo($root_panel);
		let $panel_review_form = $('<form>').attr('id',"panel_review_form").appendTo($panel_review_formContainer);
		let $panel_review_form_input_wrapper = $('<div>').attr('id', 'panel_review_form_input_wrapper').addClass("d-flex justify-content-between").appendTo($panel_review_form);
		for(let hidden_input_item of HIDDEN_INPUT_LIST){
			$('<input>').attr('type','hidden').attr('id',hidden_input_item.id).attr('name',hidden_input_item.id).appendTo(panel_review_form_input_wrapper);
		}

		$('<div>').attr('id', 'input_subwrapper_left').addClass("input_subwrapper left").appendTo($panel_review_form_input_wrapper);
		$('<div>').attr('id', 'input_subwrapper_right').addClass("input_subwrapper right").appendTo($panel_review_form_input_wrapper);


		for(let input_item of INPUT_LIST){
			let $wrapper = $('#' + input_item.wrapper_id);// input_subwrapper_left or input_subwrapper_right

			let $form_group = $('<div>').attr('id', input_item.form_group_id).addClass('form-group').appendTo($wrapper);
			
			$(`<label>${input_item.label}</label>`).appendTo($form_group);

			if(input_item.type === 'dropdown'){

				let container_id = _construct_container_id(input_item.hidden_input_id);	
				let $dropdown_wrapper = $('<div>').attr('id',container_id).appendTo($form_group);

				let isRating = (input_item.hidden_input_id === 'input_review_rating_id');
				$("#"+container_id).token_type_dropdown({
					[$.fn.token_type_dropdown.KEY_SUGGESTIONS]:  settings[input_item.setting_key_suggesting],
					[$.fn.token_type_dropdown.KEY_HIDDENINPUT]:  input_item.hidden_input_id,
					[$.fn.token_type_dropdown.KEY_ISSTATIC]:     isRating ? false : true,
					[$.fn.token_type_dropdown.KEY_ONCHANGE]:     isRating ? null : _on_modify_entity_type
				});

			}else if(input_item.type === 'text'){
				$('<input>').attr('type','text').addClass('form-control').attr('placeholder', ('placeholder' in input_item) ? input_item.placeholder : '')
							.attr('id',input_item.id).attr('name',input_item.id).appendTo($form_group);
			}else if(input_item.type === 'textarea'){
				$('<textarea>').addClass('form-control').attr('id', input_item.id).attr('name',input_item.id).attr('rows','5').appendTo($form_group);
			}else if(input_item.type === 'gene'){
				
				$('<div>').attr('id', input_item.id).addClass('token-input-container').appendTo($form_group);

				let suggestion_list = settings[KEY_GENE_SUGGESTION_LIST] ? settings[KEY_GENE_SUGGESTION_LIST] : [];
				$("#"+input_item.id).token_typeahaed({
					[$.fn.token_typeahaed.KEY_SUGGESTIONS]:    suggestion_list,
					[$.fn.token_typeahaed.KEY_LIMIT]:          1,
					[$.fn.token_typeahaed.KEY_ISSTATIC]:       true,
					[$.fn.token_typeahaed.KEY_ISOUTPUTWITHID]: true,
					[$.fn.token_typeahaed.KEY_PLACEHOLDER]:    "Input Gene Symbol...",
					[$.fn.token_typeahaed.KEY_HIDDENINPUT]:    "#" + input_item.hidden_input_id,
					[$.fn.token_typeahaed.KEY_ONCHANGE]:       function(){	review_modal_adjustHeight(); }
				});

			}else if(input_item.type === 'moi'){

				$('<div>').attr('id', input_item.id).addClass('token-input-container').appendTo($form_group);
				$("#"+input_item.id).token_dropdown_treeview({
					[$.fn.token_dropdown_treeview.KEY_TYPE]:             $.fn.token_dropdown_treeview.TYPE_CHECKBOX,
					[$.fn.token_dropdown_treeview.KEY_OUTPUT_TYPE]:      $.fn.token_dropdown_treeview.OUTPUT_TYPE_ID,
					[$.fn.token_dropdown_treeview.KEY_TREEVIEW_DATA]:    settings[KEY_MOI_TREEVIEW_DATA],
					[$.fn.token_dropdown_treeview.KEY_DATA_ID]:          KEY_MOI_TREEVIEW_DATA_ID,
					[$.fn.token_dropdown_treeview.KEY_DATA_NAME]:        KEY_MOI_TREEVIEW_DATA_NAME,
					[$.fn.token_dropdown_treeview.KEY_PLACEHOLDER]:      'Select mode of inheritance ...',
					[$.fn.token_dropdown_treeview.KEY_HIDDENINPUT_ID]:   input_item.hidden_input_id
				});
			}else if(input_item.type === 'phenotype'){
				$('<div>').attr('id', input_item.id).addClass('token-input-container').appendTo($form_group);
				$("#"+input_item.id).token_typeahaed({
					[$.fn.token_typeahaed.KEY_SUGGESTIONS]:    [],
					[$.fn.token_typeahaed.KEY_LIMIT]:          1,
					[$.fn.token_typeahaed.KEY_ISSTATIC]:       true,
					[$.fn.token_typeahaed.KEY_ISOUTPUTWITHID]: true,
					[$.fn.token_typeahaed.KEY_DELIMAR_I]:      '--',
					[$.fn.token_typeahaed.KEY_HIDDENINPUT]:    "#" + input_item.hidden_input_id
				});
			}
		}

		function _construct_container_id(hidden_input_id){
			return `dropdown_wrapper_${hidden_input_id}`;
		}

		function _set_mode_of_inheritances(target_id, id_list_str){
			if(!id_list_str){
				//$("#tokenInput_inheritance").token_dropdown_treeview('resetTokens', []);
				$("#"+target_id).token_dropdown_treeview('resetTokens', []);
				return;
			}
			
			let token_list = [];
			if(id_list_str){
				let id_list = id_list_str.split(',');
				for(let id of id_list){
					token_list.push({[KEY_MOI_TREEVIEW_DATA_ID]:id,[KEY_MOI_TREEVIEW_DATA_NAME]:mode_of_inheritance_hash[id]});
				}
			}
			//$("#tokenInput_inheritance").token_dropdown_treeview('resetTokens', token_list);
			$("#"+target_id).token_dropdown_treeview('resetTokens', token_list);
		}

		function _on_modify_entity_type(entity_type_id){

			INPUT_WRAPPPER_IDS.forEach(iid => {
				let input_wrapper = document.getElementById(iid);
				input_wrapper.classList.add('hidden');
			});
		
			INPUT_WRAPPPER_IDS_BY_ENTITY_TYPE[entity_type_id].forEach(iid => {
				let input_wrapper = document.getElementById(iid);
				input_wrapper.classList.remove('hidden');
			});
		

			Object.values(entity_type_hash).map(entity_type => {
				$('#panel_review_form_input_wrapper').removeClass(entity_type);
			});
			$('#panel_review_form_input_wrapper').addClass(entity_type_hash[entity_type_id]);
		
			review_modal_adjustHeight();
		}

		function _get_panel_name_from_treeview_data(treeview_data,nando_id){
			for (let i = 0; i < treeview_data.length; i++) {
				if (treeview_data[i].nando_id === nando_id) {
					return treeview_data[i].name;
				}

				if (treeview_data[i].isParent && treeview_data[i].children) {
					let ret = _get_panel_name_from_treeview_data(treeview_data[i].children,nando_id);
					if(ret) return ret;
				}
			}
			return '';
		}
		function _find_node_in_treeview_data(treeview_data,nando_id){
			for (let i = 0; i < treeview_data.length; i++) {
				if (treeview_data[i].nando_id === nando_id) {
					return [treeview_data[i]];
				}
				if (treeview_data[i].isParent && treeview_data[i].children) {
					let ret_arr = _find_node_in_treeview_data(treeview_data[i].children,nando_id);
					if(ret_arr.length > 0) return ret_arr;
				}
			}
			return [];
		}

		function _init_inputmodal_gene_symbol_suggestion_review(gene_suggestion_list_review){
			settings[KEY_GENE_SUGGESTION_LIST_REVIEW] = gene_suggestion_list_review;
			$("#tokenInput_gene_symbol").token_typeahaed('resetSuggestions',gene_suggestion_list_review);
		}

		function _set_phenotypes(target_id,id_name_list_str){
            if(!id_name_list_str){
                $("#"+target_id).treeview_input('resetTokens', []);
                return;
            }
            let token_list = [];
            if(id_name_list_str){
                let id_name_list = id_name_list_str.split('|');
                for(let id_name of id_name_list){
					let tmp = id_name.split('--');
					token_list.push({[$.fn.token_typeahaed.KEY_ID]:tmp[0],[$.fn.token_typeahaed.KEY_NAME]:tmp[1]});
                }
            }
			$("#"+target_id).token_typeahaed('resetTokens', token_list);
		}
		
		// attach confirm dialog
		$(`
		<div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="confirmationModalLabel">Confirm Deletion</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<p id="confirmationModalMessage">Are you sure you want to delete this review?</p>
						<ul class="list-group" id="confirmationModal-list-group">
						</ul>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-danger" id="btnConfirmAction">Delete</button>
					</div>
				</div>
			</div>
		</div>
			`).appendTo('body');


		function _vgp_panel_review_show_confirm_dialog(confirm_type, entity_type_id, review_data){

			let label_text = CONFIRM_DIALOG_TEXT[confirm_type].label_text;
			$('#confirmationModalLabel').text(label_text);
		
			let msg_text = CONFIRM_DIALOG_TEXT[confirm_type].msg_text;
			$('#confirmationModalMessage').text(msg_text);
		
			let btn_text = CONFIRM_DIALOG_TEXT[confirm_type].btn_text;
			$('#btnConfirmAction')
				.text(btn_text)
				.data("action_type", confirm_type)
				.data('review_data', review_data)
				.removeClass('btn-primary')
				.removeClass('btn-danger')
				.addClass([CONFIRM_TYPE_DELETE, CONFIRM_TYPE_DEFINITION_DELETE].includes(confirm_type) ? 'btn-danger' : 'btn-primary');
		
			let $wrapper = $('#confirmationModal-list-group');
			$wrapper.empty();
		
			let confirm_item_arr = 
				[CONFIRM_TYPE_DEFINITION, CONFIRM_TYPE_DEFINITION_DELETE].includes(confirm_type) ?
				CONFIRM_INPUT_IDS_DEFINITION : 
				CONFIRM_INPUT_IDS_BY_ENTITY_TYPE_HASH[entity_type_id];
		
			for(let confirm_item of confirm_item_arr){
		
				let val = 
					confirm_type === CONFIRM_TYPE_DELETE ? 
					review_data[confirm_item.id_review] : 
					$('#'+confirm_item.id).val();

				val =  val === undefined ?  '' : "" + val;
		
				if(confirm_item.id_review === 'review_id' && !val)	continue;

				let text = ''
				if (confirm_item.id_review === 'gene_symbol'){
					if([CONFIRM_TYPE_DELETE, CONFIRM_TYPE_DEFINITION, CONFIRM_TYPE_DEFINITION_DELETE].includes(confirm_type)){
						// delete from review_data
						text = val;
					}else{
						// add from inputmodal
						let t1 = val.split('|');
						let t2 = [];
						for(let pair of t1){
							let t3 = pair.split(',');
							t2.push(t3[1]);
						}
						text = t2.join(', ');
					}
				}else if(confirm_item.type === "text"){
					text =  val
				}else if(confirm_item.type === "publications"){
					text = utils_extract_publication(val);
				}else if(confirm_item.type === "ids"){
					if(val && val.length > 0){
						if(confirm_item.id_review === 'rating_id'){
							text = val.split(",").map(id => rating_hash[id]).join(', ');
						}else if(confirm_item.id_review === 'entity_type_id'){
							text = val.split(",").map(id => entity_type_hash[id]).join(', ');
						}else if(confirm_item.id_review === 'mode_of_inheritances'){
							text = val.split(",").map(id => mode_of_inheritance_hash[id]).join(', ');
						}
					}
				}else if(confirm_item.type === "id-name-list"){
					if(val && val.length > 0){ 
						text = val.split('|').map(id_name => {
							let t = id_name.split('--');
							return t[1];
						}).join(', ');
					}
				}else if(confirm_item.type === "long-text"){
					val = $('<div>').text(val).html();
					if(val.length < 50 ){
						text = val;
					}else{
		
						val = val.replace(/\n/g, "<br>");
						let html_str = `
							<li class="list-group-item">
								<strong>${confirm_item.label}:</strong>
								<p id="commentPreview" class="text-truncate" style="max-height: 5rem; overflow: hidden;">${val}</p>
								<a href="#" id="expandComment" class="d-block mt-2">Show More</a>
							</li>
						`;
						$(html_str).appendTo($wrapper);
		
						const expandLink = document.getElementById('expandComment');
						const commentPreview = document.getElementById('commentPreview');
						expandLink.addEventListener('click', function (event) {
							event.preventDefault();
							if (expandLink.textContent === 'Show More') {
								commentPreview.classList.remove('text-truncate');
								commentPreview.style.maxHeight = 'none';
								expandLink.textContent = 'Show Less';
							} else {
								commentPreview.classList.add('text-truncate');
								commentPreview.style.maxHeight = '5rem';
								expandLink.textContent = 'Show More';
							}
						});
						continue;
					}
					
				}
		
				let html_str = `<li class="list-group-item d-flex flex-row">
									<span class="font-weight-bold list-group-item-title" style="min-width:170px;">${confirm_item.label}</span>
									<span>${text}</span>
								</li>`;
				$(html_str).appendTo($wrapper);
			
			}
		
			$('#confirmationModal').modal('show');
		}
			
		document.getElementById('btnConfirmAction').addEventListener('click', function() {

			let $btn = $(this);
			$btn.prop('disabled', true);
			let action_type = $btn.data("action_type");
			let review_data = $btn.data("review_data");
			
			if(action_type === CONFIRM_TYPE_DELETE){
				let review_data = $btn.data("review_data");
				_vgp_show_loading();
				utils_run_submit(URL_PANELSEARCH_NANBYO_DELETE_PANEL_ENTITY_REVIEW,review_data, function(){
					location.reload();
				}, function(){
					_vgp_hide_loading();
					$btn.prop('disabled', false);
				});
			}else if(action_type === CONFIRM_TYPE_ADD){
				let form = document.getElementById('panel_review_form');
				let formData = new FormData(form);
				const data = {};
				formData.forEach((value, key) => {
					data[key] = value;
				});
				_vgp_show_loading();
				utils_run_submit(URL_PANELSEARCH_NANBYO_REGIST_REVIEW,data, function(){
					location.reload();
				}, function(){
					_vgp_hide_loading();
					$btn.prop('disabled', false);
				});			
			}else if(action_type === CONFIRM_TYPE_DEFINITION_DELETE){
				_vgp_show_loading();
				utils_run_submit(URL_PANELSEARCH_NANBYO_DELETE_DEFINITION,
					{entity_id: $('#input_definition_review_id').val()}, function(){
						location.reload();
					}, function(){
						_vgp_hide_loading();
						$btn.prop('disabled', false);
					});
			}else if(action_type === CONFIRM_TYPE_DEFINITION){
				let form = document.getElementById('panel_entity_definition_form');
				let formData = new FormData(form);
				const data = {};
				formData.forEach((value, key) => {
					data[key] = value;
				});
				_vgp_show_loading();
				utils_run_submit(
					URL_PANELSEARCH_NANBYO_REGIST_DEFINITION,
					data, 
					function(){
						location.reload();
					}, function(){
						_vgp_hide_loading();
						$btn.prop('disabled', false);
					}
				);
			}
		});
	
		let $panel_review_form_submit_wrapper = $('<div>').attr('id','panel_review_form_submit_wrapper').appendTo($panel_review_form);
		$('<button>').attr('type','button').attr('id',"btn_vgp_review_submit").text('Submit')
			.click(function(){
				let entity_type_id = $('#input_review_entity_type_id').val();
				let gene_symbol = $('#input_review_gene_symbol').val();
				let phenotype   = $('#input_review_phenotype').val();
				// do validation
				if(entity_type_id == ENTITY_TYPE_ID_GENE){
					if(!gene_symbol){
						alert("Please input gene!");
						$('#tokenInput_gene_symbol').find('input').focus();
						return;
					}
					if(!phenotype){
						alert("Please input phenotype!");
						$('#tokenInput_phenotype').find('input').focus();
						return;
					}
				}else if(entity_type_id == ENTITY_TYPE_ID_STR){
					if(!gene_symbol){
						alert("Please input gene!");
						$('#tokenInput_gene_symbol').find('input').focus();
						return;
					}
		
					let entity_name = $('#input_review_entity_name').val();
					if(!entity_name){
						alert("please input the name of entity!");
						$('#input_review_entity_name').focus();
						return;
					}
				}else if(entity_type_id == ENTITY_TYPE_ID_REGION	){
					let entity_name = $('#input_review_entity_name').val();
					if(!entity_name){
						alert("please input the name of entity!");
						$('#input_review_entity_name').focus();
						return;
					}
				}
				_vgp_panel_review_show_confirm_dialog(CONFIRM_TYPE_ADD, entity_type_id, null);
			})
			.appendTo($panel_review_form_submit_wrapper);


		// attach width resizer event
		const panel_review_div           = document.getElementById('panel_review_div');
		const panel_review_formContainer = document.getElementById('panel_review_formContainer');
		const panel_review_div_resizer   = document.getElementById('panel_review_div_resizer');
		
		let inputmodal_isResizing = false;
		let inputmodal_minWidth = 400;
		let inputmodal_startX = 0;
		let inputmodal_startWidth = 0;
		
		panel_review_div_resizer.addEventListener('mousedown', (e) => {

			inputmodal_isResizing = true;
			inputmodal_startX     = e.clientX;
			inputmodal_startWidth = panel_review_div.offsetWidth;
	
			document.body.style.cursor = 'ew-resize';
	
			const mouseMoveHandler = (e) => {
				if (!inputmodal_isResizing) return;
	
				const newWidth = inputmodal_startWidth - (e.clientX - inputmodal_startX);
				if (newWidth >= inputmodal_minWidth) {
					panel_review_div.style.width = `${newWidth}px`;	
				}
			};
	
			const mouseUpHandler = () => {
				inputmodal_isResizing = false;
				document.removeEventListener('mousemove', mouseMoveHandler);
				document.removeEventListener('mouseup', mouseUpHandler);
				document.body.style.cursor = '';
			};
	
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
		});
	



		function review_modal_adjustHeight() {
			const dbcls_common_header = document.getElementById("dbcls-common-header");
			const dbcls_common_header_height = dbcls_common_header ? dbcls_common_header.offsetHeight : 0;
			const windowHeight = window.innerHeight - dbcls_common_header_height;
			const titleHeight = document.getElementById('panel_review_titleDiv').offsetHeight;
			panel_review_div.style.maxHeight = `${windowHeight}px`;
			panel_review_formContainer.style.maxHeight = `${windowHeight - titleHeight}px`;
		}

		$(window).on('resize', function(e) {
			review_modal_adjustHeight();
		});

        // set initial entity type
        _on_modify_entity_type(settings[KEY_ENTITY_TYPE_ID]);

		function _show_review_input_modal(){
			panel_review_div.style.display = 'flex';
			review_modal_adjustHeight();

			if($('#minimizeBtn').text() === 'keyboard_double_arrow_up'){
				$('#minimizeBtn').trigger('click');
			}
		}
		

		function _set_data_and_open_review_input_modal(input_data){

			if(input_data[KEY_REVIEW_ID]){
				let $t = $('#panel_review_title_text').empty().text('EDIT REVIEW');
		        $(`<span class="material-symbols-outlined">edit</span>`).prependTo($t);
			}else{
				let $t = $('#panel_review_title_text').empty().text('ADD REVIEW');
				$(`<span class="material-symbols-outlined">add</span>`).prependTo($t);
			}

			let skip_id_arr = ["input_review_entity_type_id", "input_review_rating_id","input_review_gene_symbol","input_review_phenotype","input_review_mode_of_inheritances"];
			for(let input_item of HIDDEN_INPUT_LIST){
				if(skip_id_arr.includes(input_item.id)) continue;
				$('#'+input_item.id).val(input_item.setting_key in input_data ? input_data[input_item.setting_key] : '');
			}
	
			for(let input_item of INPUT_LIST){

				if(input_item.type === 'dropdown'){
					let container_id = _construct_container_id(input_item.hidden_input_id); 
					let value_id = '';
					if(input_item.hidden_input_id === 'input_review_entity_type_id'){
						value_id = input_item.setting_key in input_data ? input_data[input_item.setting_key] : '';
						if(!value_id) value_id = ENTITY_TYPE_ID_GENE;
					}else{
						value_id = input_item.setting_key in input_data ? input_data[input_item.setting_key] : '';
						if(!value_id) value_id = RATING_ORDER_HASH[RATING_NORATING];
					}
					$("#"+container_id).token_type_dropdown('resetToken',value_id);

				}else if(input_item.type === 'gene'){

					if(KEY_GENE_ID in input_data && KEY_GENE_SYMBOL in input_data && 
						input_data[KEY_GENE_ID] && input_data[KEY_GENE_SYMBOL]
					){
						let gene_id = input_data[KEY_GENE_ID];
						let gene_symbol = input_data[KEY_GENE_SYMBOL]
						$("#tokenInput_gene_symbol").token_typeahaed('resetTokens',[
							{[$.fn.token_typeahaed.KEY_ID]: gene_id, [$.fn.token_typeahaed.KEY_NAME]:gene_symbol}
						]);
					}else{
						$("#tokenInput_gene_symbol").token_typeahaed('resetTokens', []);
					}
				}else if(input_item.type === 'phenotype'){
					let value = input_item.setting_key in input_data ? input_data[input_item.setting_key] : '';
					if(!value){
						value = `${input_data[KEY_PHENOTYPE_TREEVIEW_DATA_ID]}--${input_data[KEY_PANEL_NAME]}`;
					}	
					_set_phenotypes(input_item.id,value);
				}else if(input_item.type === 'moi'){
					let value = input_item.setting_key in input_data ? input_data[input_item.setting_key] : '';								
					_set_mode_of_inheritances(input_item.id, value);
				}else if(input_item.type === 'text' || input_item.type === 'textarea'){
					$('#'+input_item.id).val(input_item.setting_key in input_data ? input_data[input_item.setting_key] : '');
				}
			}
			_show_review_input_modal();
		}

		// 
		const BTN_INPUT_KEY_LIST = [
			KEY_PANEL_ID,
			KEY_NANDO_ID,
			KEY_PANEL_NAME,
			KEY_REVIEW_ID,
			KEY_GENE_ID,
			KEY_GENE_SYMBOL,
			KEY_ENTITY_NAME,
			KEY_ENTITY_TYPE_ID,
			KEY_IS_FROM_USER,
			KEY_RATING,
			KEY_RATING_ID
		];

	
		function _set_gene_symbol_total_list_and_open_modal(btn){
			
			let $btn = $(btn);
		
			let skip_gene_list = $btn.data(KEY_GENE_SKIP_LIST);

			let input_data = {};
			BTN_INPUT_KEY_LIST.map(key => {if($btn.data(key)) input_data[key] = $btn.data(key);});

			if(settings[KEY_GENE_SUGGESTION_LIST_TOTAL] && settings[KEY_GENE_SUGGESTION_LIST_TOTAL].length > 0){
				$("#tokenInput_gene_symbol").token_typeahaed('resetStatic', false);
				$("#tokenInput_gene_symbol").token_typeahaed('resetSuggestions',settings[KEY_GENE_SUGGESTION_LIST_TOTAL]);
				$("#tokenInput_gene_symbol").token_typeahaed('resetTokens',[]);
				_set_data_and_open_review_input_modal(input_data);
				return;
			}

			_vgp_show_loading();
			$.ajax({
				url: URL_GENE_SYMBOL_DATA,
				type: 'GET',
				success: function(data) {
					suggestions_entity = data.split('\n')
											.filter(item => item.trim() !== '')
											.filter(item => {
												let [gene_id, gene_symbol] = item.split('\t');
												return !skip_gene_list.includes(gene_symbol);
											})
											.map(item => {
												let [id, name] = item.split('\t');
												return {[$.fn.token_typeahaed.KEY_ID]: id, [$.fn.token_typeahaed.KEY_NAME]: name };
											});
					$("#tokenInput_gene_symbol").token_typeahaed('resetStatic', false);
					$("#tokenInput_gene_symbol").token_typeahaed('resetSuggestions', suggestions_entity);
					$("#tokenInput_gene_symbol").token_typeahaed('resetTokens',[]);
					_set_data_and_open_review_input_modal(input_data);
					_vgp_hide_loading();
					
				},
				error: function(xhr, status, error) {
					_vgp_hide_loading();
					console.error('Failed to fetch the total gene symbol list TSV file:', status, error);
					alert('An unexpected error occurred.' + error);
				}
			});
		}

		function _create_add_entity_btn($wrapper, input_data){
			let html_str = BTN_INPUT_KEY_LIST.map(key =>`data-${key}="${input_data[key] ? input_data[key] : ''}"`).join(' ');
			html_str = `<span class="vgp-review-btn" ${html_str}>
							<span class="material-symbols-outlined">add_2</span>
							ADD ENTITY
						</span>
						`;
			$(html_str)
				.data(KEY_GENE_SKIP_LIST, input_data[KEY_GENE_SKIP_LIST])
				.click(function(){_set_gene_symbol_total_list_and_open_modal(this);})
				.appendTo($wrapper);
		}
		

		function _create_add_or_edit_review_btn($wrapper, isEditBtn, input_data, is_in_sortable_table){

			if(is_in_sortable_table){
				if(isEditBtn){

					let html_str = BTN_INPUT_KEY_LIST.map(key =>`data-${key}="${input_data[key] ? input_data[key] : ''}"`).join(' ');
					if(input_data['review_id']){
						html_str += `&original_review_id=${input_data['review_id']}`;
					}
					html_str = `
						<span class="vgp-review-btn vgp-edit-review-btn right" ${html_str}>
							<span class="material-symbols-outlined">edit</span>
							EDIT REVIEW
						</span>
					`;
					$(html_str).appendTo($wrapper);

					// add additional review
					input_data[KEY_REVIEW_ID] = '';
					let html_str_add = BTN_INPUT_KEY_LIST.map(key =>`data-${key}="${input_data[key] ? input_data[key] : ''}"`).join(' ');
                    html_str_add = `
                        <span class="vgp-review-btn vgp-add-review-btn left" ${html_str_add}>
                            <span class="material-symbols-outlined">add_2</span>
                            ADD REVIEW
                        </span>
                    `;					
					$(html_str_add).prependTo($wrapper);

				}else{
					let html_str = BTN_INPUT_KEY_LIST.map(key =>`data-${key}="${input_data[key] ? input_data[key] : ''}"`).join(' ');
					html_str = `
						<span class="vgp-review-btn vgp-add-review-btn" ${html_str}>
							<span class="material-symbols-outlined">add_2</span>
							ADD REVIEW
						</span>
					`;
					$(html_str).appendTo($wrapper);
				}
			}else{

				let html_str = BTN_INPUT_KEY_LIST.map(key =>`data-${key}="${input_data[key] ? input_data[key] : ''}"`).join(' ');
				html_str = `
					<span class="vgp-review-btn ${isEditBtn ? 'vgp-edit-review-btn' : 'vgp-add-review-btn'}" ${html_str}>
						<span class="material-symbols-outlined">${isEditBtn ? 'edit': 'add_2'}</span>	
        	            ${isEditBtn ? 'EDIT REVIEW' : 'ADD REVIEW'}
					</span>
				`;
				$(html_str).click(function(){
					_add_review_btn_click_event(this);
				}).appendTo($wrapper);
			}
		}

		function _add_review_btn_click_event(btn){
			let $btn = $(btn);
			let input_data = {};
			BTN_INPUT_KEY_LIST.map(key => {if($btn.data(key)) input_data[key] = $btn.data(key);});
			$("#tokenInput_gene_symbol").token_typeahaed('resetStatic', true);
			$("#tokenInput_gene_symbol").token_typeahaed('resetSuggestions',settings[KEY_GENE_SUGGESTION_LIST_REVIEW]);
			_set_data_and_open_review_input_modal(input_data);
		}


		function _attach_add_or_edit_review_btn_in_sortable_table_click_event(wrapper_class){
			$(wrapper_class).on('click', 'span.vgp-add-review-btn', function(){
				_add_review_btn_click_event(this);
			});

			$(wrapper_class).on('click', 'span.vgp-edit-review-btn', function(){
				let $btn = $(this);
				let urlstr = BTN_INPUT_KEY_LIST.map(key =>`${$btn.data(key) ? key+'='+encodeURIComponent($btn.data(key)) : key + '='}` ).join('&') + "&lang="+lang+"&original_review_id="+$btn.data('review_id');
				urlstr = URL_PANEL_ENTITY_DETAIL + "?" + urlstr;
				window.open(urlstr, "_blank");
			});
		}
		
		const delete_btn_html_str = `
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="20" cy="20" r="19.5" fill="white" stroke="#D2D2D2"/>
				<path d="M15 29C14.45 29 13.9792 28.8042 13.5875 28.4125C13.1958 28.0208 13 27.55 13 27V14H12V12H17V11H23V12H28V14H27V27C27 27.55 26.8042 28.0208 26.4125 28.4125C26.0208 28.8042 25.55 29 25 29H15ZM25 14H15V27H25V14ZM17 25H19V16H17V25ZM21 25H23V16H21V25Z" fill="#9A9A9A"/>
			</svg>
		`;
		function _create_delete_review_btn($wrapper, review, entity_type_id, comment_arr){
			let html_str = `<button type="button" class="vgp-review-control">${delete_btn_html_str}</button>`;
			$(html_str)
			.data('review_data',review).data('entity_type_id',entity_type_id).data('review_comment_arr', comment_arr)
			.click(function(){
				let entity_type_id = $(this).data("entity_type_id");
				let review_data    = $(this).data("review_data");
				let review_comment_arr = $(this).data("review_comment_arr");
				let tobedeleted = $.extend(true, {}, review_data, {'comment':review_comment_arr.join('\n')});
				_vgp_panel_review_show_confirm_dialog(CONFIRM_TYPE_DELETE, entity_type_id, tobedeleted);
			})
			.appendTo($wrapper);
		
		}

		const edit_btn_html_str = `
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="20" cy="20" r="20" fill="#005D16"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M27.06 11.585L28.41 12.935C29.2 13.715 29.2 14.985 28.41 15.765L15.18 28.995H11V24.815L21.4 14.405L24.23 11.585C25.01 10.805 26.28 10.805 27.06 11.585ZM13 26.995L14.41 27.055L24.23 17.225L22.82 15.815L13 25.635V26.995Z" fill="white"/>
			</svg>
		`;
		function _create_edit_review_btn($wrapper, review){
			let html_str = `<button type="button" class="vgp-review-control" id="btn_panel_entity_review_edit">${edit_btn_html_str}</button>`;
			$(html_str)
				.data('review_data', review)
				.click(function(){
					let review_data = $(this).data("review_data");
					_set_data_and_open_review_input_modal(review_data);
				})
				.appendTo($wrapper);
		}
		
		function _create_delete_review_comment_btn($wrapper,review_comment_container_id, review_comment){
			$(`<span>${delete_btn_html_str}</span>`)
				.data('review_comment', {
					'review_id':         review_comment.review_id, 
					'original_review_id':review_comment.original_review_id,
					'review_comment_id': review_comment.review_comment_id,
					'user_id':           review_comment.user_id
				})
				.data('review_comment_container_id', review_comment_container_id)
				.click(function(){
		
					$(this).prop("disabled", true);
		
					if (confirm("Are you sure to delete this comment?")) {
		
						let review_comment = $(this).data("review_comment");
						let review_comment_container_id = $(this).data("review_comment_container_id");
		
						utils_run_submit(
							URL_PANELSEARCH_NANBYO_DELETE_PANEL_ENTITY_REVIEW_COMMENT,
							review_comment, 
							function(){
								//$('#'+review_comment_container_id).remove();
								location.reload();
							},
							function(){
								$(this).prop("disabled", true);
							}
						);
					}else{
						$(this).prop("disabled", true);
					}
		
				})
				.appendTo($wrapper);
		}

		function _create_add_review_comment_panel($wrapper, review_id, original_review_id){
			$wrapper.addClass('add-review-comment-panel');
			let $title_panel = $('<div>')
				.addClass('title')
				.click(function(){
					let $panel = $(this);
					$panel.parent().toggleClass('onEdit');
					if($panel.parent().hasClass('onEdit')){
						$panel.parent().find('textarea').focus();
					}
				})
				.appendTo($wrapper);

			$(`
				<svg width="17" height="16" viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg">
					<path d="M14.3333 1H2.66667C2.22464 1 1.80072 1.17643 1.48816 1.49048C1.17559 1.80453 1 2.23047 1 2.6746V11.0476C1 11.4918 1.17559 11.9177 1.48816 12.2317C1.80072 12.5458 2.22464 12.7222 2.66667 12.7222H5.32333C6.15667 12.7222 6.83333 13.4013 6.83333 14.2394C6.83333 14.916 7.64667 15.2542 8.1225 14.7761L9.67833 13.2129C9.99082 12.8988 10.4147 12.7223 10.8567 12.7222H14.3333C14.7754 12.7222 15.1993 12.5458 15.5118 12.2317C15.8244 11.9177 16 11.4918 16 11.0476V2.6746C16 2.23047 15.8244 1.80453 15.5118 1.49048C15.1993 1.17643 14.7754 1 14.3333 1Z" fill="none" stroke="#276749" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					<line x1="8.5" y1="4.5" x2="8.5" y2="9.5" stroke="#276749" stroke-width="2" stroke-linecap="round" />
					<line x1="6" y1="7" x2="11" y2="7" stroke="#276749" stroke-width="2" stroke-linecap="round" />
				</svg>
			`).appendTo($title_panel);

			$('<span>').text('Add Comment').appendTo($title_panel);
			$(`
				<svg class="dir" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6 9L11 14L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			`).appendTo($title_panel);


			let $text_area = $(`<textarea rows="6" placeholder="Add your comment." />`).appendTo($wrapper);

			let $ctl_panel = $('<div>').addClass('ctl').appendTo($wrapper);
			$(`<button class="cancel">Cancel</button>`)
				.click(function(){
					$(this).parent().parent().removeClass('onEdit');
				})
				.appendTo($ctl_panel);
			$(`<button class="comment">Comment</button>`)
				.data('review_id', review_id)
				.data('original_review_id', original_review_id)
				.click(function(){
					//save comment
					let comment = $(this).parent().prev().val().replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
					if(comment.length === 0){
						alert("Please input comment.")
						$(this).parent().prev().focus();
						return;
					}
					let review_id = $(this).data('review_id');
					let original_review_id = $(this).data('original_review_id');
					if(confirm('Sure to save this comment?')){
						_vgp_show_loading();
						fetch(URL_ADD_REVIEW_COMMENT,{
							method: 'POST',
							headers: {'Content-Type': 'application/json'},
							body: JSON.stringify({review_id: review_id, original_review_id:original_review_id, comment: comment})
						})
						.then(response => response.json())
						.then(data => {
							_vgp_hide_loading();
							if(data.error){
								alert(`Error:${data.error}`);
							}else{
								utils_reload_with_scroll();
							}
						})
						.catch(error => {
							_vgp_hide_loading();
							alert('An unexpected error occurred.' + error);
						});
					}
				})
				.appendTo($ctl_panel);

		}
	
		function _create_edit_review_comment_btn($wrapper, review_comment_container_id, review_comment){

			$(`<span>${edit_btn_html_str}</span>`)
				.data('review_comment_container_id', review_comment_container_id)
				.click(function(){
					let review_comment_container_id = $(this).data("review_comment_container_id");
					let $review_comment_text_content = $('#'+review_comment_container_id).find('.vgp-review-comment-text-content');
					let $review_comment_text_editor  = $('#'+review_comment_container_id).find('.vgp-review-comment-text-editor');
					let height = $review_comment_text_content.outerHeight(true);
					$review_comment_text_editor.height(height);	
					$('#'+review_comment_container_id).addClass('onEdit').find('.vgp-review-comment-text-editor').focus();
				})
				.appendTo($wrapper);
		
			let $review_comment_text_content = $('#'+review_comment_container_id).find('.vgp-review-comment-text-content');
		
			let $wrapper_control = $('<div>').addClass('vgp-review-comment-editor-control-panel').insertAfter($review_comment_text_content);
			$('<button>')
				.text('Save')
				.data('review_id', review_comment.review_id)
				.data('original_review_id', review_comment.original_review_id)
				.data('review_comment_id', review_comment.review_comment_id)
				.data('user_id', review_comment.user_id)
				.data('review_comment_container_id',review_comment_container_id)
				.click(function(){
					let $btn = $(this);
					$btn.prop("disabled", true);
		
					let review_comment_container_id = $(this).data('review_comment_container_id');
					let $review_comment_text_editor  = $('#'+review_comment_container_id).find('.vgp-review-comment-text-editor');
					let comment = $review_comment_text_editor.val().trim();
					if(comment.length == 0){
						alert('no content in the comment!');
						$review_comment_text_editor.focus();
						$(this).prop("disabled", false);
						return;
					}
					if(confirm('Are you sure to save this comment')){
						let data = {};
						data.user_id            = $(this).data('user_id');
						data.review_id          = $(this).data('review_id');
						data.original_review_id = $(this).data('original_review_id');
						data.review_comment_id  = $(this).data('review_comment_id');
						data.comment            = comment;
						utils_run_submit(
							URL_PANELSEARCH_NANBYO_MODIFY_PANEL_ENTITY_REVIEW_COMMENT,
							data,
							function(){
								location.reload();
							},
							function(){
								$btn.prop("disabled", false);
							}
						);
		
					}else{
						$(this).prop("disabled", false);
					}
				})
				.appendTo($wrapper_control);
			$('<button>')
				.text('Cancel').data('review_comment_container_id',review_comment_container_id)
				.click(function(){
					let review_comment_container_id = $(this).data("review_comment_container_id");
					$('#'+review_comment_container_id).removeClass('onEdit');
					let $review_comment_text_content = $('#'+review_comment_container_id).find('.vgp-review-comment-text-content');
					let $review_comment_text_editor  = $('#'+review_comment_container_id).find('.vgp-review-comment-text-editor');
					$review_comment_text_editor.val($review_comment_text_content.text());
				})
				.appendTo($wrapper_control);
		
			let textarea = document.createElement('textarea');
			$(textarea)
				.attr('rows', "2")
				.addClass('vgp-review-comment-text-editor')
				.text(review_comment.comment)
				.insertAfter($review_comment_text_content);
		
			textarea.addEventListener('input', () => autoGrow(textarea));
		}
		
		function autoGrow(element) {
			element.style.height = 'auto';
			element.style.height = element.scrollHeight + 'px';
		}
		

		function _create_definition_edit_table($wrapper, input_definition_data){

			let html_str = `
<form id="panel_entity_definition_form" class="w-100">
	<input type="hidden" id="input_definition_review_id" name="input_definition_review_id" value="${input_definition_data[KEY_REVIEW_ID]}">
	<input type="hidden" id="input_definition_panel_id" name="input_definition_panel_id" value="${input_definition_data[KEY_PANEL_ID]}">
	<input type="hidden" id="input_definition_panel_name" name="input_definition_panel_name" value="${input_definition_data[KEY_PANEL_NAME]}">
	<input type="hidden" id="input_definition_gene_id" name="input_definition_gene_id" value="${input_definition_data[KEY_GENE_ID]}">
	<input type="hidden" id="input_definition_gene_symbol" name="input_definition_gene_symbol" value="${input_definition_data[KEY_GENE_SYMBOL]}">
	<input type="hidden" id="input_definition_entity_type_id" name="input_definition_entity_type_id" value="${input_definition_data[KEY_ENTITY_TYPE_ID]}">
	<input type="hidden" id="input_definition_entity_name" name="input_definition_entity_name" value="${input_definition_data[KEY_ENTITY_NAME]}">
	<input type="hidden" id="input_definition_is_from_user" name="input_definition_is_from_user" value="${input_definition_data[KEY_IS_FROM_USER]}">
	<input type="hidden" id="input_definition_rating_id" name="input_definition_rating_id" value="${input_definition_data[KEY_RATING_ID]}">
	<input type="hidden" id="input_definition_mode_of_inheritances" name="input_definition_mode_of_inheritances" value="${input_definition_data[KEY_MODE_OF_INHERITANCE]}">
	<input type="hidden" id="input_definition_phenotype" name="input_definition_phenotype" value="">
	<table class="table" id="vgp-definition-table">
		<tr>
			<th>Rating:</th>
			<td><div id="dropdown_wrapper_definition_rating"></div></td>
		</tr>
		<tr>
			<th>Phenotype:</th>
			<td><div id="tokenInput_phenotype_definition" class="token-input-container"></div></td>
		</tr>
		<tr>
			<th>Mode of Inheritance:</th>
			<td><div id="tokenInput_inheritance_definition" class="token-input-container"></div></td>
		</tr>
		<tr>
			<th>Sources:</th>
			<td><input type="text" class="form-control" id="input_definition_source" name="input_definition_source" value="${input_definition_data[KEY_SOURCE]}" placeholder="input source"></td>
		</tr>
		<tr>
			<th>Publications (PMID or DOI):</th>
			<td><input type="text" class="form-control" id="input_definition_publications" name="input_definition_publications" value="${input_definition_data[KEY_PUBLICATION]}" placeholder="PMID:1234;doi:10.1186/s12911-025-02910-2"></td>
		</tr>
		<tr>
			<th>Comments:</th>
			<td><textarea class="form-control" id="input_definition_comment" name="input_definition_comment" rows='5'></textarea></td>
		</tr>
	</table>
	<div class="control">
		<button type="button" id="btn-definition-edit">Edit</button>
		${input_definition_data.has_current_definition ? '<button type="button" id="btn-definition-delete">Delete</button>' : ''}
		<button type="button" id="btn-definition-save" class="edit">Save</button>
		<button type="button" id="btn-definition-cancel" class="edit">Cancel</button>
	</div>
</form>
			`;
			$(html_str).appendTo($wrapper);  

			let init_rating_id = input_definition_data[KEY_RATING_ID] ? input_definition_data[KEY_RATING_ID] : RATING_ORDER_HASH[RATING_NORATING];
			let init_rating_name = input_definition_data[KEY_RATING] ? input_definition_data[KEY_RATING] : RATING_NORATING;
			let init_token = {[$.fn.token_type_dropdown.KEY_ID]: init_rating_id, [$.fn.token_type_dropdown.KEY_NAME]: init_rating_name};

			$("#dropdown_wrapper_definition_rating").token_type_dropdown({
				[$.fn.token_type_dropdown.KEY_SUGGESTIONS]:  settings[KEY_RATING_SUGGESTION_LIST],
				[$.fn.token_type_dropdown.KEY_HIDDENINPUT]:  'input_definition_rating_id',
				[$.fn.token_type_dropdown.KEY_INITIALTOKEN]: init_token,
				[$.fn.token_type_dropdown.KEY_ISSTATIC]:     false
			});

 			let init_token_arr = [];
			if(input_definition_data[KEY_MODE_OF_INHERITANCE]){
				let arr = input_definition_data[KEY_MODE_OF_INHERITANCE].split(",");
				for(let id of arr){
					init_token_arr.push({[KEY_MOI_TREEVIEW_DATA_ID]:id,  [KEY_MOI_TREEVIEW_DATA_NAME]: mode_of_inheritance_hash[id]});
				}
			}
			$("#tokenInput_inheritance_definition").token_dropdown_treeview({
				[$.fn.token_dropdown_treeview.KEY_TYPE]:             $.fn.token_dropdown_treeview.TYPE_CHECKBOX,
				[$.fn.token_dropdown_treeview.KEY_OUTPUT_TYPE]:      $.fn.token_dropdown_treeview.OUTPUT_TYPE_ID,
				[$.fn.token_dropdown_treeview.KEY_TREEVIEW_DATA]:    settings[KEY_MOI_TREEVIEW_DATA],
				[$.fn.token_dropdown_treeview.KEY_INITIALTOKENS]:    init_token_arr,
				[$.fn.token_dropdown_treeview.KEY_DATA_ID]:          KEY_MOI_TREEVIEW_DATA_ID,
				[$.fn.token_dropdown_treeview.KEY_DATA_NAME]:        KEY_MOI_TREEVIEW_DATA_NAME,
				[$.fn.token_dropdown_treeview.KEY_PLACEHOLDER]:      'Select mode of inheritance ...',
				[$.fn.token_dropdown_treeview.KEY_HIDDENINPUT_ID]:   'input_definition_mode_of_inheritances',
				[$.fn.token_dropdown_treeview.KEY_USE_CONTROL]:      false
			});

			let init_token_arr2 = [];
			if(input_definition_data[KEY_PHENOTYPE]){
				let arr = input_definition_data[KEY_PHENOTYPE].split("|");
				for(let id_name of arr){
					let tmp = id_name.split('--');
					init_token_arr2.push({[$.fn.token_typeahaed.KEY_ID]:tmp[0],  [$.fn.token_typeahaed.KEY_NAME]: tmp[1]});
				}
			}
			
			$("#tokenInput_phenotype_definition").token_typeahaed({
				[$.fn.token_typeahaed.KEY_SUGGESTIONS]:    [],
				[$.fn.token_typeahaed.KEY_INITIALTOKENS]:  init_token_arr2,
				[$.fn.token_typeahaed.KEY_LIMIT]:          1,
				[$.fn.token_typeahaed.KEY_ISSTATIC]:       true,
				[$.fn.token_typeahaed.KEY_ISOUTPUTWITHID]: true,
				[$.fn.token_typeahaed.KEY_DELIMAR_I]:      '--',
				[$.fn.token_typeahaed.KEY_HIDDENINPUT]:    "#input_definition_phenotype"
			});

            const textarea_comment_definition = document.getElementById('input_definition_comment');
            textarea_comment_definition.addEventListener('input', () => autoGrow(textarea_comment_definition));
			$(textarea_comment_definition).val(input_definition_data[KEY_COMMENT]);

			$('#btn-definition-edit').click(function(){
				$('#vgp-panel-entity-summary-wrapper').addClass('edit');
				autoGrow(textarea_comment_definition);
			});
			$('#btn-definition-delete').click(function(){
				_vgp_panel_review_show_confirm_dialog(CONFIRM_TYPE_DEFINITION_DELETE,
					$('#input_definition_entity_type_id').val(), null);
			});
			
			$('#btn-definition-cancel').click(function(){
				$('#vgp-panel-entity-summary-wrapper').removeClass('edit');
			});

			$('#btn-definition-save').click(function(){
				let entity_type_id = $('#input_definition_entity_type_id').val();
				_vgp_panel_review_show_confirm_dialog(CONFIRM_TYPE_DEFINITION, entity_type_id, null);
			});
		}


		this.create_add_entity_btn = function($wrapper, input_data){
			_create_add_entity_btn($wrapper, input_data);
		};

		this.create_add_or_edit_review_btn = function($wrapper, isEditBtn, input_data, is_in_sortable_table){
			_create_add_or_edit_review_btn($wrapper, isEditBtn, input_data, is_in_sortable_table)
		};

		this.set_data_and_open_review_input_modal = function(input_data){
			_set_data_and_open_review_input_modal(input_data);
		};

		this.attach_add_or_edit_review_btn_in_sortable_table_click_event = function(wrapper_class){
			_attach_add_or_edit_review_btn_in_sortable_table_click_event(wrapper_class);
		}

		this.create_delete_review_btn = function($wrapper, review, entity_type_id, comment_arr){
			_create_delete_review_btn($wrapper, review, entity_type_id, comment_arr);
		}

		this.create_edit_review_btn = function($wrapper, review){
			_create_edit_review_btn($wrapper, review);
		}

		this.init_inputmodal_gene_symbol_suggestion_review = function(gene_suggestion_list){
			_init_inputmodal_gene_symbol_suggestion_review(gene_suggestion_list);
		}

		this.create_delete_review_comment_btn = function($wrapper,review_comment_container_id, review_comment){
			_create_delete_review_comment_btn($wrapper,review_comment_container_id, review_comment);
		}

		this.create_add_review_comment_panel = function($wrapper, review_id, original_review_id){
			_create_add_review_comment_panel($wrapper, review_id, original_review_id);
		}

		this.create_edit_review_comment_btn = function($wrapper, review_comment_container_id, review_comment){
			_create_edit_review_comment_btn($wrapper, review_comment_container_id, review_comment);
		}

		this.create_definition_edit_table = function($wrapper, input_definition_data){
			_create_definition_edit_table($wrapper, input_definition_data);
		}

	};


}(jQuery));
