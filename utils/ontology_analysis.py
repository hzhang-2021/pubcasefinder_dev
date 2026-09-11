import json
import re
from typing import Dict, Set, List, Any, Optional, Tuple


from utils.api_psn import PANEL_TYPE_ROOT,PANEL_TYPE_SPECIFIED,PANEL_TYPE_UNSPECIFIED
from utils.api_psn import ROOT_NANDO_ID_ALL,ROOT_NANDO_ID_SPECIFIED,ROOT_NANDO_ID_UNSPECIFIED


# nando_data:{}
#   {
#       "id":                  node_id,
#       "pref_label_en":       "",
#       "pref_label_ja":       "",
#       "name_en":             node_id,
#       "name_ja":             node_id,
#       "name_ja_hira":        "",
#       "synonym_ja":          [],
#       "synonym_en":          [],
#       "notification_number": "",
#       "parents":             [],
#       "memberOf":            [],
#       "children":            [],
#       "deprecated":          0
#   };
def analyze_class_map(parsed_class_map):

    """Analyze ontology data read from TTL."""

    nando_data = {}
    for nando_id in parsed_class_map:

        node = parsed_class_map[nando_id]

        if is_obsolete(node):
            continue

        nando_data[nando_id] = {
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

        if node['pref_label_en']:
            if node['name_en'] and node['name_en'] != nando_id:
                if node['name_en'] != node['pref_label_en']:
                    nando_data[nando_id]['synonym_en'].append(node['name_en'])
                    nando_data[nando_id]['name_en'] = node['pref_label_en']
            else:
                nando_data[nando_id]['name_en'] = node['pref_label_en']

        if node['pref_label_ja']:
            if node['name_ja'] and node['name_ja'] != nando_id:
                if node['name_ja'] != node['pref_label_ja']:
                    nando_data[nando_id]['synonym_ja'].append(node['name_ja'])
                    nando_data[nando_id]['name_ja'] = node['pref_label_ja']
            else:
                nando_data[nando_id]['name_ja'] = node['pref_label_ja']
		
        if node['synonym_en']:
            for synonym_en in node['synonym_en']:
                nando_data[nando_id]['synonym_en'].append(synonym_en)
            nando_data[nando_id]['synonym_en'] = list(set(nando_data[nando_id]['synonym_en']))

        if node['synonym_ja']:
            for synonym_ja in node['synonym_ja']:
                nando_data[nando_id]['synonym_ja'].append(synonym_ja)
            nando_data[nando_id]['synonym_ja'] = list(set(nando_data[nando_id]['synonym_ja']))

        if node['name_ja_hira']:
            nando_data[nando_id]['synonym_ja'].append(node['name_ja_hira'])
            nando_data[nando_id]['synonym_ja'] = list(set(nando_data[nando_id]['synonym_ja']))

        for arr in (node['parents'], node['memberOf']):
            if arr:
                for parent_nando_id in arr:

                    if parent_nando_id not in parsed_class_map:
                        continue

                    parent_node = parsed_class_map[parent_nando_id]

                    if is_obsolete(parent_node):
                        continue
                    
                    nando_data[nando_id]['parents'].append(parent_nando_id)

        nando_data[nando_id]['parents'] = list(set(nando_data[nando_id]['parents']))

	# construct children relation
    for nando_id in nando_data:
        node = nando_data[nando_id]
        if node['parents']:
            for parent_nando_id in node['parents']:
                nando_data[parent_nando_id]['children'].append(nando_id)
                nando_data[parent_nando_id]['children'] = list(set(nando_data[parent_nando_id]['children']))

    return nando_data


def ontology_analysis(parsed_class_map: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze ontology data read from TTL."""

    nando_data = analyze_class_map(parsed_class_map)

    root = {
        'panel_id': ROOT_NANDO_ID_ALL,
        'nando_id': ROOT_NANDO_ID_ALL,
        'panel_name_en': 'ALL',
        'panel_name_ja': 'ALL',
        'descendant_cnt': 0,
        'children': []
    }
    
    panel_node = {
        'panel_id': ROOT_NANDO_ID_SPECIFIED,
        'nando_id': ROOT_NANDO_ID_SPECIFIED,
        'panel_name_en': 'panels for genetic testing',
        'panel_name_ja': '遺伝学的検査用パネル',
        'descendant_cnt': 0,
        'children': []
    }
    
    unspecified_node = {
        'panel_id': ROOT_NANDO_ID_UNSPECIFIED,
        'nando_id': ROOT_NANDO_ID_UNSPECIFIED,
        'panel_name_en': 'unspecified panels for genetic testing',
        'panel_name_ja': '遺伝学的検査用パネル未指定疾患群',
        'descendant_cnt': 0,
        'children': []
    }

    
    # Get all specified panels
    panel_set = get_descendants(ROOT_NANDO_ID_SPECIFIED, set(), nando_data)
    build_sub_tree(nando_data, ROOT_NANDO_ID_SPECIFIED, panel_node, set())
    panel_node['descendant_cnt'] = len(panel_set)
    
    unspecified_set = set()
    unspecified_subroot_set = set()
    for id_val in nando_data:
        if (id_val.startswith('NANDO:11') and id_val not in panel_set):
            unspecified_subroot_set.add(id_val)
            sub_set = get_descendants(id_val, panel_set, nando_data)
            unspecified_sub_root_node = {
                'panel_id': id_val,
                'nando_id': id_val,
                'panel_name_en': nando_data[id_val].get('name_en', ''),
                'panel_name_ja': nando_data[id_val].get('name_ja', ''),
                'descendant_cnt': len(sub_set),
            }
            unspecified_set = merge_sets(unspecified_set, sub_set)
            if len(sub_set) > 0:
                unspecified_sub_root_node['children'] = []
                build_sub_tree(nando_data, id_val, unspecified_sub_root_node, panel_set)
            unspecified_node['children'].append(unspecified_sub_root_node)

    unspecified_node['children'].sort(key=lambda x: x['panel_id'])    
    unspecified_node['descendant_cnt'] = len(unspecified_set)
    
    root['children'].append(panel_node)
    root['children'].append(unspecified_node)
    total_descendants = merge_sets(panel_set, unspecified_set)
    root['descendant_cnt'] = len(total_descendants)
    
    used_nodes = {}
    for sub_node in root['children'][0]['children']:
        get_used_nodes(2, PANEL_TYPE_SPECIFIED, nando_data, sub_node, used_nodes)

    for sub_node in root['children'][1]['children']:
        get_used_nodes(2,PANEL_TYPE_UNSPECIFIED, nando_data, sub_node, used_nodes)

    return {
        'nandoData':               nando_data, # all node from incoming ontology classmap except the obsolete node
        'usedNodes':               used_nodes, # all used nodes except the SPECIFIED_ROOT(NANDO:0000003),include the unspecified_subroots
        'treeview_json':           root,       # treeview
        'specified_node_ids':      panel_set,  # all specified nodes except the SPECIFIED_ROOT(NANDO:0000003)
        'specified_node_cnt':      panel_node['descendant_cnt'], # number of panel_set nodes
        'unspecified_subroot_ids': unspecified_subroot_set, # all unspecified sub root(starts with NANDO:11 and not in specified_node_ids)
        'unspecified_node_ids':    unspecified_set,         # all specified nodes except unspecified_subroot_set
        'unspecified_node_cnt':    unspecified_node['descendant_cnt'] # number of unspecified_set nodes
    }


def get_used_nodes(current_depth, node_type, nando_data, root_node, out_hash):
    """Recursively collect used nodes."""
    
    if root_node['nando_id'] not in out_hash:
        node = json.loads(json.dumps(nando_data[root_node['nando_id']]))
        node['children_inuse'] = []
        node['parents_inuse'] = []
        node['type'] = node_type
        node['descendantCount_inuse'] = root_node['descendant_cnt']
        node['depth'] = current_depth
        out_hash[root_node['nando_id']] = node
    
    node = out_hash[root_node['nando_id']]
    if node['depth'] > current_depth:
        node['depth'] = current_depth
    
    if 'children' in root_node:
        for child_node in root_node['children']:
            if child_node['nando_id'] not in node['children_inuse']:
                node['children_inuse'].append(child_node['nando_id'])
            
            if child_node['nando_id'] not in out_hash:
                child = json.loads(json.dumps(nando_data[child_node['nando_id']]))
                child['children_inuse'] = []
                child['parents_inuse'] = []
                child['type'] = node_type
                child['depth'] = current_depth + 1
                child['descendantCount_inuse'] = child_node['descendant_cnt']
                out_hash[child_node['nando_id']] = child
            
            if root_node['nando_id'] not in out_hash[child_node['nando_id']]['parents_inuse']:
                out_hash[child_node['nando_id']]['parents_inuse'].append(root_node['nando_id'])
            
            get_used_nodes(current_depth + 1, node_type, nando_data, child_node, out_hash)


def compare_used_nodes(old_ontology_hash: Dict[str, Any], 
                       new_ontology_hash: Dict[str, Any]) -> Dict[str, List[Any]]:
    """Compare two ontology hashes and report differences."""
    
    report = {
        'added': [],
        'removed': [],
        'modified_notification_number': [],
        'modified_name': [],
        'modified_synonym': [],
        'modified_parents': [],
        'modified_children': []
    }
    
    # Find additions
    for id_val in new_ontology_hash:
        if id_val not in old_ontology_hash:
            report['added'].append(new_ontology_hash[id_val])
    
    # Find deletions
    for id_val in old_ontology_hash:
        if id_val not in new_ontology_hash:
            report['removed'].append(old_ontology_hash[id_val])
    
    # Find modifications
    for id_val in old_ontology_hash:
        if id_val not in new_ontology_hash:
            continue
        
        old_node = old_ontology_hash[id_val]
        new_node = new_ontology_hash[id_val]
        compare_node(old_node, new_node, report)
    
    return report


def compare_node(old_node: Dict[str, Any], new_node: Dict[str, Any], 
                 report: Dict[str, List[Any]]) -> None:
    """Compare two nodes and update report with differences."""
    
    if old_node.get('notification_number') != new_node.get('notification_number'):
        if old_node['id'] not in report['modified_notification_number']:
            report['modified_notification_number'].append(old_node['id'])
    
    if old_node.get('name_en') != new_node.get('name_en'):
        if old_node['id'] not in report['modified_name']:
            report['modified_name'].append(old_node['id'])
    
    if old_node.get('name_ja') != new_node.get('name_ja'):
        if old_node['id'] not in report['modified_name']:
            report['modified_name'].append(old_node['id'])
    
    compare_result_en = compare_array(
        old_node.get('synonym_en', []), 
        new_node.get('synonym_en', [])
    )
    if len(compare_result_en['added']) > 0 or len(compare_result_en['removed']) > 0:
        if old_node['id'] not in report['modified_synonym']:
            report['modified_synonym'].append(old_node['id'])
    
    compare_result_ja = compare_array(
        old_node.get('synonym_ja', []), 
        new_node.get('synonym_ja', [])
    )
    if len(compare_result_ja['added']) > 0 or len(compare_result_ja['removed']) > 0:
        if old_node['id'] not in report['modified_synonym']:
            report['modified_synonym'].append(old_node['id'])
    
    compare_result_parents = compare_array(
        old_node.get('parents_inuse', []), 
        new_node.get('parents_inuse', [])
    )
    if len(compare_result_parents['added']) > 0 or len(compare_result_parents['removed']) > 0:
        if old_node['id'] not in report['modified_parents']:
            report['modified_parents'].append(old_node['id'])
    
    compare_result_children = compare_array(
        old_node.get('children_inuse', []), 
        new_node.get('children_inuse', [])
    )
    if len(compare_result_children['added']) > 0 or len(compare_result_children['removed']) > 0:
        if old_node['id'] not in report['modified_children']:
            report['modified_children'].append(old_node['id'])


def compare_array(old_array: List[Any], new_array: List[Any]) -> Dict[str, List[Any]]:
    """Compare two arrays and return added and removed elements."""
    
    old_set = set(old_array)
    new_set = set(new_array)
    
    added = [x for x in new_set if x not in old_set]
    removed = [x for x in old_set if x not in new_set]
    
    return {
        'added': added,
        'removed': removed
    }


def merge_sets(*sets) -> Set[Any]:
    """Merge multiple sets into one."""
    
    result = set()
    for s in sets:
        result.update(s)
    return result


def build_sub_tree(nando_data: Dict[str, Any], 
                   parent_id: str, 
                   target_parent_node: Dict[str, Any], 
                   exclude_set: Optional[Set[str]] = None) -> None:
    
    """Build subtree recursively."""
    
    parent_node = nando_data.get(parent_id)
    if not parent_node:
        return
    
    children_ids = parent_node.get('children', [])
    valid_children = []
    
    for c_id in children_ids:
        if exclude_set and c_id in exclude_set:
            continue
        child = nando_data.get(c_id)
        if not child:
            continue
        valid_children.append(c_id)
    
    if len(valid_children) == 0:
        return
    
    # Sort by numeric part after 'NANDO:'
    valid_children.sort(key=lambda x: int(x.split(':')[1]) if ':' in x else 0)
    
    target_parent_node['children'] = []
    
    for c_id in valid_children:
        child = nando_data[c_id]

        #label = child.get('name_ja') or child.get('label') or c_id
        descendants = get_descendants(c_id, exclude_set or set(), nando_data)
        
        z_node = {
            'panel_id': c_id,
            'nando_id': c_id,
            'panel_name_en': child.get('name_en', ''),
            'panel_name_ja': child.get('name_ja', ''),
            'descendant_cnt': len(descendants)
        }
        target_parent_node['children'].append(z_node)
        build_sub_tree(nando_data, c_id, z_node, exclude_set)



def is_obsolete(node: Optional[Dict[str, Any]]) -> bool:
    """
    判断节点是否 obsolete。
    
    判断条件：
      1. node=None -> False
      2. deprecated 为 True / 1 / "true" / "1" / "yes" -> True
      3. name_ja 或 name_en 包含 obsolete -> True
    """

    if node is None:
        return False


    # deprecated flag
    deprecated = node.get("deprecated", 0)

    if isinstance(deprecated, bool):
        if deprecated:
            return True

    elif isinstance(deprecated, (int, float)):
        if deprecated == 1:
            return True

    elif isinstance(deprecated, str):
        if deprecated.lower() in ("true","1","yes"):
            return True


    # label check
    for field in ("name_ja","name_en","pref_label_en","pref_label_ja"):
        value = node.get(field)
        if isinstance(value, str):
            if "obsolete" in value.lower():
                return True

    return False



def get_descendants(node_id: str, exclude_set: Set[str], nando_data: Dict[str, Any]) -> Set[str]:

    """Get all descendants of a node."""
    
    all_descendants = set()
    
    if not node_id:
        return all_descendants
    
    node = nando_data.get(node_id)
    if not node:
        return all_descendants
    
    def collect_descendants(current_id: str) -> None:
        current_node = nando_data.get(current_id)
        if not current_node or not current_node.get('children'):
            return
        
        for child_id in current_node.get('children', []):
            if exclude_set and child_id in exclude_set:
                continue
            child = nando_data.get(child_id)
            if not child:
                continue
            all_descendants.add(child_id)
            collect_descendants(child_id)
    
    collect_descendants(node_id)
    return all_descendants











#mysql> desc panelsearch_nando_ontology;
#+----------------------+------------------+------+-----+-------------------+----------------+
#| Field                | Type             | Null | Key | Default           | Extra          |
#+----------------------+------------------+------+-----+-------------------+----------------+
#| ontology_id          | int(11)          | NO   | PRI | NULL              | auto_increment |
#| ontology_file        | varchar(2000)    | NO   |     | NULL              |                |
#| md5                  | varchar(100)     | NO   |     | NULL              |                |
#| ontology_json        | json             | NO   |     | NULL              |                |
#| treeview_json        | json             | NO   |     | NULL              |                |
#| specified_node_cnt   | int(11)          | NO   |     | 0                 |                |
#| unspecified_node_cnt | int(11)          | NO   |     | 0                 |                |
#| description          | varchar(3000)    | YES  |     |                   |                |
#| is_valid             | enum('YES','NO') | NO   |     | YES               |                |
#| created_at           | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
#+----------------------+------------------+------+-----+-------------------+----------------+

#mysql> desc panelsearch_nando_panel_hierarchy;
#+-----------------+-------------+------+-----+---------+-------+
#| Field           | Type        | Null | Key | Default | Extra |
#+-----------------+-------------+------+-----+---------+-------+
#| panel_id        | varchar(30) | NO   | PRI | NULL    |       |
#| parent_panel_id | varchar(30) | NO   | PRI | NULL    |       |
#+-----------------+-------------+------+-----+---------+-------+
#2 rows in set (0.00 sec)

#mysql> desc panelsearch_nando_panel_descendant;
#+---------------------+-------------+------+-----+---------+-------+
#| Field               | Type        | Null | Key | Default | Extra |
#+---------------------+-------------+------+-----+---------+-------+
#| panel_id            | varchar(30) | NO   | PRI | NULL    |       |
#| descendant_panel_id | varchar(30) | NO   | PRI | NULL    |       |
#+---------------------+-------------+------+-----+---------+-------+
#2 rows in set (0.00 sec)

#mysql> desc panelsearch_nando_panel_upstream_trace;
#+----------+-------------+------+-----+---------+-------+
#| Field    | Type        | Null | Key | Default | Extra |
#+----------+-------------+------+-----+---------+-------+
#| panel_id | varchar(30) | NO   | PRI | NULL    |       |
#| trace    | json        | YES  |     | NULL    |       |
#+----------+-------------+------+-----+---------+-------+
#2 rows in set (0.00 sec)

#mysql> desc panelsearch_nando_panel_version_root_trace;
#+---------------+-------------+------+-----+---------+-------+
#| Field         | Type        | Null | Key | Default | Extra |
#+---------------+-------------+------+-----+---------+-------+
#| panel_id      | varchar(30) | NO   | MUL | NULL    |       |
#| root_panel_id | varchar(30) | NO   |     | NULL    |       |
#+---------------+-------------+------+-----+---------+-------+
#2 rows in set (0.01 sec)




