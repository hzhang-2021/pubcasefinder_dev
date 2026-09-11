
function _open_input_review_modal(selected_gene_name){
	let panel_id = _get_panel_id()
	if(selected_gene_name){
		openModal("modal-karte",panel_id,[],selected_gene_name);
	}else{
		let gene_name_list = _get_all_panel_genes();
    	openModal("modal-karte",panel_id,gene_name_list,'');
	}
}

