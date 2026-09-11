const ROOT_ID = 'ALL';
const PANEL_ID = 'NANDO:0000003';
const UNSPECIFIED_ID = 'UNSPECIFIED';
const TYPE_SPECIFIED_LABEL = '検査用パネル';
const TYPE_UNSPECIFIED_LABEL = '未指定疾患群';

//
// analyze ontology data read from ttl.
//
function ontology_analysis(parsed_class_map) {

	const [nandoData,obsoleteNodes] = analyze_class_map(parsed_class_map)

	const root = { 
		panel_id: ROOT_ID, nando_id: ROOT_ID, panel_name_en: 'ALL', panel_name_ja: 'ALL', descendant_cnt:0, children:[]
	};
	const panelNode = { 
		panel_id: PANEL_ID,nando_id: PANEL_ID, panel_name_en: 'panels for genetic testing', panel_name_ja: '遺伝学的検査用パネル', descendant_cnt:0, children:[] 
	};
	const unspecifiedNode = { 
		panel_id: UNSPECIFIED_ID, nando_id: UNSPECIFIED_ID, panel_name_en: 'unspecified panels for genetic testing', panel_name_ja: '遺伝学的検査用パネル未指定疾患群', descendant_cnt:0, children:[] 
	};

	// get all specified panels
	const panelSet = getDescendants(PANEL_ID, new Set(), nandoData);
	buildSubTree(nandoData, PANEL_ID, panelNode, new Set());
	panelNode.descendant_cnt = panelSet.size;

	let unspecifiedSet = new Set();
	let unspecified_subroot_set = new Set();
	for (let id in nandoData) {
		if (id.startsWith('NANDO:11') && !panelSet.has(id)) {
			unspecified_subroot_set.add(id);
			let subSet = getDescendants(id, panelSet, nandoData);
			let unspecified_sub_root_zNode = {
				panel_id: id,
				nando_id: id,
				panel_name_en: nandoData[id].name_en,
				panel_name_ja: nandoData[id].name_ja,
				descendant_cnt: subSet.size,
			};
			unspecifiedSet = mergeSets(unspecifiedSet, subSet);
			if(subSet.size > 0){
				unspecified_sub_root_zNode.children = [];
				buildSubTree(nandoData, id, unspecified_sub_root_zNode, panelSet);
			}
			unspecifiedNode.children.push(unspecified_sub_root_zNode);
		}
	}
	unspecifiedNode.descendant_cnt = unspecifiedSet.size;

	root.children.push(panelNode);
	root.children.push(unspecifiedNode);
	let total_descendants = mergeSets(panelSet,unspecifiedSet);
	root.descendant_cnt = total_descendants.size;

	const unusedNodes = [];
	for (let id in nandoData) {
		
		const node = nandoData[id];
		
		if (!total_descendants.has(id) &&
			!unspecified_subroot_set.has(id) && 
			id !== PANEL_ID
		) {
			unusedNodes.push(nandoData[id]);
		}
	}
	unusedNodes.sort((a, b) => a.id.localeCompare(b.id));

	let usedNodes = {};
	get_used_nodes(TYPE_SPECIFIED_LABEL, nandoData, root.children[0], usedNodes);
	for(let sub_node of root.children[1].children){
		get_used_nodes(TYPE_UNSPECIFIED_LABEL, nandoData, sub_node, usedNodes);
	}

	return {
		parsed_class_map: parsed_class_map,
		nandoData: nandoData,
		usedNodes: usedNodes,
		obsoleteNodes: obsoleteNodes,
		unusedNodes: unusedNodes,
		treeviewData: root,
		specified_panel_cnt: panelSet.size,
		unspecified_panel_cnt: unspecifiedSet.size+unspecified_subroot_set.size,
	};
}


