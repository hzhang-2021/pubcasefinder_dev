# -*- coding: utf-8 -*-

from flask import Flask, jsonify, request
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import json
from datetime import datetime
import time

import MySQLdb
import MySQLdb.cursors
from db.mysql import get_mysql_connection
from db.mysql import fetch_all
from db.mysql import fetch_one

from utils.api_psn import ENUM_VAL_YES,ENUM_VAL_NO,DELIMITER,ENTITY_TYPE_ID_GENE
from utils.api_psn import PANEL_TYPE_ROOT,PANEL_TYPE_SPECIFIED,PANEL_TYPE_UNSPECIFIED
from utils.api_psn import PANEL_VERSION_UPDATE_TYPE_ONTOLOGY,PANEL_VERSION_STATUS_RELEASED
from utils.api_psn import ROOT_NANDO_ID_ALL,ROOT_NANDO_ID_SPECIFIED,ROOT_NANDO_ID_UNSPECIFIED
from utils.api_psn import PANEL_CHANGE_CATEGORY_ONTOLOGY
from utils.api_psn import RATING_DEFINITIVE,RATING_NORATING

from utils.ontology_analysis import ontology_analysis,compare_array,merge_sets


app = Flask(__name__)
app.config.from_pyfile('../config.cfg')
sparqlist_url = app.config['SPARQLIST_BASE_URL']


NANDO_GENE_URL = f"{sparqlist_url}/sparqlist/api/ps_get_gene_by_nando_id"
NANDO_DEFINITIVE_GENE_URL = f"{sparqlist_url}/sparqlist/api/ps_get_definitive_gene_by_nando_id_250516_test"
NANDO_AUTOREVIEW_GENE_URL = f"{sparqlist_url}/sparqlist/api/ps_get_autoreview_gene_by_nando_id_250516_test"

REQUEST_TIMEOUT = 30
REQUEST_RETRY = 3


def create_http_session():
    """
    创建带超时和重试机制的HTTP会话
    """
    session = requests.Session()
    
    # 配置重试策略
    retry = Retry(
        total=REQUEST_RETRY,          # 最多重试3次
        backoff_factor=1,             # 重试间隔：1, 2, 4秒
        status_forcelist=[500, 502, 503, 504],  # 这些状态码触发重试
        allowed_methods=["GET", "POST"]
    )
    
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    # 设置默认超时
    session.timeout = REQUEST_TIMEOUT
    session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    return session


def api_psn_ontology_get_all_ontology():
    return fetch_all(
        """
        SELECT
            ontology_id,
            ontology_file,
            md5,
            specified_node_cnt,
            unspecified_node_cnt,
            description,
            is_valid,
            created_at  
        FROM 
            panelsearch_nando_ontology 
        ORDER BY 
            ontology_id ASC
        """,
        [],
        dict_cursor=True
    )


def api_psn_ontology_get_ontology_data(ontology_id):
    return fetch_one(
        """
        SELECT ontology_json 
        FROM panelsearch_nando_ontology 
        WHERE ontology_id = %s
        """,
        (ontology_id,),
        dict_cursor=True
    )


def api_psn_ontology_get_last_update_ontology():
    result = fetch_one(
        """
        SELECT ontology_id,ontology_file,description,created_at 
        FROM panelsearch_nando_ontology ORDER BY ontology_id DESC LIMIT 1
        """,
        [],
        dict_cursor=True
    )

    if result:
        result['created_at'] = result['created_at'].strftime('%Y/%m/%d')
        return result
    else:
        return None


def api_psn_ontology_get_current_ontology(dict_cursor):
    dict_cursor.execute(
        """
        SELECT ontology_json 
        FROM panelsearch_nando_ontology
        WHERE is_valid = %s 
        ORDER BY ontology_id DESC
        LIMIT 1
        """,
        (ENUM_VAL_YES,)
    )

    result = dict_cursor.fetchone()
    return json.loads(result['ontology_json']) if result else None


# return all of the panel info in 
def get_all_panel_info_dict():
    result = fetch_all(
        """
        SELECT  
            panel_id, 
            nando_id, 
            panel_name_en, 
            panel_synonym_en, 
            panel_name_ja, 
            panel_synonym_ja, 
            ontology_id, 
            descendant_cnt, 
            notification_number, 
            type, 
            depth, 
            is_valid, 
            updated_at
        FROM panelsearch_nando_panel
        """,
        [],
        dict_cursor=True
    )
    return {row['panel_id']: row for row in result}





def fetch_api_data(session, nando_id, api_url):

    full_url = f"{api_url}?nando_id={nando_id}"
    
    result = {'success': False,'data': {},'error': None}

    response = session.get(full_url)

    try:
        json_data = response.json()
        result['success'] = True
        if api_url == NANDO_GENE_URL:
            for gene_item in json_data:
                gene_id = gene_item.get('gene_id')
                gene_name = gene_item.get('hgnc_gene_symbol')
                source = gene_item.get('source_name')
                if gene_id and gene_name:
                    result['data'][gene_name] = {'gene_id': gene_id,'source': source}

        elif api_url == NANDO_DEFINITIVE_GENE_URL and json_data.get(nando_id):
            for gene_item in json_data[nando_id]:
                gene_id = gene_item.get('ncbi_gene_id')
                gene_name = gene_item.get('hgnc_gene_symbol')
                source = gene_item.get('source')
                source_url = gene_item.get('source_url')
                if gene_id and gene_name:
                    result['data'][gene_name] = {'gene_id': gene_id,'source': source, 'source_url': source_url}

        elif api_url == NANDO_AUTOREVIEW_GENE_URL and json_data.get(nando_id):
            for gene_item in json_data[nando_id]:
                gene_id = gene_item.get('ncbi_gene_id')
                gene_name = gene_item.get('hgnc_gene_symbol')
                source = gene_item.get('source')
                if gene_id and gene_name:
                    if(gene_name not in result['data']):
                        result['data'][gene_name] = {'gene_id': gene_id,'source': source}
                    else:
                        existing_source = result['data'][gene_name]['source']
                        if source and source not in existing_source.split('|'):
                            result['data'][gene_name]['source'] += f"|{source}"

    except ValueError as e:
        result['error'] = f"JSON error: {str(e)} @ URL:{full_url}"
        result['data'] = response.text[:500]  # 截取部分原始响应

    return result


