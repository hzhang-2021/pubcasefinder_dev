const	URL_GET_USER_REVIEW		 = '/panelsearch_nanbyo_get_user_review_and_comment',
        URL_MOI_TREEVIEW_DATA_EN = '/static/data/panelsearch_nanbyo/moi-en.20251216.json',
        URL_MOI_TREEVIEW_DATA_JA = '/static/data/panelsearch_nanbyo/moi-ja.20251216.json';

function _vgp_init(user_id, mode_of_inheritance_arr, entity_type_arr, rating_type_arr){

	_vgp_show_loading();

	let ajax_obj_arr = [
		{'url': URL_GET_USER_REVIEW, 'data_key': 'user_review_data'},
		{'url': (lang==='ja') ? URL_MOI_TREEVIEW_DATA_JA : URL_MOI_TREEVIEW_DATA_EN, 'data_key': 'moi_treeview_data'}
	];

	let init_data = {};
	let total_cnt = ajax_obj_arr.length;
	let completed_cnt = 0;

	for(let item of ajax_obj_arr){
		fetch(item.url)
			.then(response => response.json())
			.then(data => {
				init_data[item.data_key] = data;
				completed_cnt++;
				if(completed_cnt === total_cnt){
					_vgp_init_ui(
						user_id, 
						init_data['user_review_data'].review, 
						init_data['user_review_data'].comment, 
						mode_of_inheritance_arr, 
						entity_type_arr, 
						rating_type_arr, 
						init_data.moi_treeview_data);

					_vgp_hide_loading();
				}
			})
			.catch(error => {
	            console.error('Error:', error);
	            alert('An unexpected error occurred.' + error);
    	        _vgp_hide_loading();
        	});
	}
}


function _retrieve_newest_review(user_review_arr){

	if(!user_review_arr || user_review_arr.length === 0) return [];

	return user_review_arr.sort((a,b) => {
		return b.modified_at_int - a.modified_at_int;
	});
}

function _vgp_init_panel_entity_history(panel_entity_review_arr,mode_of_inheritance_arr){

	let $wrapper = $('#ul_history');

	let former_hash = {};
	for(let i = panel_entity_review_arr.length -1; i >= 0; i--){
		//if(!(panel_entity_review_arr[i].user_id in former_hash)){
			former_hash[panel_entity_review_arr[i].user_id] = panel_entity_review_arr[i];
			let $li = $('<li>').prependTo($wrapper);
			$(`<div class="time">${panel_entity_review_arr[i].modified_at}</div>`).appendTo($li);

			let title = `Panel: ${lang==='ja' ? panel_entity_review_arr[i].panel_name_ja: panel_entity_review_arr[i].panel_name_en}`;
			if(panel_entity_review_arr[i].entity_type_id===ENTITY_TYPE_ID_STR) title = title + `  Gene Symbol: ${panel_entity_review_arr[i].gene_symbol}`;
			title = title +  `  Entity: ${panel_entity_review_arr[i].entity_name}`;


			$(`<label>Added Review (${title})</label>`).appendTo($li);
			let text = `Rating: ${panel_entity_review_arr[i].rating}`
			if('phenotypes' in panel_entity_review_arr[i] && panel_entity_review_arr[i].phenotypes){
				let phenotype_names = [];
				let phenotypes = panel_entity_review_arr[i].phenotypes.split('|');
				for(let phenotype of phenotypes){
					let tmp = phenotype.split("--");
					phenotype_names.push(tmp[1]);
				}

				text = text + '  |  Diseases: ' + phenotype_names.join(', ');
			}

			if('mode_of_inheritances' in panel_entity_review_arr[i] && panel_entity_review_arr[i].mode_of_inheritances){
				text = text + '  |  Mode Of Inheritance: ' + _mode_of_inheritances_ids_to_names(panel_entity_review_arr[i].mode_of_inheritances, mode_of_inheritance_arr) ;
			}
			$('<p>').text(text).appendTo($li);
		//}
	}

}