function analyze_class_map(parsed_class_map){

	nando_data = {}
	obsoleteNodes = []
    for(let nando_id of Object.keys(parsed_class_map)){

        node = parsed_class_map[nando_id]

        if(is_obsolete(node)) {
			obsoleteNodes.push(node);
			continue;
		}

        nando_data[nando_id] = {
			'id':                  nando_id,
			'name_en':             node['name_en'],
			'name_ja':             node['name_ja'],
			'synonym_en':          [],
			'synonym_ja':          [],
			'notification_number': node['notification_number'],
			'parents':             [],
			'children':            [],
			'descendant_cnt':      0, 
			'gene_symbols':        [], 
			'gene_cnt':            0, 
			'type':                '',
			'depth':               0
        }

        if (node['pref_label_en']){
            if(node['name_en'] && node['name_en'] !== nando_id){
                if(node['name_en'] !== node['pref_label_en'])
                    nando_data[nando_id]['synonym_en'].push(node['name_en'])
                    nando_data[nando_id]['name_en'] = node['pref_label_en']
			}else{
                nando_data[nando_id]['name_en'] = node['pref_label_en']
			}
		}

        if( node['pref_label_ja']){
            if( node['name_ja'] && node['name_ja'] != nando_id){
                if(node['name_ja'] !== node['pref_label_ja']){
                    nando_data[nando_id]['synonym_ja'].push(node['name_ja'])
                    nando_data[nando_id]['name_ja'] = node['pref_label_ja']
				}
			}else{
                nando_data[nando_id]['name_ja'] = node['pref_label_ja']
			}
		}

		if(node['synonym_en']){
			for(let synonym_en of node['synonym_en']){
				nando_data[nando_id]['synonym_en'].push(synonym_en)
			}
			nando_data[nando_id]['synonym_en'] = [...new Set(nando_data[nando_id]['synonym_en'])];
		}

		if(node['synonym_ja']){
			for(let synonym_ja of node['synonym_ja']){
				nando_data[nando_id]['synonym_ja'].push(synonym_ja)
			}
			nando_data[nando_id]['synonym_ja'] = [...new Set(nando_data[nando_id]['synonym_ja'])];
		}

        if(node['name_ja_hira']){
            nando_data[nando_id]['synonym_ja'].push(node['name_ja_hira'])
            nando_data[nando_id]['synonym_ja'] = [...new Set(nando_data[nando_id]['synonym_ja'])];
		}

		for (const arr of [node.parents, node.memberOf]) {
            if(arr){
                for(const parent_nando_id of arr){
					
					// clear no node relation
                    if(!(parent_nando_id in parsed_class_map))
                        continue;

                    parent_node = parsed_class_map[parent_nando_id]

					// clear obsolete relation
                    if(is_obsolete(parent_node))
                        continue;
                    
                    nando_data[nando_id]['parents'].push(parent_nando_id)
				}
			}
		}
        nando_data[nando_id].parents = [...new Set(nando_data[nando_id].parents)];
	}


	// construct children relation
	for(let nando_id of Object.keys(nando_data)){
        node = nando_data[nando_id]
        if(node['parents']){
            for(let parent_nando_id of node['parents']){
                nando_data[parent_nando_id]['children'].push(nando_id)
                nando_data[parent_nando_id]['children'] = [...new Set(nando_data[parent_nando_id]['children'])];
			}
		}
	}

	return [nando_data, obsoleteNodes];
}

function get_used_nodes(type, nandoData, root_node, out_hash){
	if(!(root_node.nando_id in out_hash)){
		let node = JSON.parse(JSON.stringify(nandoData[root_node.nando_id]));
		node.children_inuse = [];
		node.parents_inuse = [];
		node.type = type;
		node.descendantCount_inuse = root_node.descendant_cnt;
		out_hash[root_node.nando_id] = node;
	}

	let node = out_hash[root_node.nando_id];
	if('children' in root_node){
		for(let child_node of root_node.children){
			if(!node.children_inuse.includes(child_node.nando_id)){
				node.children_inuse.push(child_node.nando_id);
			}

			if(!(child_node.nando_id in out_hash)){
				let node = JSON.parse(JSON.stringify(nandoData[child_node.nando_id]));
				node.children_inuse = [];
				node.parents_inuse = [];
				node.type = type;
				node.descendantCount_inuse = child_node.descendant_cnt;
				out_hash[child_node.nando_id] = node;
			}
			if(!out_hash[child_node.nando_id].parents_inuse.includes(root_node.nando_id)){
				out_hash[child_node.nando_id].parents_inuse.push(root_node.nando_id)
			}

			get_used_nodes(type, nandoData, child_node, out_hash);
		}
	}
}

function compare_used_nodes(old_ontology_hash, new_ontology_hash){

	const report = {
		added: [],
		removed: [],
		modified_notification_number: [],
		modified_name:[],
		modified_synonym:[],
		modified_parents:[],
		modified_children:[]

	};
	
	// find addition
	for (let id of Object.keys(new_ontology_hash)) {
		if (!(id in old_ontology_hash)) {
			report.added.push(new_ontology_hash[id]);
		}
	}
	// find deletion
	for (let id of Object.keys(old_ontology_hash)) {
		if (!(id in new_ontology_hash)) {
			report.removed.push(old_ontology_hash[id]);
		}
	}

	// find modified
	for (let id of Object.keys(old_ontology_hash)) {

		if (!(id in new_ontology_hash))	continue;

		const oldNode = old_ontology_hash[id];
		const newNode = new_ontology_hash[id];
		compareNode(oldNode, newNode, report);
	}

	return report;
}