def supplement_panel_genes(new_used_nodes_dict, specified_node_ids, unspecified_node_ids, current_panel_info_hash, is_skip=False):
    """ Supplement panel genes based on new ontology """

    #start_time = time.time()
    #print("start supplement genes:", time.strftime("%Y-%m-%d %H:%M:%S"))


    cnt = 0
    try:
        session = create_http_session()

        try:
            for panel_id in specified_node_ids | unspecified_node_ids:
                if panel_id not in current_panel_info_hash:
                    # new panel found, need to retrieve
                    new_used_nodes_dict[panel_id]['panel_genes'] = {
                        'genes': {},
                        'definitive_genes': {},
                        'autoreview_genes': {}
                    }

                    if not is_skip:
                        new_panel_genes = fetch_api_data(session, panel_id, NANDO_GENE_URL)
                        if new_panel_genes['error']:
                            return {'error': new_panel_genes['error']}
                        
                        new_panel_definitive_genes = fetch_api_data(session, panel_id, NANDO_DEFINITIVE_GENE_URL)
                        if new_panel_definitive_genes['error']:
                            return {'error': new_panel_definitive_genes['error']}

                        new_panel_autoreview_genes = fetch_api_data(session, panel_id, NANDO_AUTOREVIEW_GENE_URL)
                        if new_panel_autoreview_genes['error']:
                            return {'error': new_panel_autoreview_genes['error']}

                        new_used_nodes_dict[panel_id]['panel_genes']['genes'] = new_panel_genes['data']
                        new_used_nodes_dict[panel_id]['panel_genes']['definitive_genes'] = new_panel_definitive_genes['data']
                        new_used_nodes_dict[panel_id]['panel_genes']['autoreview_genes'] = new_panel_autoreview_genes['data']
                    
                    cnt = cnt + 1

        except requests.exceptions.Timeout:
            error_msg = "Request timeout @ supplement panel genes"
            return {'error': error_msg}
        except requests.exceptions.RequestException as e:
            error_msg = f"supplement panel genes RequestException: {str(e)}"
            return {'error': error_msg}
        finally:
            session.close()
    except Exception as e:
        # 捕获所有未处理的异常
        error_msg = f"supplement panel genes Exception: {str(e)}"
        #print(error_msg)
        return {'error': error_msg}
        

    #print(f"total fetched {cnt}")

    #end_time = time.time()
    #print("finished supplement genes:", time.strftime("%Y-%m-%d %H:%M:%S"))
    #print("Elapsed: %.2f seconds" % (end_time - start_time))


    return {'num': cnt}