function _vgp_init_ui(user_id, user_review_arr, user_review_comment_arr, mode_of_inheritance_arr, entity_type_arr, rating_type_arr, moi_treeview_data){

	_vgp_init_inputmodal(mode_of_inheritance_arr,entity_type_arr,rating_type_arr, moi_treeview_data);

	_vgp_init_panel_entity_history(user_review_arr,mode_of_inheritance_arr);

	let user_newest_review_arr = _retrieve_newest_review(user_review_arr);

	$('#nav-vgp-panel-gene-review-panel').text(`Reviews (${user_newest_review_arr.length})`);
	$('#panel_entity_review_num').text(user_newest_review_arr.length);

	let rating_hash = _count_rating([],[],user_newest_review_arr);
	_vgp_init_rating_tag_list(rating_hash);

	let cnt = 0;
	let $tabContent = $('#vgp-panel-gene-review-panel');
	for(let review of user_newest_review_arr){
		let $wrapper			 = $('<div>').addClass("vgp-panel-entity-review-list-wrapper").appendTo($tabContent);
		let $upper_wrapper	   = $('<div>').addClass("vgp-review-upper-wrapper d-flex justify-content-between").appendTo($wrapper);
		let $upper_left_wrapper  = $('<div>').addClass("vgp-review-upper-left-wrapper d-flx flex-column").appendTo($upper_wrapper);
		let $upper_right_wrapper = $('<div>').addClass("vgp-review-control-wrapper d-flex flex-column").appendTo($upper_wrapper);
		
		let rating = 'rating' in review ? utils_check_rating_def(review.rating) : RATING_NORATING;
		$wrapper.data('rating',rating);
		
		$(`<div><span class="vgp-rating-tag ${RATING_CLASS_HASH[rating]}">${rating}</span></div>`).appendTo($upper_left_wrapper);

		if(!('panel_name' in review)){
			let panel_name = lang==='ja' ? review.panel_name_ja: review.panel_name_en;
			review.panel_name = panel_name;
		}

		$(`<div class="vgp-review-user-title mt-1">Panel: ${review.panel_name}</div>`).appendTo($upper_left_wrapper);
		if(review.entity_type_id===ENTITY_TYPE_ID_STR) $(`<div class="vgp-review-user-title">Gene Symbol: ${review.gene_symbol}</div>`).appendTo($upper_left_wrapper);		
		$(`<div class="vgp-review-user-title">Entity: ${review.entity_name}</div>`).appendTo($upper_left_wrapper);

		if(!(review.panel_name in panel_entity_hash)){
			panel_entity_hash[review.panel_name] = [];
		}

		panel_entity_hash[review.panel_name].push(review.entity_name);
		$wrapper.data('panel',review.panel_name).data('entity', review.entity_name);

		if('mode_of_inheritances' in review && review.mode_of_inheritances){
			let text_str =  _mode_of_inheritances_ids_to_names(review.mode_of_inheritances, mode_of_inheritance_arr);
			$(`<div><font class="vgp-review-title-font">Mode of inheritance:</font> ${text_str}</div>`).appendTo($upper_left_wrapper);
		}

		if('phenotypes' in review && review.phenotypes){
			let phenotypes_str = '';
			let phenotypes = review.phenotypes.split('|');
			for(let phenotype of phenotypes){
				let tmp = phenotype.split("--");
				if(phenotypes_str){
					phenotypes_str = phenotypes_str + ", ";
				}
				phenotypes_str = phenotypes_str + tmp[1];
			}
			$(`<div><font class="vgp-review-title-font">Phenotype:</font> ${phenotypes_str}</div>`).appendTo($upper_left_wrapper);
		}

		if('publications' in review && review.publications){
            $(`<div><font class="vgp-review-title-font">Publications:</font> ${review.publications}</div>`).appendTo($upper_left_wrapper);
        }

		// add comments
		let review_comment_arr = [];
		let comments = user_review_comment_arr.filter(function(comment) {
			return comment.original_review_id===review.original_review_id;
		});
		comments.map(review_comment => {
			review_comment_arr.push(review_comment.comment);
		});
		let $review_control_wrapper = $('<div>').addClass("vgp-review-control-subwrapper mb-1").appendTo($upper_right_wrapper);
		_vgp_inputmodal_create_delete_review_btn($review_control_wrapper, review, review.entity_type_id, review_comment_arr);
		_vgp_inputmodal_create_edit_review_btn($review_control_wrapper, review);


		if(comments && comments.length > 0){
			let $comment_wrapper = $('<div>').addClass('vgp-review-comment-list-wrapper').appendTo($wrapper);
			for(let panel_entity_review_comment of comments){
				cnt++;
                let review_comment_container_id = 'review_comment_container_'+cnt;
                let $review_comment_container   = $('<div>')
                    .attr('id',review_comment_container_id)
                    .addClass('vgp-review-comment-container')
                    .appendTo($comment_wrapper);

                let triangle_html_str=`
                    <svg class="vgp-triangle" width="36" height="18" viewBox="0 0 36 18" aria-hidden="true">
                        <defs>
                            <mask id="corner-mask" maskUnits="userSpaceOnUse">
                                <rect width="36" height="18" fill="black"/>
                                <path d="M 36 -2 L -2 -2 L 36 18 Z" fill="white" />
                            </mask>
                        </defs>
                        <rect width="36" height="18" fill="#FFF" mask="url(#corner-mask)" />
                        <path d="M 35 1 L 1 1 L 35 17" fill="none" stroke="#BFD3C1" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square" vector-effect="non-scaling-stroke" />
                    </svg>
                `;

                $(triangle_html_str).appendTo($review_comment_container);

                let $content_container = $('<div>').addClass('content-container').appendTo($review_comment_container);

                let $review_comment_editor_wrapper = $('<div>').addClass('vgp-review-comment-editor-container').appendTo($content_container);

                $('<p>').addClass("vgp-review-comment-text-content")
                    .html(panel_entity_review_comment.comment.replaceAll('\n','<br>'))
                    .appendTo($review_comment_editor_wrapper);

                $(`<div class="vgp-review-comment-timestamp">
                    Created: ${panel_entity_review_comment.comment_created_at}&nbsp;&nbsp;&nbsp;
                    Last Modified: ${panel_entity_review_comment.comment_modified_at}&nbsp;&nbsp;&nbsp;
                    Panel Version: ${panel_entity_review_comment.panel_version}</div>`
                ).appendTo($review_comment_container)

                let $review_comment_control_btn_panel = $('<div>').addClass("vgp-review-comment-control-btn-panel").appendTo($content_container);
                _vgp_inputmodal_create_delete_review_comment_btn($review_comment_control_btn_panel,review_comment_container_id, panel_entity_review_comment);
                _vgp_inputmodal_create_edit_review_comment_btn($review_comment_control_btn_panel, review_comment_container_id, panel_entity_review_comment);
			}
		}

		$(`<div class="vgp-review-group vgp-review-comment-timestamp">
				Created: ${review.created_at}&nbsp;&nbsp;&nbsp;
				Last Modified: ${review.modified_at}
		   </div>`
		).appendTo($wrapper)
	}
	_vgp_init_panel_entity_selection(panel_entity_hash);
}


