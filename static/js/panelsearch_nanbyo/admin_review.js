const URL_GET_USER_REVIEW     = '/panelsearch_nanbyo_get_user_review_and_comment';
const URL_LOAD_MULTI_CLASS    = '/panelsearch_nanbyo_load_multi_class';
const URL_PANEL_DETAIL        = "/panelsearch_nanbyo_panel_detail";
const URL_PANEL_ENTITY_DETAIL = "/panelsearch_nanbyo_panel_entity_detail";


function _init(){

	_vgp_show_loading();

	let ajax_obj_arr = [
		{
			'url': URL_GET_USER_REVIEW, 
			'data_key': 'user_review_data'
		},
		{
			'url': `${URL_LOAD_MULTI_CLASS}?lang=${lang === 'ja' ? 'ja' : 'en'}`,
			'data_key': 'multi_class_data'
		}
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

					utils_init_type_hash(
						init_data.multi_class_data.mode_of_inheritance_arr,
						init_data.multi_class_data.entity_type_arr,
						init_data.multi_class_data.rating_type_arr
					);

					_vgp_init_ui(
						init_data['user_review_data'].review, 
						init_data['user_review_data'].comment 
					);
		
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

function _construct_panel_href(review){
	return `${URL_PANEL_DETAIL}?panel_id=${review.panel_id}&nando_id=${review.nando_id}&lang=${lang}`;
}

function _construct_entity_href(review){
	let list = [
		`panel_id=${review.panel_id}`,
		`panel_name=${encodeURIComponent(review.panel_name)}`,
		`nando_id=${review.nando_id}`,
		`gene_id=${review.gene_id}`,
		`gene_symbol=${review.gene_symbol}`,
		`entity_name=${encodeURIComponent(review.entity_name)}`,
		`entity_type_id=${review.entity_type_id}`,
        `lang=${lang}`
    ];

	let href = `${URL_PANEL_ENTITY_DETAIL}?${list.join('&')}`;

	return href;
}

function _vgp_init_ui(user_review_arr, user_review_comment_arr){

	user_review_arr.sort((a,b) => {
		if(a.panel_name !== b.panel_name){
			return a.panel_name.localeCompare(b.panel_name);
		}else if(a.entity_name !== b.entity_name){
			return a.entity_name.localeCompare(b.entity_name);
		}else {
			return b.modified_at_int - a.modified_at_int;
		}
	})

	let $tabContent = $('#panel_entity_review_list_wrapper');
	for(let i=0; i < user_review_arr.length; i++){
		review = user_review_arr[i];
		let $wrapper			 = $('<div>').addClass("vgp-panel-entity-review-list-wrapper").appendTo($tabContent);
		let $upper_wrapper	     = $('<div>').addClass("vgp-review-upper-wrapper d-flex justify-content-between").appendTo($wrapper);
		let $upper_left_wrapper  = $('<div>').addClass("vgp-review-upper-left-wrapper d-flx flex-column").appendTo($upper_wrapper);
		let $upper_right_wrapper = $('<div>').addClass("vgp-review-control-wrapper d-flex flex-column").appendTo($upper_wrapper);

		let isFirstOne = true;
		if(i>0){
			if(	review.panel_name === user_review_arr[i-1].panel_name &&
				review.entity_name === user_review_arr[i-1].entity_name){
				isFirstOne = false;
			}
		}
		
		if(isFirstOne){
			$wrapper.addClass('first');
			let href_panel = _construct_panel_href(review);
			let href_entity = _construct_entity_href(review);

			let html_str = `
				<div class="vgp-review-user-title">
					<a href="${href_panel}" target="_blank">${review.panel_name}<svg></svg></a> 
                    &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                    <a href="${href_entity}" target="_blank">${review.entity_name}<svg></svg></a>
				</div>
			`;
			$(html_str).appendTo($upper_left_wrapper);
		}

        let rating = 'rating' in review ? utils_check_rating_def(review.rating) : RATING_NORATING;
        $(`<div class="vgp-review-rating-wrapper"><span class="vgp-rating-tag ${RATING_CLASS_HASH[rating]}">${rating}</span></div>`).appendTo($upper_left_wrapper);

		if('mode_of_inheritances' in review && review.mode_of_inheritances){
			let text_str =  utils_moi_ids_to_names(review.mode_of_inheritances);
			$(`<div class="vgp-review-item"><font class="vgp-review-title-font">Mode of inheritance:</font> ${text_str}</div>`).appendTo($upper_left_wrapper);
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
			$(`<div class="vgp-review-item"><font class="vgp-review-title-font">Phenotype:</font> ${phenotypes_str}</div>`).appendTo($upper_left_wrapper);
		}

		if('publications' in review && review.publications){
			let html_obj = utils_extract_publication(review.publications);
            $(`
				<div class="vgp-review-item">
					<font class="vgp-review-title-font">Publications:</font> 
					${html_obj}
				</div>
			`).appendTo($upper_left_wrapper);
        }

		// add comments
		let review_comment_arr = [];
		let comments = user_review_comment_arr.filter(function(comment) {
			return comment.original_review_id===review.original_review_id;
		});
		comments.map(review_comment => {
			review_comment_arr.push(review_comment.comment);
		});

		if(comments && comments.length > 0){
			let $comment_wrapper = $('<div>').addClass('vgp-review-comment-list-wrapper').appendTo($wrapper);
			for(let panel_entity_review_comment of comments){

                let $review_comment_container   = $('<div>').addClass('vgp-review-comment-container').appendTo($comment_wrapper);

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
                    //.html(panel_entity_review_comment.comment.replaceAll('\n','<br>'))
                    .text(panel_entity_review_comment.comment).css('white-space', 'pre-wrap')
                    .appendTo($review_comment_editor_wrapper);

				let pv = (panel_entity_review_comment.panel_type === TYPE_SPECIFIED)?
					"Panel Version: " + panel_entity_review_comment.panel_versions.join(' ') : '';
                $(`<div class="vgp-review-comment-timestamp">
                    Created: ${panel_entity_review_comment.comment_created_at}&nbsp;&nbsp;&nbsp;
                    Last Modified: ${panel_entity_review_comment.comment_modified_at}&nbsp;&nbsp;&nbsp;
					${pv}
					</div>`
                ).appendTo($review_comment_container)
			}
		}

		let pv = (review.panel_type === TYPE_SPECIFIED)?
			"Panel Version: " + review.panel_versions.join(' ') : '';
		$(`<div class="vgp-review-group vgp-review-comment-timestamp">
				Created: ${review.created_at}&nbsp;&nbsp;&nbsp;
				Last Modified: ${review.modified_at}
				${pv} 
		   </div>`
		).appendTo($wrapper)
	}
}