####
#
# update ontology with incoming new ontology json
#
####
def api_psn_ontology_update_ontology( 
    new_ontology_file, new_ontology_file_md5, new_description, new_ontology_classmap, user_id
):
    """ Update ontology data """

    current_panel_info_dict = get_all_panel_info_dict()

    new_analysis_result = ontology_analysis(new_ontology_classmap)

    # all used nodes in treeview, exclude the 3 ROOT, include the unspecified_subroots
    new_used_nodes_dict     = new_analysis_result['usedNodes'] 

    # all specified nodes except the SPECIFIED_ROOT(NANDO:0000003)
    specified_node_ids      = new_analysis_result['specified_node_ids']

    # all specified nodes except unspecified_subroot_set
    unspecified_node_ids    = new_analysis_result['unspecified_node_ids'] 

    # all unspecified sub root(starts with NANDO:11 and not in specified_node_ids)
    unspecified_subroot_ids = new_analysis_result['unspecified_subroot_ids'] 

    treeview_json           = new_analysis_result['treeview_json']

    ######
    supplement_result = supplement_panel_genes(new_used_nodes_dict, specified_node_ids, unspecified_node_ids, current_panel_info_dict)
    if 'error' in supplement_result:
        return supplement_result

    ######

    with get_mysql_connection() as conn:
        try:
            with conn.cursor(cursorclass=MySQLdb.cursors.DictCursor) as dict_cursor:

                NEW_UPDATE_AT = datetime.now()
                NEW_UPDATE_AT_STR = NEW_UPDATE_AT.strftime("%Y-%m-%d %H:%M:%S")

                invalid_current_used_ontology(dict_cursor)

                # insert new ontology
                ontology_dict = {
                    'ontology_file': new_ontology_file,
                    'md5': new_ontology_file_md5,
                    'ontology_json': json.dumps(new_ontology_classmap),
                    'treeview_json': json.dumps(treeview_json),
                    'specified_node_cnt': new_analysis_result['specified_node_cnt'],
                    'unspecified_node_cnt':new_analysis_result['unspecified_node_cnt'] + len(unspecified_subroot_ids),
                    'description': new_description,
                    'created_at': NEW_UPDATE_AT
                }
                ontology_id = do_table_insert(
                    'panelsearch_nando_ontology',
                    list(ontology_dict.keys()),
                    list(ontology_dict.values()),
                    dict_cursor
                )

                # for root nodes
                root_dict = {
                    ROOT_NANDO_ID_ALL: {'type':PANEL_TYPE_ROOT,'panel_name_en':'All','panel_name_ja':'All','depth':0 },
                    ROOT_NANDO_ID_SPECIFIED: {'type':PANEL_TYPE_SPECIFIED,'panel_name_en': 'panels for genetic testing','panel_name_ja': '遺伝学的検査用パネル','depth':1},
                    ROOT_NANDO_ID_UNSPECIFIED: {'type':PANEL_TYPE_UNSPECIFIED,'panel_name_en': 'unspecified panels for genetic testing','panel_name_ja': '遺伝学的検査用パネル未指定疾患群','depth':1}
                }

                for root_id in root_dict:

                    current_panel_info = current_panel_info_dict.get(root_id)

                    is_exists = current_panel_info is not None

                    difference = {}

                    columns = ['ontology_id', 'updated_at']
                    values = [ontology_id,NEW_UPDATE_AT]

                    difference['ontology_id'] = {
                        'old': current_panel_info['ontology_id'] if is_exists else '', 
                        'new': ontology_id
                    }

                    if is_exists:
                        difference['updated_at'] = {
                            'old': current_panel_info['updated_at'].strftime("%Y-%m-%d %H:%M:%S"), 
                            'new': NEW_UPDATE_AT_STR
                        }

                    if not is_exists:
                        columns.append('panel_id')
                        values.append(root_id)
                        columns.append('nando_id')
                        values.append(root_id)
                        columns.append('panel_name_en')
                        values.append(root_dict[root_id]['panel_name_en'])
                        columns.append('panel_name_ja')
                        values.append(root_dict[root_id]['panel_name_ja'])
                        columns.append('type')
                        values.append(root_dict[root_id]['type'])
                        columns.append('depth')
                        values.append(root_dict[root_id]['depth'])
                        columns.append('created_at')
                        values.append(NEW_UPDATE_AT)

                    old_descendant_cnt = current_panel_info['descendant_cnt'] if is_exists else ''
                    if root_id == ROOT_NANDO_ID_ALL:
                        new_descendant_cnt = new_analysis_result['specified_node_cnt'] + new_analysis_result['unspecified_node_cnt']
                    elif root_id == ROOT_NANDO_ID_SPECIFIED:
                        new_descendant_cnt = new_analysis_result['specified_node_cnt']
                    else:
                        new_descendant_cnt = new_analysis_result['unspecified_node_cnt']
                    
                    if old_descendant_cnt != new_descendant_cnt:
                        difference['descendant_cnt'] = {'old': old_descendant_cnt, 'new': new_descendant_cnt}
                        columns.append('descendant_cnt')
                        values.append(new_descendant_cnt)

                    if is_exists:
                        update_panel(root_id, columns, values, dict_cursor)
                    else:
                        do_table_insert('panelsearch_nando_panel',columns, values, dict_cursor)

                    panel_change_dict = {
                        'panel_id': root_id,
                        'ontology_id': ontology_id,
                        'panel_type': root_dict[root_id]['type'],
                        'change_category': PANEL_CHANGE_CATEGORY_ONTOLOGY,
                        'difference': json.dumps(difference),
                        'changed_by': user_id,
                        'comment': new_description,
                        'created_at': NEW_UPDATE_AT
                    }

                    root_dict[root_id]['panel_change_id'] = do_table_insert(
                        'panelsearch_nando_panel_change',
                        list(panel_change_dict.keys()),
                        list(panel_change_dict.values()),
                        dict_cursor
                    )
                # Find deletions
                deleted_ids = set()
                for id_val in current_panel_info_dict:
                    if (
                        current_panel_info_dict[id_val]['is_valid'] == ENUM_VAL_YES and 
                        id_val not in root_dict and
                        id_val not in new_used_nodes_dict
                    ):

                        deleted_ids.add(id_val)

                        
                        columns = ['is_valid','updated_at']
                        values = [ENUM_VAL_NO,NEW_UPDATE_AT]
                        update_panel(id_val, columns, values, dict_cursor)

                        difference = {}
                        difference['is_valid'] = {'old': ENUM_VAL_YES, 'new': ENUM_VAL_NO}
                        difference['ontology_id']={'old': current_panel_info_dict[id_val]['ontology_id'], 'new': ontology_id}
                        difference['updated_at'] = {
                            'old': current_panel_info_dict[id_val]['updated_at'].strftime("%Y-%m-%d %H:%M:%S"), 
                            'new': NEW_UPDATE_AT_STR
                        }

                        panel_change_dict = {
                            'panel_id': id_val,
                            'ontology_id': ontology_id,
                            'panel_type': current_panel_info_dict[id_val]['type'],
                            'change_category': PANEL_CHANGE_CATEGORY_ONTOLOGY,
                            'difference': json.dumps(difference),
                            'changed_by': user_id,
                            'comment': f"out of use at ontology({ontology_id})",
                            'created_at': NEW_UPDATE_AT
                        }

                        do_table_insert(
                            'panelsearch_nando_panel_change',
                            list(panel_change_dict.keys()),
                            list(panel_change_dict.values()),
                            dict_cursor
                        )
                if len(deleted_ids) > 0:
                    disable_panel_version(list(deleted_ids), NEW_UPDATE_AT, dict_cursor)

                for id_val in new_used_nodes_dict:

                    columns = []
                    values = []
                    difference = {}

                    current_panel_info = current_panel_info_dict.get(id_val, None)
                    new_panel_info = new_used_nodes_dict.get(id_val)

                    columns.append('updated_at')
                    values.append(NEW_UPDATE_AT)
                    difference['updated_at'] = {
                        'old': current_panel_info['updated_at'].strftime("%Y-%m-%d %H:%M:%S") if current_panel_info is not None else '', 
                        'new': NEW_UPDATE_AT_STR
                    }

                    if current_panel_info is None:
                        columns.append('panel_id')
                        values.append(id_val)
                        columns.append('nando_id')
                        values.append(id_val)
                        columns.append('created_at')
                        values.append(NEW_UPDATE_AT)

                    # ontology_id
                    columns.append('ontology_id')
                    values.append(ontology_id)

                    if current_panel_info is None:
                        difference['ontology_id'] = {'old': '', 'new': ontology_id}
                    else:
                        difference['ontology_id'] = {'old': current_panel_info['ontology_id'], 'new': ontology_id}

                    # panel_name_en
                    if current_panel_info is None:
                        columns.append('panel_name_en')
                        values.append(new_panel_info['name_en'])
                        difference['panel_name_en'] = {'old': '', 'new': new_panel_info['name_en']}
                    elif current_panel_info['panel_name_en'] != new_panel_info['name_en']:
                        new_panel_info['synonym_en'].append(current_panel_info['panel_name_en'])
                        new_panel_info['synonym_en'] = list(set(new_panel_info['synonym_en']))
                        columns.append('panel_name_en')
                        values.append(new_panel_info['name_en'])
                        difference['panel_name_en'] = {
                            'old': current_panel_info_dict[id_val]['panel_name_en'], 
                            'new': new_panel_info['name_en']
                        }

                    # panel_synonym_en
                    if current_panel_info is None:
                        columns.append('panel_synonym_en')
                        new_synonym_en = DELIMITER.join(new_panel_info['synonym_en'])
                        values.append(new_synonym_en)
                        if new_synonym_en:
                            difference['panel_synonym_en'] = {'old': '', 'new': new_synonym_en}
                    else:
                        old_synonym_en_arr = []
                        if len(current_panel_info['panel_synonym_en']) > 0:
                            old_synonym_en_arr = current_panel_info['panel_synonym_en'].split(DELIMITER)

                        if len(old_synonym_en_arr) > 0 or len(new_panel_info['synonym_en']) > 0:
                            compare_result = compare_array(old_synonym_en_arr, new_panel_info['synonym_en'])
                            if len(compare_result['added']) > 0:
                                # only when new synonym is added, merge the old and new synonym list
                                merge_result = merge_sets(set(old_synonym_en_arr), set(new_panel_info['synonym_en']))
                                new_synonym_en = DELIMITER.join(merge_result)
                                columns.append('panel_synonym_en')
                                values.append(new_synonym_en)
                                difference['panel_synonym_en'] = {
                                    'old': current_panel_info['panel_synonym_en'], 
                                    'new': new_synonym_en
                                }

                    # panel_name_ja
                    if current_panel_info is None:
                        columns.append('panel_name_ja')
                        values.append(new_panel_info['name_ja'])
                        difference['panel_name_ja'] = {'old': '', 'new': new_panel_info['name_ja']}
                    elif current_panel_info['panel_name_ja'] != new_panel_info['name_ja']:
                        new_panel_info['synonym_ja'].append(current_panel_info['panel_name_ja'])
                        new_panel_info['synonym_ja'] = list(set(new_panel_info['synonym_ja']))
                        columns.append('panel_name_ja')
                        values.append(new_panel_info['name_ja'])
                        difference['panel_name_ja'] = {
                            'old': current_panel_info['panel_name_ja'], 
                            'new': new_panel_info['name_ja']
                        }

                    # panel_synonym_ja
                    if current_panel_info is None:
                        columns.append('panel_synonym_ja')
                        new_synonym_ja = DELIMITER.join(new_panel_info['synonym_ja'])
                        values.append(new_synonym_ja)
                        if new_synonym_ja:
                            difference['panel_synonym_ja'] = {'old': '', 'new': new_synonym_ja}
                    else:
                        old_synonym_ja_arr = []
                        if len(current_panel_info_dict[id_val]['panel_synonym_ja']) > 0:
                            old_synonym_ja_arr = current_panel_info['panel_synonym_ja'].split(DELIMITER)

                        if len(old_synonym_ja_arr) > 0 or len(new_panel_info['synonym_ja']) > 0:
                            compare_result = compare_array(old_synonym_ja_arr,new_panel_info['synonym_ja'])
                            if len(compare_result['added'])>0:
                                merge_result = merge_sets(set(old_synonym_ja_arr), set(new_panel_info['synonym_ja']))
                                new_synonym_ja = DELIMITER.join(sorted(merge_result))
                                columns.append('panel_synonym_ja')
                                values.append(new_synonym_ja)
                                difference['panel_synonym_ja'] = {
                                    'old': current_panel_info['panel_synonym_ja'], 
                                    'new': new_synonym_ja
                                }

                    # descendant_cnt
                    if current_panel_info is None:
                        columns.append('descendant_cnt')
                        values.append(new_panel_info['descendantCount_inuse'])
                        difference['descendant_cnt'] = {'old': '', 'new': new_panel_info['descendantCount_inuse']}
                    else:
                        if new_panel_info['descendantCount_inuse'] != current_panel_info['descendant_cnt']:
                            columns.append('descendant_cnt')
                            values.append(new_panel_info['descendantCount_inuse'])
                            difference['descendant_cnt'] = {
                                'old': current_panel_info['descendant_cnt'], 
                                'new': new_panel_info['descendantCount_inuse']
                            }

                    # gene_symbols, gene_cnt
                    # only when the panel is newly added, we will fetch the gene symbols and count, otherwise we will not update the gene symbols and count
                    if current_panel_info is None and id_val not in unspecified_subroot_ids:
                        if 'panel_genes' in new_panel_info:
                            gene_symbols_arr = list(
                                set(new_panel_info['panel_genes']['genes']) | 
                                set(new_panel_info['panel_genes']['definitive_genes']) | 
                                set(new_panel_info['panel_genes']['autoreview_genes'])
                            )
                            gene_cnt = len(gene_symbols_arr)
                            if gene_cnt > 0:
                                gene_symbols = DELIMITER.join(gene_symbols_arr)
                                columns.append('gene_symbols')
                                values.append(gene_symbols)
                                columns.append('gene_cnt')
                                values.append(gene_cnt)
                                difference['gene_cnt'] = {'old': '', 'new': gene_cnt}


                    # notification_number, type, depth
                    for key in ['notification_number', 'type', 'depth']:
                        if current_panel_info is None:
                            columns.append(key)
                            values.append(new_panel_info[key])
                            if new_panel_info[key]:
                                difference[key] = {'old': '', 'new': new_panel_info[key]}
                        else:
                            if new_panel_info[key] != current_panel_info[key]:
                                columns.append(key)
                                values.append(new_panel_info[key])
                                difference[key] = {
                                    'old': current_panel_info[key], 
                                    'new': new_panel_info[key]
                                }

                    if current_panel_info is not None:
                        if current_panel_info['is_valid'] != ENUM_VAL_YES:
                            columns.append('is_valid')
                            values.append(ENUM_VAL_YES)
                            difference['is_valid'] = {'old': ENUM_VAL_NO, 'new': ENUM_VAL_YES}

                    if current_panel_info is not None:
                        update_panel(id_val, columns, values, dict_cursor)
                    else:
                        do_table_insert('panelsearch_nando_panel',columns, values, dict_cursor)

                    panel_change_dict = {
                        'panel_id': id_val,
                        'ontology_id': ontology_id,
                        'panel_type': new_panel_info['type'],
                        'change_category': PANEL_CHANGE_CATEGORY_ONTOLOGY,
                        'difference': json.dumps(difference),
                        'changed_by': user_id,
                        'comment': new_description,
                        'created_at': NEW_UPDATE_AT
                    }

                    new_panel_info['panel_change_id'] = do_table_insert(
                        'panelsearch_nando_panel_change',
                        list(panel_change_dict.keys()),
                        list(panel_change_dict.values()),
                        dict_cursor
                    )
                print("finished panel")
                update_panel_version_root_trace(
                    ontology_id, 
                    current_panel_info_dict, 
                    root_dict, 
                    new_used_nodes_dict, 
                    list(unspecified_node_ids) + list(unspecified_subroot_ids),
                    treeview_json, 
                    NEW_UPDATE_AT, 
                    dict_cursor
                )
                
                record_panel_version_for_panel_change(root_dict, new_used_nodes_dict, dict_cursor)
                
                update_panel_descendant(unspecified_subroot_ids, treeview_json, dict_cursor)
                
                update_panel_hierarchy(treeview_json, dict_cursor) 
                
                update_panel_upstream_trace(treeview_json, dict_cursor)
                
                init_entity_for_new_panels(new_used_nodes_dict, user_id, NEW_UPDATE_AT, dict_cursor)
                
            conn.commit()   
            return {
                'success': True, 
                'new_panels': supplement_result['num'],
                'removed_panels': len(deleted_ids)
            }
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def update_panel(panel_id, columns, values, dict_cursor):
    set_clause = ", ".join( f"{col}=%s" for col in columns )
    sql = f"""
        UPDATE panelsearch_nando_panel
        SET {set_clause}
        WHERE panel_id = %s
    """
    dict_cursor.execute(sql, values + [panel_id])