var panel_entity_hash = {};
function _vgp_init_panel_entity_selection(panel_entity_hash){

	if (Object.keys(panel_entity_hash).length === 0) return;

	let $dropdown_menu_panel = $('#dropdown_menu_panel');
	$(`<a class="dropdown-item" href="#" data-value="all">ALL</a>`).appendTo($dropdown_menu_panel);
	Object.keys(panel_entity_hash).map(panel_name => {
		let html_str = `<a class="dropdown-item" href="#" data-value="${panel_name}">${panel_name}</a>`
		$(html_str).appendTo($dropdown_menu_panel);
	});
	panel_entity_hash['all'] = ['ALL'];

	$("#btn-panel-select-trigger").data('value', 'all');
	$("#btn-entity-select-trigger").data('value', 'all');


	let $dropdown_menu_entity = $('#dropdown_menu_entity');
	$(`<span class="dropdown-item text-muted">Please select panel first</span>`).appendTo($dropdown_menu_entity);

	$("#btn-panel-select-trigger + .dropdown-menu").on("click", ".dropdown-item", function (e) {
		e.preventDefault();

		const selectedPanel = $(this).data("value");
		const selectedText = $(this).text();
	
		$("#btn-panel-select-trigger").text(selectedText);
		$("#btn-panel-select-trigger").data('value', selectedPanel);

		updateEntityDropdown(selectedPanel);

		update_filter();
	});

	$("#dropdown_menu_entity").on("click", "a.dropdown-item", function (e) {
		e.preventDefault();

		let selectedEntity = $(this).text();
		let selectedValue  = $(this).data('value');
		$("#btn-entity-select-trigger").text(selectedEntity);
		$("#btn-entity-select-trigger").data('value', selectedValue);
		
		update_filter();
	});

}


