const URL_COMMON_PANEL = '/panelsearch_common_panel';

$("#nav-common-panel").click(() => {
  $(".common-panel").toggleClass("dropdown-menu-open");
});

function getUserCommonPanelListName() {
    return localStorage.getItem('common_panel_list_name') || '';
}

function saveUserCommonPanelListName(common_panel_list_name) {
    localStorage.setItem('common_panel_list_name', common_panel_list_name);
}


function getUserCommonPanelList() {
	return JSON.parse(localStorage.getItem('common_panel_list')) || [];
}

function saveUserCommonPanelList(common_panel_list) {
	localStorage.setItem('common_panel_list', JSON.stringify(common_panel_list));
}

function addMultiCommonPanelItemToList(panel_list){
    const common_panel_list = getUserCommonPanelList();

	for(let item of panel_list){
	    let existingItem = common_panel_list.find(i => i.mondo_id === item.mondo_id);
	    if (!existingItem) {
	        common_panel_list.push(item);
	    }
	}

    saveUserCommonPanelList(common_panel_list);
    updateCommonPanelListBadge();
	updateCommonPanelListPopup();
}

function deleteCommonPanelItem(mondo_id){
	let common_panel_list = getUserCommonPanelList();
	let left_list = common_panel_list.filter(function(item){
		return item.mondo_id !== mondo_id;
	});
    saveUserCommonPanelList(left_list);
    updateCommonPanelListBadge();
    updateCommonPanelListPopup();
}

function addCommonPanelItemToList(common_panel_item, isShowMsg){
	const common_panel_list = getUserCommonPanelList();
	const existingItem = common_panel_list.find(i => i.mondo_id === common_panel_item.mondo_id);
	if (!existingItem) {
		common_panel_list.push(common_panel_item);
	}
	saveUserCommonPanelList(common_panel_list);
	updateCommonPanelListBadge();
	updateCommonPanelListPopup();
	if(isShowMsg) alert(`Panel(${common_panel_item.name}) was added !`);
}

function clearCommonPanelList() {
	localStorage.removeItem('common_panel_list');
	updateCommonPanelListBadge();
	updateCommonPanelListPopup();
}

function updateCommonPanelListBadge() {
	const common_panel_list = getUserCommonPanelList();
	let itemCount = common_panel_list.length;
	const badgeCount = document.getElementById('common-panel-count');
	badgeCount.textContent = itemCount;
	if (itemCount === 0) {
		badgeCount.classList.add('hidden');
	} else {
		badgeCount.classList.remove('hidden');
	}
}

function updateCommonPanelListPopup() {

	$tbody = $('#common-panel-table-tbody');
	$tbody.empty();
	$('#common-panel-opener').attr('href', '#');	

	let common_panel_list = getUserCommonPanelList();
	if(common_panel_list.length > 0){
		let id_list = [];
		let sorted_panels = Array.from(common_panel_list).sort((a, b) => a.name.localeCompare(b.name));
		for(let i=0; i<sorted_panels.length; i++){
			let item = sorted_panels[i];
			let $tr = $('<tr>').appendTo($tbody);
			$('<td>').text(item.name).appendTo($tr);
			$('<td>').text(item.gene_cnt).appendTo($tr);
			let $td_delete = $('<td>').appendTo($tr);
			$('<span class="panel delete"><svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.0634 3.1875H19.1997H3.79966H1.93597C1.39648 3.1875 0.955078 3.6289 0.955078 4.16839C0.955078 4.70788 1.39648 5.14928 1.93597 5.14928H2.81877V20.206C2.81877 21.8244 4.14298 23.0996 5.7124 23.0996H17.2869C18.8563 23.0996 20.1806 21.8244 20.1806 20.206V5.14928H21.0634C21.6028 5.14928 22.0442 4.70788 22.0442 4.16839C22.0442 3.6289 21.6028 3.1875 21.0634 3.1875ZM18.3169 20.255C18.3169 20.7945 17.8755 21.2359 17.336 21.2359H5.76145C5.22196 21.2359 4.78056 20.7945 4.78056 20.255V5.14928H18.3169V20.255Z" fill="#212529"></path><path d="M7.42816 1.96178H15.5696C16.109 1.96178 16.5504 1.52038 16.5504 0.980892C16.5504 0.441401 16.109 0 15.5696 0H7.42816C6.88867 0 6.44727 0.441401 6.44727 0.980892C6.44727 1.52038 6.88867 1.96178 7.42816 1.96178Z" fill="#212529"></path><path d="M7.67425 19.4216C8.21374 19.4216 8.65514 18.9802 8.65514 18.4898V7.8471C8.65514 7.30761 8.21374 6.86621 7.67425 6.86621C7.13476 6.86621 6.69336 7.30761 6.69336 7.8471V18.4407C6.69336 18.9802 7.13476 19.4216 7.67425 19.4216Z" fill="#212529"></path><path d="M11.5004 19.4216C12.0399 19.4216 12.4813 18.9802 12.4813 18.4898V7.8471C12.4813 7.30761 12.0399 6.86621 11.5004 6.86621C10.9609 6.86621 10.5195 7.30761 10.5195 7.8471V18.4407C10.5195 18.9802 10.9609 19.4216 11.5004 19.4216Z" fill="#212529"></path><path d="M15.3266 19.4216C15.8661 19.4216 16.2584 18.9802 16.3075 18.4898V7.8471C16.3075 7.30761 15.8661 6.86621 15.3266 6.86621C14.7871 6.86621 14.3457 7.30761 14.3457 7.8471V18.4407C14.3457 18.9802 14.7871 19.4216 15.3266 19.4216Z" fill="#212529"></path></svg><span></span></span>')
				.data('mondo_id', item.mondo_id)
				.click(function(e){
					e.stopPropagation(); 
					e.preventDefault();
					let mondo_id = $(this).data('mondo_id');
					$(this).closest('tr').remove();
					deleteCommonPanelItem(mondo_id);
					if(update_common_panel && typeof update_common_panel === "function"){
						update_common_panel();
					}
				})
				.appendTo($td_delete);
			id_list.push(item.mondo_id);
		}

		let urlstr = `${URL_COMMON_PANEL}?lang=${lang}&panel_id_list_str=${encodeURIComponent(id_list.join(','))}`;
		$('#common-panel-opener').attr('href', urlstr);
	}else{
	}
}

function openCommonPanelPage(){
	let common_panel_list = getUserCommonPanelList();
	let id_list = common_panel_list.map(item => item.mondo_id);
	let urlstr = `${URL_COMMON_PANEL}?panel_id_list_str=${encodeURIComponent(id_list.join(','))}`;
	window.open(urlstr, "_blank");
}