function compareNode(oldNode, newNode, report) {

	if (oldNode.notification_number !== newNode.notification_number) {
		if(!report.modified_notification_number.includes(oldNode.id)){
			report.modified_notification_number.push(oldNode.id)
		}
	}

	if (oldNode.name_en !== newNode.name_en) {
		if(!report.modified_name.includes(oldNode.id)){
			report.modified_name.push(oldNode.id)
		}
	}

	if (oldNode.name_ja !== newNode.name_ja) {
		if(!report.modified_name.includes(oldNode.id)){
			report.modified_name.push(oldNode.id)
		}
	}

	let compare_result_en = compare_array(oldNode.synonym_en, newNode.synonym_en);
	if (compare_result_en.added.length > 0 || compare_result_en.removed.length > 0) {
		if(!report.modified_synonym.includes(oldNode.id)){
			report.modified_synonym.push(oldNode.id)
		}
	}

	let compare_result_ja = compare_array(oldNode.synonym_ja, newNode.synonym_ja);
	if (compare_result_ja.added.length > 0 || compare_result_ja.removed.length > 0) {
		if(!report.modified_synonym.includes(oldNode.id)){
			report.modified_synonym.push(oldNode.id)
		}
	}

	let compare_result_parents = compare_array(oldNode.parents_inuse, newNode.parents_inuse);
	if (compare_result_parents.added.length > 0 || compare_result_parents.removed.length > 0) {
		if(!report.modified_parents.includes(oldNode.id)){
			report.modified_parents.push(oldNode.id)
		}
	}

	let compare_result_children = compare_array(oldNode.children_inuse, newNode.children_inuse);
	if (compare_result_children.added.length > 0 || compare_result_children.removed.length > 0) {
		if(!report.modified_children.includes(oldNode.id)){
			report.modified_children.push(oldNode.id)
		}
	}


}



function compare_array(oldArray, newArray){
	const oldSet = new Set(oldArray);
	const newSet = new Set(newArray);

	const added = [...newSet].filter(x => !oldSet.has(x));
	const removed = [...oldSet].filter(x => !newSet.has(x));

	return {
    	added: added,
    	removed: removed
	};
}

function mergeSets(...sets) {
    return new Set(sets.flatMap(set => [...set]));
}

function buildSubTree(nandoData, parentId, targetParentNode, excludeSet) {
	const parentNode = nandoData[parentId];
	if (!parentNode) return;
	const childrenIds = parentNode.children || [];
	const validChildren = [];
	for (let cId of childrenIds) {
		if (excludeSet && excludeSet.has(cId)) continue;
		const child = nandoData[cId];
		if (!child || is_obsolete(child)) continue;
		validChildren.push(cId);
	}
	if (validChildren.length === 0) return;

	validChildren.sort((a, b) => Number(a.substring(6)) - Number(b.substring(6)));

	targetParentNode.children = [];
	for (let cId of validChildren) {
		const child = nandoData[cId];
		
		const label = child.name_ja || child.label || cId;
		const descendants = getDescendants(cId, excludeSet, nandoData);
		const zNode = {
			panel_id: cId,
			nando_id: cId,
			panel_name_en: child.name_en,
			panel_name_ja: child.name_ja,
			descendant_cnt: descendants.size
		};
		targetParentNode.children.push(zNode);
		buildSubTree(nandoData, cId, zNode, excludeSet);
	}
}


function is_obsolete(node) {
	if (!node) return false;
	if (node.deprecated) return true;
	for(let label of [node.name_ja,node.name_en,node.pref_label_en, node.pref_label_ja]){
		if (label && label.includes('obsolete')) return true;
	}
	return false;
}


function getDescendants(nodeId, excludeSet, nandoData) {

	const allDescendants = new Set();

	if (!nodeId) return allDescendants;

	const node = nandoData[nodeId];
	if (!node) {
		return allDescendants;
	}

	function collectDescendants(currentId) {
		const currentNode = nandoData[currentId];
		if (!currentNode || !currentNode.children || currentNode.children.length === 0) {
			return;
		}
		for (let childId of currentNode.children) {
			if (excludeSet && excludeSet.has(childId)) continue;
			const child = nandoData[childId];
			if (!child || is_obsolete(child)) continue;
			allDescendants.add(childId);
			collectDescendants(childId);
		}
	}
	collectDescendants(nodeId);
	
	return allDescendants;
}