def do_table_insert(tablename,columns,values,dict_cursor):
    colnames = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(values))
    sql = f"""
        INSERT INTO {tablename} ({colnames}) 
        VALUES ({placeholders})
    """
    dict_cursor.execute(sql, values)
    return dict_cursor.lastrowid


def invalid_current_used_ontology(cursor):
    # update panelsearch_nando_ontology
    cursor.execute(
        """
        UPDATE panelsearch_nando_ontology SET is_valid=%s WHERE is_valid=%s
        """,
        (ENUM_VAL_NO,ENUM_VAL_YES)
    ) 
    return

# if some version root panel be out of used at this ontology
# then set them to be deleted
def disable_panel_version(deleted_ids, modified_at, dict_cursor):
    placeholders = ",".join(["%s"] * len(deleted_ids))
    sql = f"""
        UPDATE panelsearch_nando_panel_version
        SET is_deleted = %s, modified_at = %s
        WHERE is_deleted = %s AND root_panel_id IN ({placeholders})
    """
    params = [ENUM_VAL_YES, modified_at, ENUM_VAL_NO] + deleted_ids
    dict_cursor.execute(sql, params)
    return


def invalidate_panel_version_by_id(ids, NEW_UPDATE_AT,dict_cursor):
    placeholders = ",".join(["%s"] * len(ids))
    sql = f"""
        UPDATE panelsearch_nando_panel_version
        SET is_latest = %s, modified_at = %s
        WHERE is_latest = %s AND root_panel_id IN ({placeholders})
    """
    params = [ENUM_VAL_NO, NEW_UPDATE_AT, ENUM_VAL_YES] + ids
    dict_cursor.execute(sql, params)
    return