function updateEntityDropdown(panel_name) {
	const $dropdown_menu_entity = $("#dropdown_menu_entity");
	$dropdown_menu_entity.empty();

	$("#btn-entity-select-trigger").text('ALL');
	$("#btn-entity-select-trigger").data('value', 'all');    

	if (panel_name === "all") {
		$dropdown_menu_entity.append('<a class="dropdown-item" href="#" data-value="all">ALL</a>');
    } else{
		$dropdown_menu_entity.append('<a class="dropdown-item" href="#" data-value="all">ALL</a>');
		panel_entity_hash[panel_name].forEach(entity => {
			$dropdown_menu_entity.append(
				`<a class="dropdown-item" href="#" data-value="${entity}">${entity}</a>`
			);
		});
	}
}

function _vgp_init_rating_tag_list(rating_hash){
	for (let rating in RATING_LIST_TAG_ID_HASH){
		let id = RATING_LIST_TAG_ID_HASH[rating];
		$("#"+id).text(rating_hash[rating]).data('rating', rating)
			.click(function(){
				if($(this).hasClass('selected')){
					$(this).removeClass('selected');
					update_filter();
					return;
				}
				$("#vgp-panel-gene-review-panel").find('.vgp-rating-list-tag').removeClass('selected');
				$(this).addClass('selected');
				update_filter();
			})
			.addClass(rating_hash[rating] > 0 ? RATING_CLASS_HASH[rating] : '');
	}
}


function update_filter(){

	let selected_rating = 'all';
	let arr = $("#vgp-panel-gene-review-panel").find('.selected');
	if(arr.length > 0){
		selected_rating = $(arr[0]).data('rating');
	}
	let selected_panel = $('#btn-panel-select-trigger').data('value');
	let selected_entity = $('#btn-entity-select-trigger').data('value');

	console.log(`rating:${selected_rating}  panel:${selected_panel}  entity:${selected_entity}`);

	$("#vgp-panel-gene-review-panel").find('.vgp-panel-entity-review-list-wrapper').hide();
	let num = $("#vgp-panel-gene-review-panel").find('.vgp-panel-entity-review-list-wrapper').filter(function(){
		let rating = $(this).data('rating');
		let panel  = $(this).data('panel');
		let entity = $(this).data('entity');

		if(selected_rating !== 'all' && selected_rating !== rating) return false;

		if(selected_panel  !== 'all' && selected_panel != panel) return false;

		if(selected_entity !== 'all' && selected_entity !== entity) return false;

		return true;
	}).show().length;
	$('#panel_entity_review_num').text(num);
}