function extractClassInfo(quads) {
	const classMap = {};

	quads.forEach(quad => {
		const subject = quad.subject.value;
		const predicate = quad.predicate.value;
		const object = quad.object;
		const id = normalizeId(subject);
		if (!id) return;

		if (!classMap[id]) {
			classMap[id] = create_new_node(id);
		}

		if(predicate === 'http://nanbyodata.jp/ontology/NANDO_hasNotificationNumber') {
			classMap[id].notification_number = object.value;
		}

		if (predicate === 'http://www.w3.org/2002/07/owl#deprecated') {
			let val = String(object.value).toLowerCase();
			if (val === 'true' || val === '1') {
				classMap[id].deprecated = 1;
			}
		}

		if (predicate === 'http://www.w3.org/2000/01/rdf-schema#label') {
			const label = object.value;
			const language = (object.language || "").toLowerCase();
			if (language === 'ja') classMap[id].name_ja = label.normalize("NFC");
			else if (language === 'en') classMap[id].name_en = label;
			else if (language === 'ja-hira') classMap[id].name_ja_hira = label.normalize("NFC");
		}

		if(predicate ==='http://www.w3.org/2004/02/skos/core#altLabel'){
			const label = object.value;
			const language = (object.language || "").toLowerCase();
			if (language === 'ja') classMap[id].synonym_ja.push(label.normalize("NFC"));
			else if (language === 'en') classMap[id].synonym_en.push(label);
		}

		if(predicate === "http://www.w3.org/2004/02/skos/core#prefLabel"){
			const label = object.value.normalize("NFC");
			const language = (object.language || "").toLowerCase();
			if (language === 'ja') {
				classMap[id].pref_label_ja = label;
			}else if (language === 'en') {
				classMap[id].pref_label_en = label;
			}
		}

		if (predicate === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
			const parentId = normalizeId(object.value);
			if (parentId && parentId !== id && !classMap[id].parents.includes(parentId)) {
				classMap[id].parents.push(parentId);
			}
		}

		if (predicate === 'http://nanbyodata.jp/ontology/NANDO_memberOf') {
			const parentId = normalizeId(object.value);
			if (parentId && parentId !== id && !classMap[id].memberOf.includes(parentId)) {
				classMap[id].memberOf.push(parentId);
			}
		}
	});

/*		
    // 参照先クリニック
	for (let id in classMap) {
		const node = classMap[id];
		if (is_obsolete(node)) continue;
		node.parents = node.parents.filter(pId => classMap[pId]);
		node.memberOf = node.memberOf.filter(pId => classMap[pId]);
    }


	// 子関係構築
	for (let id in classMap) {
		const node = classMap[id];
		if (is_obsolete(node)) { continue; }
		node.parents.forEach(pId => {
			if (classMap[pId] && !is_obsolete(classMap[pId])) {
				const children = ensureChildren(classMap[pId]);
				if (!children.includes(id)) 
					children.push(id);
			}
		});
		node.memberOf.forEach(pId => {
			if (classMap[pId] && !is_obsolete(classMap[pId])) {
				const children = ensureChildren(classMap[pId]);
				if (!children.includes(id)) 
					children.push(id);
			}
		});
	}
*/
	return classMap;
}

function create_new_node(id){
	return  { 
		id:                  id, 
		pref_label_en:       "",
		pref_label_ja:       "",		
		notification_number: "", 
		name_ja:             id,
		name_ja_hira:        "", 
		name_en:             id, 
		synonym_ja:          [], 
		synonym_en:          [], 
		parents:             [], 
		memberOf:            [], 
		children:            [], 
		deprecated:          0 
	};
}

function normalizeId(uri) {
	if (!uri) return null;
	if (uri.startsWith('NANDO:')) return uri;
	let match = uri.match(/NANDO_(\d+)/);
	if (match) return 'NANDO:' + match[1];
	if (uri.startsWith('http://nanbyodata.jp/ontology/NANDO_')) {
		let m = uri.match(/NANDO_(\d+)/);
		if (m) return 'NANDO:' + m[1];
	}
	if (uri.match(/^:\d+$/)) return 'NANDO:' + uri.substring(1);
	return null;
}


function ensureChildren(node) {
	if (!node) return;
	if (!node.children) node.children = [];
	return node.children;
}