def get_all_indicated_panel_version(ids, dict_cursor):

    placeholders = ",".join(["%s"] * len(ids))

    sql = f"""
        SELECT root_panel_id, panel_version_id,major_version,minor_version,created_at
        FROM panelsearch_nando_panel_version
        WHERE is_latest = %s AND root_panel_id IN ({placeholders})
    """
    params = [ENUM_VAL_YES] + ids

    dict_cursor.execute(sql, params)

    results = dict_cursor.fetchall()

    return {
        row["root_panel_id"]: row
        for row in results
    }


def update_panel_version_root_trace(ontology_id, current_panel_info_dict, root_dict, new_used_nodes_dict,unspecified_node_ids,treeview,NEW_UPDATE_AT, cursor):
    """
    1. Update panel version root trace table.
       (1) for the 3 root panels, record itself as version root 
       (2) for the specified panels, record the level 2 node as version root
       (3) for the unspecified panels, record itself as version root

    2. create new panel version for every version root panel
        (1) for the 3 root panels, starts from 1.0 and plus 1.0 
        (2) for new the specified panels, starts from 1.0 and plus 0.1
        (3) for exists the specified panels, do plus 0.1
        (4) for new the unspecified panels, starts from 0.0 and plus 0.1
        (5) for exists the unspecified panels, do plus 0.1
        (6) for those panels that from unspecified to specified, change version from 0.*** to 1.0
        (7) for those panels that from specified to unspecified, keep the major version, do plus 0.1
        (8) for those panels that from unspecified to specified, but it was formerly specified, then keep the major version, do plus 0.1
    """

    version_root_arr = set()
    version_root_ids = set()

    # root nodes
    for root_id in root_dict:
        version_root_arr.add((root_id, root_id))
        version_root_ids.add(root_id)
        root_dict[root_id]['version_root'] = [root_id]

    # specified 
    level1_node = treeview['children'][0]
    for level2_node in level1_node.get('children', []):

        level2_panel_id = level2_node['panel_id']

        version_root_arr.add((level2_panel_id,level2_panel_id))

        version_root_ids.add(level2_panel_id)

        new_used_nodes_dict[level2_panel_id]['version_root'] = [level2_panel_id]

        descendant_panel_ids = dfs_get_all_ids(level2_node)
        for descendant_panel_id in descendant_panel_ids:
            version_root_arr.add((descendant_panel_id,level2_panel_id))
            if 'version_root' not in new_used_nodes_dict[descendant_panel_id]:
                new_used_nodes_dict[descendant_panel_id]['version_root'] = []
            new_used_nodes_dict[descendant_panel_id]['version_root'].append(level2_panel_id)
            new_used_nodes_dict[descendant_panel_id]['version_root'] = list(set(new_used_nodes_dict[descendant_panel_id]['version_root']))

    # unspecified
    for panel_id in unspecified_node_ids:
        version_root_arr.add((panel_id, panel_id))
        version_root_ids.add(panel_id)
        new_used_nodes_dict[panel_id]['version_root'] = [panel_id]

    cursor.execute("DELETE FROM panelsearch_nando_panel_version_root_trace")
    cursor.executemany(
        """
        INSERT IGNORE INTO panelsearch_nando_panel_version_root_trace
        (panel_id, root_panel_id) 
        VALUES (%s, %s)
        """, 
        sorted(version_root_arr)
    )

    version_root_ids_list = list(sorted(version_root_ids))

    # get current panel version of trace root panels
    old_panel_version_dict = get_all_indicated_panel_version(version_root_ids_list, cursor)

    # set current version tobe invalidated
    invalidate_panel_version_by_id(version_root_ids_list, NEW_UPDATE_AT, cursor)

    # insert new version for every version root 
    for version_root_id in version_root_ids_list:
        if version_root_id in root_dict:
            old_version = old_panel_version_dict.get(version_root_id, None)

            if old_version:
                major_version = old_version['major_version'] + 1
            else:
                major_version = 1

            panel_version_dict = {
                'root_panel_id': version_root_id,
                'ontology_id': ontology_id,
                'major_version': major_version,
                'minor_version': 0,
                'comment': f"for ontology update to {ontology_id}",
                'update_type': PANEL_VERSION_UPDATE_TYPE_ONTOLOGY,
                'status': PANEL_VERSION_STATUS_RELEASED,
                'created_at': NEW_UPDATE_AT,
                'modified_at': NEW_UPDATE_AT
            }

            root_dict[version_root_id]['panel_version_id'] = do_table_insert(
                'panelsearch_nando_panel_version',
                list(panel_version_dict.keys()),
                list(panel_version_dict.values()),
                cursor
            )
        else:
            old_version = old_panel_version_dict.get(version_root_id, None)

            if old_version:
                if new_used_nodes_dict[version_root_id]['type'] == current_panel_info_dict[version_root_id]['type']:
                    major_version = old_version['major_version']
                    minor_version = old_version['minor_version'] + 1
                elif new_used_nodes_dict[version_root_id]['type'] == PANEL_TYPE_SPECIFIED:
                    if old_version['major_version'] == 0:
                        major_version = 1
                        minor_version = 0
                    else:
                        major_version = old_version['major_version']
                        minor_version = old_version['minor_version'] + 1
                else:
                    major_version = old_version['major_version']
                    minor_version = old_version['minor_version'] + 1
            else:
                if new_used_nodes_dict[version_root_id]['type'] == PANEL_TYPE_SPECIFIED:
                    major_version = 1
                else:
                    major_version = 0
                minor_version = 0

            panel_version_dict = {
                'root_panel_id': version_root_id,
                'ontology_id': ontology_id,
                'major_version': major_version,
                'minor_version': minor_version,
                'comment': f"for ontology update to {ontology_id}",
                'update_type': PANEL_VERSION_UPDATE_TYPE_ONTOLOGY,
                'status': PANEL_VERSION_STATUS_RELEASED,
                'created_at': NEW_UPDATE_AT,
                'modified_at': NEW_UPDATE_AT
            }

            new_used_nodes_dict[version_root_id]['panel_version_id'] = do_table_insert(
                'panelsearch_nando_panel_version',
                list(panel_version_dict.keys()),
                list(panel_version_dict.values()),
                cursor
            )
    return


def record_panel_version_for_panel_change(root_dict, new_used_nodes_dict, dict_cursor):
    """
    Record the panel version for every panel change.

    This must be called after:
    1. The panel changes were recorded(got panel_change_id).
    2. The panel version root trace was defined(got version_root).
    3. Every version root panel has finished recording the new panel version.(panel_version_id)
    """

    panel_change_version_set = set()

    for panel_hash in (root_dict,new_used_nodes_dict):
        for panel_id, panel_node in panel_hash.items():

            panel_change_id = panel_node['panel_change_id']

            version_root_arr = panel_node['version_root']
            for version_root_id in version_root_arr:
                version_root_panel_version_id = (panel_hash[version_root_id]['panel_version_id'])

                panel_change_version_set.add((panel_change_id, version_root_panel_version_id))

    if panel_change_version_set:
        dict_cursor.executemany(
            """
            INSERT IGNORE INTO panelsearch_nando_panel_change_panel_version
            (panel_change_id, panel_version_id) 
            VALUES (%s, %s)
            """, 
            list(panel_change_version_set)
        )

    return


def init_entity_for_new_panels(new_used_nodes_dict, user_id, NEW_UPDATE_AT, dict_cursor):

    entity_panel_version_set = set()

    for panel_id,panel_node in new_used_nodes_dict.items():
        if 'panel_genes' not in panel_node:
            continue

        all_keys = sorted(
            set(panel_node['panel_genes']['genes']) |
            set(panel_node['panel_genes']['definitive_genes']) |
            set(panel_node['panel_genes']['autoreview_genes'])
        )

        panel_entity_dict = {}

        for gene_symbol in all_keys:

            panel_entity_dict[gene_symbol] = {}

            source_url = ''
            rating_id  = RATING_NORATING
            if gene_symbol in panel_node['panel_genes']['definitive_genes']:
                rating_id  = RATING_DEFINITIVE
                gene_id    = panel_node['panel_genes']['definitive_genes'][gene_symbol]['gene_id']
                source     = panel_node['panel_genes']['definitive_genes'][gene_symbol]['source']
                source_url = panel_node['panel_genes']['definitive_genes'][gene_symbol]['source_url']
                comment    = "Added at System Init(DEFINITIVE)"
            elif gene_symbol in panel_node['panel_genes']['autoreview_genes']:
                gene_id    = panel_node['panel_genes']['autoreview_genes'][gene_symbol]['gene_id']
                source     = panel_node['panel_genes']['autoreview_genes'][gene_symbol]['source']
                comment    = "Added at System Init(AUTOREVIEW)"
            else:
                gene_id    = panel_node['panel_genes']['genes'][gene_symbol]['gene_id']
                source     = panel_node['panel_genes']['genes'][gene_symbol]['source']
                comment    = "Added at System Init(RDF)"

            # init panel entity
            entity_dict = {
                'panel_id': panel_id,
                'panel_type': panel_node['type'],
                'gene_symbol': gene_symbol,
                'gene_id': gene_id,
                'entity_type_id':ENTITY_TYPE_ID_GENE,
                'entity_name': gene_symbol,
                'is_from_user': ENUM_VAL_NO,
                'user_id': user_id,
                'created_at': NEW_UPDATE_AT,
                'modified_at': NEW_UPDATE_AT,
                'is_latest': ENUM_VAL_YES,
                'is_deleted': ENUM_VAL_NO,
                'rating_id': rating_id,
                'phenotypes': f"{panel_id}--{panel_node['name_ja'] or panel_node['name_en'] or panel_id}",
                'source': source,
                'comment': comment
            }

            entity_id = do_table_insert(
                'panelsearch_nando_entity',
                list(entity_dict.keys()),
                list(entity_dict.values()),
                dict_cursor
            )

            for version_root_id in panel_node['version_root']:
                version_root_node = new_used_nodes_dict[version_root_id]
                panel_version_id = version_root_node['panel_version_id']
                entity_panel_version_set.add((entity_id, panel_version_id))

            panel_entity_dict[gene_symbol]['gene_id']    = gene_id
            panel_entity_dict[gene_symbol]['entity_id']  = entity_id
            panel_entity_dict[gene_symbol]['rating_id']  = rating_id
            panel_entity_dict[gene_symbol]['source']     = source
            panel_entity_dict[gene_symbol]['source_url'] = source_url

        # init snapshot
        snapshot_dict = {
            'panel_id': panel_id,
            'panel_change_id': panel_node['panel_change_id'],
            'snapshot_json': json.dumps(panel_entity_dict)
        }

        do_table_insert(
            'panelsearch_nando_panel_snapshot',
            list(snapshot_dict.keys()),
            list(snapshot_dict.values()),
            dict_cursor
        )

    if entity_panel_version_set:
        dict_cursor.executemany(
            """
            INSERT IGNORE INTO panelsearch_nando_entity_panel_version
            (entity_id, panel_version_id) 
            VALUES (%s, %s)
            """, 
            list(entity_panel_version_set)
        )


def get_descendant_records(unspecified_subroot_ids, root_node):
    """
    遍历树/DAG，收集所有祖先->后代的传递闭包记录。
    返回列表，每个元素为 (panel_id, descendant_panel_id)。
    使用缓存避免重复计算共享子树。
    """
    records = set()          # 去重存储结果
    cache = {}               # panel_id -> 该节点所有后代 panel_id 的集合（不含自身）
    excluded_ids = set(unspecified_subroot_ids)
    excluded_ids.update([
        ROOT_NANDO_ID_ALL,
        ROOT_NANDO_ID_SPECIFIED,
        ROOT_NANDO_ID_UNSPECIFIED,
    ])

    def dfs(node):
        pid = node['panel_id']
        if pid not in excluded_ids:
            records.add((pid, pid))

        if pid in cache:
            return cache[pid]  # 已计算过，直接返回
        
        descendants = set()

        for child in node.get('children', []):

            cid = child['panel_id']

            # 获取该子节点的所有后代（不含子节点自身？我们设计为包含自身以便向上合并）
            child_all = dfs(child)  # child_all 包含 child 自身及其所有后代

            # 将子节点及其所有后代都加入当前节点的后代集合
            descendants.add(cid)

            descendants.update(child_all)

            # 记录当前节点到这些后代的边
            for desc in child_all:
                if desc not in excluded_ids:
                    records.add((pid, desc))

            # 当前节点到直接子节点的边
            if cid not in excluded_ids:
                records.add((pid, cid))

        cache[pid] = descendants

        return descendants

    dfs(root_node)

    return sorted(records)


def update_panel_descendant(unspecified_subroot_ids, treeview, cursor):
    # panelsearch_nando_panel_descendant

    descendant_datalist = get_descendant_records(unspecified_subroot_ids, treeview)
    cursor.execute("DELETE FROM panelsearch_nando_panel_descendant")
    cursor.executemany(
        """
        INSERT IGNORE INTO panelsearch_nando_panel_descendant
        (panel_id, descendant_panel_id) 
        VALUES (%s, %s)
        """, 
        descendant_datalist
    )

    return


def get_hierarchy_records(root_node):
    """
    遍历树/DAG，收集所有直接父子边（去重）。
    返回列表，每个元素为 (child_nando_id, parent_nando_id)。
    """
    records = set()  # 自动去重

    def dfs(node):
        for child in node.get('children', []):
            # 添加子→父关系
            records.add((child['nando_id'], node['nando_id']))
            dfs(child)  # 继续向下递归

    dfs(root_node)
    return sorted(records)


def update_panel_hierarchy(treeview, cursor):

    #| panelsearch_nando_panel_hierarchy

    hierarchy_datalist = get_hierarchy_records(treeview)

    cursor.execute("DELETE FROM panelsearch_nando_panel_hierarchy")
    cursor.executemany(
        """
        INSERT IGNORE INTO panelsearch_nando_panel_hierarchy
        (panel_id, parent_panel_id) 
        VALUES (%s, %s)
        """, 
        hierarchy_datalist
    )

    return


def build_dag_index(root):
    """
    对 DAG TreeView 建立索引。

    返回：
        nodes_by_id
        children_by_id
        parents_by_id
    """

    nodes_by_id = {}
    children_by_id = {}
    parents_by_id = {}

    stack = [root]

    while stack:
        node = stack.pop()

        node_id = node["panel_id"]

        # DAG 中同一个节点可能被多个 parent 引用
        if node_id in nodes_by_id:
            continue

        nodes_by_id[node_id] = node

        children = node.get("children", [])

        children_by_id[node_id] = []

        for child in children:
            child_id = child["panel_id"]

            children_by_id[node_id].append(child_id)

            parents_by_id.setdefault(child_id, []).append(node_id)

            stack.append(child)

    return (
        nodes_by_id,
        children_by_id,
        parents_by_id
    )


def get_ancestors(node_id, parents_by_id):
    """
    获取 node_id 的所有 ancestor，包括自己。
    """

    ancestors = set()

    stack = [node_id]

    while stack:
        current_id = stack.pop()

        if current_id in ancestors:
            continue

        ancestors.add(current_id)

        for parent_id in parents_by_id.get(current_id, []):
            stack.append(parent_id)

    return ancestors


def get_descendants(node_id, children_by_id):
    """
    获取 node_id 的所有 descendant，包括自己。
    """

    descendants = set()

    stack = [node_id]

    while stack:
        current_id = stack.pop()

        if current_id in descendants:
            continue

        descendants.add(current_id)

        for child_id in children_by_id.get(current_id, []):
            stack.append(child_id)

    return descendants


def rebuild_tree(
    node,
    target_id,
    ancestors,
    descendants
):
    """
    根据 ancestors + descendants
    重新构建剪枝后的 TreeView。
    """

    node_id = node["panel_id"]

    new_node = {
        **node,
        "children": []
    }

    children = node.get("children", [])

    # ------------------------------------------------
    # target 以下：
    # 所有 descendants 全部保留
    # ------------------------------------------------
    if node_id in descendants:

        new_node["children"] = [
            rebuild_tree(
                child,
                target_id,
                ancestors,
                descendants
            )
            for child in children
            if child["panel_id"] in descendants
        ]

        return new_node

    # ------------------------------------------------
    # target 以上：
    # 只保留能够到达 target 的 child
    # ------------------------------------------------
    new_node["children"] = [
        rebuild_tree(
            child,
            target_id,
            ancestors,
            descendants
        )
        for child in children
        if child["panel_id"] in ancestors
    ]

    return new_node

def get_upstream_trace_fast(
    root,
    target_id,
    all_ancestors,
    all_descendants
):
    """
    获取指定 target 的剪枝 TreeView。
    """

    ancestors = all_ancestors[target_id]
    descendants = all_descendants[target_id]

    return rebuild_tree(
        root,
        target_id,
        ancestors,
        descendants
    )

def prepare_dag(root):
    """
    对整个 DAG 做一次预处理。

    后面可以非常快速地针对任意 target
    获取剪枝后的 TreeView。
    """

    (
        nodes_by_id,
        children_by_id,
        parents_by_id
    ) = build_dag_index(root)

    # ----------------------------------------
    # 预计算所有节点的 ancestors
    # ----------------------------------------
    all_ancestors = {}

    for node_id in nodes_by_id:

        all_ancestors[node_id] = get_ancestors(
            node_id,
            parents_by_id
        )

    # ----------------------------------------
    # 预计算所有节点的 descendants
    # ----------------------------------------
    all_descendants = {}

    for node_id in nodes_by_id:

        all_descendants[node_id] = get_descendants(
            node_id,
            children_by_id
        )

    return {
        "nodes_by_id": nodes_by_id,
        "children_by_id": children_by_id,
        "parents_by_id": parents_by_id,
        "all_ancestors": all_ancestors,
        "all_descendants": all_descendants,
    }


def get_all_traces(root, panel_ids):
    """
    针对多个 target 一次性生成所有剪枝结果。

    参数：
        root       : 原始 DAG TreeView
        panel_ids  : target panel_id 列表

    返回：
        {
            panel_id: pruned_tree,
            ...
        }
    """

    index = prepare_dag(root)

    all_ancestors = index["all_ancestors"]
    all_descendants = index["all_descendants"]

    results = {}

    for target_id in panel_ids:

        if target_id not in all_ancestors:
            results[target_id] = None
            continue

        results[target_id] = get_upstream_trace_fast(
            root,
            target_id,
            all_ancestors,
            all_descendants
        )

    return results

def get_upstream_trace(node, target_id, passed_target=False):
    """
    对 DAG TreeView 进行剪枝。

    返回:
        None      : 当前分支不包含 target
        new_node  : 剪枝后的 DAG

    规则:
        1. target 之前，只保留能够到达 target 的节点。
        2. 到达 target 后，该节点以下的所有 descendants 全部保留。
    """

    current_passed = passed_target or (
        node["panel_id"] == target_id
    )

    new_node = {
        **node,
        "children": []
    }

    # --------------------------------
    # 已经经过 target
    # --------------------------------
    if current_passed:
        new_node["children"] = [
            child
            for child in (
                get_upstream_trace(
                    child,
                    target_id,
                    True
                )
                for child in node.get("children", [])
            )
            if child is not None
        ]

        return new_node

    # --------------------------------
    # 尚未经过 target
    # 只保留能够到达 target 的 child
    # --------------------------------
    for child in node.get("children", []):

        ret = get_upstream_trace(
            child,
            target_id,
            False
        )

        if ret is not None:
            new_node["children"].append(ret)

    # 当前节点没有任何路径能够到达 target
    if not new_node["children"]:
        return None

    return new_node


def dfs_get_all_ids(node):
    """
    return all panel_id in DAG, exclude the root id, no duplicated,
    """
    panel_ids = set()
    visited = set()

    def dfs(n):

        node_id = n["panel_id"]
        if node_id in visited:
            return
        visited.add(node_id)

        panel_id = n.get("panel_id")
        if panel_id is not None:
            panel_ids.add(panel_id)

        for child in n.get("children", []):
            dfs(child)

    for child in node.get("children", []):
        dfs(child)

    return sorted(panel_ids)


def update_panel_upstream_trace(treeview, cursor):
    # panelsearch_nando_panel_upstream_trace

    panel_ids = dfs_get_all_ids(treeview)

    cursor.execute("DELETE FROM panelsearch_nando_panel_upstream_trace")

    cursor.execute(
        """
        INSERT IGNORE INTO panelsearch_nando_panel_upstream_trace
        (panel_id, trace) 
        VALUES (%s, %s)
        """, 
        (ROOT_NANDO_ID_ALL, json.dumps(treeview))
    )

    #for panel_id in panel_ids:
    #    trace = get_upstream_trace(treeview, panel_id)
    all_traces = get_all_traces(treeview, panel_ids)
    for panel_id in all_traces:
        cursor.execute(
            """
            INSERT IGNORE INTO panelsearch_nando_panel_upstream_trace
            (panel_id, trace) 
            VALUES (%s, %s)
            """, 
            (panel_id, json.dumps(all_traces[panel_id]))
        )

    
    return




def main():
    print('Test regist review:')
    print(api_psn_ontology_get_all_ontology())
    print(api_psn_ontology_get_ontology_data('1'))


if __name__ == '__main__':
    main()
