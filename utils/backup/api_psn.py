# -*- coding: utf-8 -*-

from flask import Flask
import json
import copy
from collections import defaultdict

import MySQLdb
import MySQLdb.cursors
from db.mysql import get_mysql_connection
from db.mysql import fetch_all
from db.mysql import fetch_one
from db.mysql import execute_sql

from utils.api_google_auth import STATUS_PASSED,STATUS_PASSED_TO_GO
from utils.api_google_auth import api_is_user_admin


app = Flask(__name__)

ENTITY_TYPE_ID_GENE   = '1'
ENTITY_TYPE_ID_STR    = '2'
ENTITY_TYPE_ID_REGION = '3'

USER_ACTIVITY_TARGET_REVIEW         = 'review'
USER_ACTIVITY_TARGET_DEFINITION     = 'definition'

USER_ACTIVITY_ACTION_ADD      = "add"
USER_ACTIVITY_ACTION_CHANGE   = "change"
USER_ACTIVITY_ACTION_DELETE   = "delete"
USER_ACTIVITY_ACTION_CLASSIFY = "classify"

USER_ACTIVITY_DETAIL_ACTION_ADD      = "Added"
USER_ACTIVITY_DETAIL_ACTION_CHANGE   = "Changed"
USER_ACTIVITY_DETAIL_ACTION_REMOVE   = "Removed"

GROUP_USER_ROLE_REVIEWER = "reviewer"
GROUP_USER_ROLE_CURATOR = "curator"

GROUP_ACTIVITY_ACTION_ADD      = "add"
GROUP_ACTIVITY_ACTION_CHANGE   = "change"
GROUP_ACTIVITY_ACTION_REMOVE   = "remove"

ENUM_VAL_YES = 'YES'
ENUM_VAL_NO = 'NO'

VERSION_UPDATE_TYPE_INIT  = '1'
VERSION_UPDATE_TYPE_MINOR = '2'
VERSION_UPDATE_TYPE_DEPTH = '3'
VERSION_UPDATE_TYPE_ADMIN = '4'

ROOT_NANDO_ID_ALL         = 'ALL'
ROOT_NANDO_ID_SPECIFIED   = 'NANDO:0000003'
ROOT_NANDO_ID_UNSPECIFIED = 'UNSPECIFIED'

PANEL_TYPE_ROOT        = 'ROOT'
PANEL_TYPE_SPECIFIED   = 'SPECIFIED'
PANEL_TYPE_UNSPECIFIED = 'UNSPECIFIED'

PANEL_VERSION_UPDATE_TYPE_MAJOR  = 'major'
PANEL_VERSION_UPDATE_TYPE_MINOR  = 'minor'
PANEL_VERSION_UPDATE_TYPE_ONTOLOGY = 'ontology'

PANEL_CHANGE_CATEGORY_PANEL = 'panel'
PANEL_CHANGE_CATEGORY_RELATION = 'relation'
PANEL_CHANGE_CATEGORY_ENTITY = 'entity'
PANEL_CHANGE_CATEGORY_SUBPANEL = 'subpanel'
PANEL_CHANGE_CATEGORY_ONTOLOGY = 'ontology'



#####
# utils
#####

def combine_row_version(rows,row_id_key):
   
    if not rows:
        return rows
 
    result = {}
    for row in rows:

        panel_version = row['panel_version']

        row_id = row[row_id_key]

        if row_id not in result:

            item = row
            item['panel_versions'] = []
            item.pop('panel_version', None)
            result[row_id] = item

        if panel_version and panel_version not in result[row_id]['panel_versions']:
            result[row_id]['panel_versions'].append(panel_version)

    return list(result.values())


def api_psn_get_nando_id(root_panel_id):
    nando_id = fetch_one(
        """
        select nando_id
        from panelsearch_nando_panel
        where panel_id=%s
        """,
        (root_panel_id,),
        dict_cursor=False
    )[0]
    return nando_id


def api_psn_get_panel_name(panel_id, lang):

    name_col = 'panel_name_ja' if lang == 'ja' else 'panel_name_en'

    return fetch_one(
        f"""
        select {name_col}
        from panelsearch_nando_panel
        where panel_id=%s
        """,
        (panel_id,),
        dict_cursor=False
    )[0]


# for psn_treeview
def api_psn_get_all_panel_version():
    rows = fetch_all(
        """
        SELECT root_panel_id, CONCAT(major_version,'.',minor_version) AS panel_version
        FROM panelsearch_nando_panel_version
        WHERE is_latest=%s
        """,
        (ENUM_VAL_YES,),
        dict_cursor=True
    )

    if isinstance(rows, dict) and 'error' in rows:
        return rows

    panel_versions = {}
    for row in rows:
        panel_versions[row['root_panel_id']] = row['panel_version']

    return panel_versions


def api_psn_get_multi_class(lang):
        with get_mysql_connection() as OBJ_MYSQL:
            try:
                with OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:

                    cursor.execute(
                        """
                        select rating_id as id,rating_name as name 
                        from panelsearch_nando_entity_rating
                        """
                    )
                    rating_type = list(cursor.fetchall())

                    cursor.execute(
                        """
                        select entity_type_id as id,entity_type_name as name
                        from panelsearch_nando_entity_type
                        """
                    )
                    entity_type = list(cursor.fetchall())

                    cursor.execute(f"""
                        SELECT
                            mode_of_inheritance_id AS id, 
                            mode_of_inheritance_name_ja AS name_ja, 
                            mode_of_inheritance_name_en AS name_en
                        FROM panelsearch_nando_entity_mode_of_inheritance
                        """
                    )
                    moi_list = list(cursor.fetchall())
                    moi_arr = []
                    moi_hash = {}
                    for moi in moi_list:
                        moi_arr.append({'id': moi['id'], 'name': moi['name_ja'] if lang == "ja" else moi['name_en']})
                        moi_hash[moi['id']] = {'name_en': moi['name_en'], 'name_ja': moi['name_ja']}

                    return {
                        'rating_type': rating_type,
                        'entity_type': entity_type,
                        'mode_of_inheritance': moi_arr,
                        'mode_of_inheritance_hash': moi_hash
                    }
            except Exception as e:
                return {'error': str(e)}


#####
# for panel
#####


# get ontology which stored at panelsearch_nando_panel_upstream_trace 
# with id ROOT_NANDO_ID_ALL
def api_psn_get_panel_ontology():
    return api_psn_get_panel_upstream_trace(ROOT_NANDO_ID_ALL)


# get upstream trace by panel_id 
def api_psn_get_panel_upstream_trace(r_panel_id):

    sql = f"""
        SELECT trace
        FROM panelsearch_nando_panel_upstream_trace
        WHERE panel_id = %s
    """

    row = fetch_one(sql, (r_panel_id,), dict_cursor=True)
    if isinstance(row, dict) and 'error' in row:
        return row

    return row["trace"] if row else {}


# get the descendant panel data with treeview format
def api_psn_get_treeview_descendant(r_panel_id,r_lang):

    sql = """
        SELECT 
            B.nando_id,
            B.panel_name_en,
            B.panel_name_ja,
            B.descendant_cnt,
            B.panel_id
        FROM panelsearch_nando_panel_hierarchy AS A
        JOIN panelsearch_nando_panel AS B
            ON A.panel_id = B.panel_id
        WHERE A.parent_panel_id = %s
        ORDER BY B.panel_id
    """

    return(fetch_all(sql, (r_panel_id,), dict_cursor=True))


# called at panel list
SORT_COLUMN_MAP = {
    ('en', 'panel'): 'sortfield_en',
    ('ja', 'panel'): 'sortfield_ja',
    ('en', 'gene'): 'gene_cnt',
    ('ja', 'gene'): 'gene_cnt',
}
def api_psn_get_all_panel(lang, sort_key, sort_dir, root_panel_id):

    sort_col = SORT_COLUMN_MAP.get((lang, sort_key), 'sortfield_ja')

    sql = f"""
    SELECT
        B.nando_id,
        B.panel_id,
        LOWER(B.panel_name_en) AS sortfield_en,
        B.panel_name_ja AS sortfield_ja
    FROM
        panelsearch_nando_panel_descendant A
    JOIN
        panelsearch_nando_panel B
            ON A.descendant_panel_id = B.panel_id
    WHERE
        A.panel_id = %s
    ORDER BY
        {sort_col} {sort_dir}
    """

    results = fetch_all(sql, (root_panel_id,), dict_cursor=True)
    if isinstance(results, dict) and 'error' in results:
        return results

    if not results:
        return {"input:":[]}

    return {
        "input:": [
            [
                r["nando_id"],
                r["panel_id"],
                r["sortfield_en"],
                r["sortfield_ja"]
            ]
            for r in results
        ]
    }

# called at admin group panel
def api_psn_get_panel_by_name(input_text):

    keywords = input_text.replace(u'　', u' ').split()
    if not keywords:
        return []

    like_params = [f"%{k}%" for k in keywords]

    search_fields = [
        "panel_name_en",
        "panel_synonym_en",
        "notification_number",
        "panel_name_ja",
        "panel_synonym_ja"
    ]

    where_blocks = []
    sql_params = []
    for field in search_fields:
        conditions = []
        for _ in keywords:
            conditions.append(f"{field} COLLATE utf8mb4_unicode_ci LIKE %s")
        where_blocks.append("(" + " AND ".join(conditions) + ")")
        sql_params.extend(like_params)

    where_skip = "panel_id NOT IN (%s, %s, %s) AND nando_id NOT LIKE %s"
    SKIP_LIST = [ROOT_NANDO_ID_ALL, ROOT_NANDO_ID_SPECIFIED, ROOT_NANDO_ID_UNSPECIFIED, "NANDO:11%"]
    sql_params = SKIP_LIST + sql_params

    sql = f"""
    SELECT
        panel_id, panel_name_ja as panel_name, notification_number
    FROM
        panelsearch_nando_panel 
    WHERE
        ({where_skip}) AND ({' OR '.join(where_blocks)})
    ORDER BY
        panel_name_ja
    """

    return fetch_all(sql, sql_params, dict_cursor=True)


# called at panel list
def api_psn_get_panel_id_match_panel_name_synonym(
    r_sort, r_dir, r_lang, r_root_panel_id, input_text
):

    sort_col = SORT_COLUMN_MAP.get((r_lang, r_sort), 'sortfield_ja')
    #print(repr(input_text))
    keywords = input_text.replace(u'　', u' ').split()
    #print(keywords)
    like_params = [f"%{k}%" for k in keywords]
    #print(like_params)
    search_fields = [
        "A.panel_name_en",
        "A.panel_synonym_en",
        "A.notification_number"
    ]

    if r_lang == 'ja':
        search_fields.extend([
            "A.panel_name_ja",
            "A.panel_synonym_ja"
        ])

    where_blocks = []
    sql_params = []

    for field in search_fields:
        conditions = []
        for _ in keywords:
            conditions.append(f"{field} COLLATE utf8mb4_unicode_ci LIKE %s")
        where_blocks.append("(" + " AND ".join(conditions) + ")")
        sql_params.extend(like_params)

    sql = f"""
    SELECT DISTINCT
        A.nando_id,
        A.panel_id,
        LOWER(A.panel_name_en) AS sortfield_en,
        A.panel_name_ja AS sortfield_ja
    FROM
        panelsearch_nando_panel A
    JOIN
        panelsearch_nando_panel_descendant B
        ON B.descendant_panel_id = A.panel_id
    WHERE
        B.panel_id = %s
        AND ( {' OR '.join(where_blocks)} )
    ORDER BY
        {sort_col} {r_dir}
    """

    sql_params.insert(0, r_root_panel_id)

    results = fetch_all(sql, sql_params, dict_cursor=True)
    print(sql)
    if isinstance(results, dict) and 'error' in results:
        return results

    return {
        'input:': [[row['nando_id'], row['panel_id']] for row in results]
    }

# called at panel list
def api_psn_get_panel_id_match_gene_symbol_ncbiid(r_lang, r_sort,r_dir,r_root_panel_id,input_text):

    sort_col = SORT_COLUMN_MAP.get((r_lang, r_sort), 'sortfield_ja')

    keywords = input_text.replace(u'　', u' ').split()

    like_conditions = []
    sql_params = []

    for _ in keywords:
        like_conditions.append(
            "A.gene_symbols COLLATE utf8mb4_unicode_ci LIKE %s"
        )

    sql_params.extend([f"%{k}%" for k in keywords])

    sql = f"""
    SELECT DISTINCT
        A.nando_id,
        A.panel_id,
        LOWER(A.panel_name_en) AS sortfield_en,
        A.panel_name_ja AS sortfield_ja
    FROM
        panelsearch_nando_panel A
    JOIN
        panelsearch_nando_panel_descendant B
        ON B.descendant_panel_id = A.panel_id
    WHERE
        B.panel_id = %s
        AND ( {' AND '.join(like_conditions)} )
    ORDER BY
        {sort_col} {r_dir}
    """

    sql_params.insert(0, r_root_panel_id)

    results = fetch_all(sql, sql_params, dict_cursor=True)
    if isinstance(results, dict) and 'error' in results:        
        return results   

    return {
        'input:': [[row['nando_id'], row['panel_id']] for row in results]
    }

###
# for panel version
###

# get all of the version for all changes of this panel
def api_psn_get_panel_version_info(panel_id, r_lang):
    pv_name_col = 'p.panel_name_ja' if r_lang == 'ja' else 'p.panel_name_en'
    sql = f"""
    SELECT DISTINCT
        pc.panel_change_id,
        pv.major_version, 
        pv.minor_version, 
        concat(pv.major_version, '.', pv.minor_version,'(',{pv_name_col},')') as panel_version, 
        pc.created_at, 
        pv.root_panel_id,
        pc.comment
    FROM panelsearch_nando_panel_change pc
    JOIN panelsearch_nando_panel_change_panel_version pcpv
        ON pc.panel_change_id=pcpv.panel_change_id
    JOIN panelsearch_nando_panel_version pv
        ON pcpv.panel_version_id=pv.panel_version_id
    JOIN panelsearch_nando_panel p
        ON pv.root_panel_id=p.panel_id
    WHERE pc.panel_id = %s AND pv.is_deleted = %s
    ORDER BY pc.panel_change_id DESC
    """

    rows = fetch_all(sql,(panel_id, ENUM_VAL_NO),dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:        
        return rows   

    if rows:
        results = combine_row_version(rows, 'panel_change_id')
        return sorted(
            results,
            key=lambda x: x['panel_change_id'],
            reverse=True
        )
    else:
        return rows


# get all of the latest version for indicated panel
def _get_newest_panel_version(panel_id,dic_cursor):

    sql_sel = """
        SELECT DISTINCT
            A.panel_version_id
        FROM 
            panelsearch_nando_panel_version A
        JOIN 
            panelsearch_nando_panel_version_root_trace B
            ON A.root_panel_id=B.root_panel_id
        WHERE 
            B.panel_id=%s and A.is_latest=%s
    """
    dic_cursor.execute(sql_sel,(panel_id,ENUM_VAL_YES))
    return list(dic_cursor.fetchall())


def _get_newest_root_panel_version(root_panel_id,dic_cursor):

    dic_cursor.execute(
        """
        SELECT 
            panel_version_id, major_version, minor_version
        FROM 
            panelsearch_nando_panel_version
        WHERE 
            root_panel_id=%s and is_latest=%s
        """,
        (root_panel_id,ENUM_VAL_YES)
    )
    return dic_cursor.fetchone()


def set_panel_version_outdated(panel_version_id, dic_cursor):

    dic_cursor.execute(
        """
        UPDATE panelsearch_nando_panel_version
        SET is_latest=%s, modified_at=NOW()
        WHERE panel_version_id=%s
        """,
        (ENUM_VAL_NO, panel_version_id)
    ) 


def do_root_panel_minor_version_upgrade(root_panel_id,increment, comment, update_type, dic_cursor):

    former_version = _get_newest_root_panel_version(root_panel_id, dic_cursor)

    dic_cursor.execute(
        """
        INSERT INTO panelsearch_nando_panel_version
            (root_panel_id, major_version, minor_version, comment, update_type)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            root_panel_id, 
            former_version['major_version'], 
            former_version['minor_version'] + increment, 
            comment, 
            update_type
        )
    )

    set_panel_version_outdated(former_version['panel_version_id'], dic_cursor)


###
# panel  change
###

# if this change effect the panel version, then this must be called after the panel version change.
def record_panel_change(panel_id, change_category, target_change_id, user_id, comment, dic_cursor):

    dic_cursor.execute(
        """
        INSERT INTO panelsearch_nando_panel_change
            (panel_id, change_category, target_change_id, changed_by, comment)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (panel_id, change_category, target_change_id, user_id, comment)
    )

    panel_change_id = dic_cursor.lastrowid

    pv_list = _get_newest_panel_version(panel_id, dic_cursor)

    sql= """
    INSERT INTO panelsearch_nando_panel_change_panel_version 
    (panel_change_id,panel_version_id)
    VALUES (%s,%s)
    """

    data = [
        (panel_change_id, item['panel_version_id'])
        for item in pv_list
    ]

    dic_cursor.executemany(sql, data)

    return panel_change_id


###
# panel version change
###
def _psn_panel_version_minor_up(
    panel_id, user_id, panel_change_category, update_type, target_change_id, comment, dic_cursor
):

    dic_cursor.execute(
        """
        SELECT *
        FROM panelsearch_nando_panel_version_root_trace
        WHERE panel_id = %s
        """,
        (panel_id, )
    )
    version_traces = list(dic_cursor.fetchall())

    if version_traces[0]['root_panel_id'] == panel_id and version_traces[0]['l2_root_panel_id'] == panel_id:
        # this is the l2 panel change without subpanel, just do minor version upgrade for this panel
        do_root_panel_minor_version_upgrade(panel_id, 1, comment, update_type, dic_cursor)
        panel_change_id = record_panel_change(panel_id, panel_change_category, target_change_id, user_id, comment, dic_cursor)
        return panel_change_id

    l3_panel_hash ={}
    l2_panel_hash = {}
    for vt in version_traces:
        if vt['root_panel_id'] in l3_panel_hash:
            l3_panel_hash[vt['root_panel_id']] += 1
        else:
            l3_panel_hash[vt['root_panel_id']] = 1

        if vt['l2_root_panel_id'] in l2_panel_hash:
            l2_panel_hash[vt['l2_root_panel_id']] += 1
        else:
            l2_panel_hash[vt['l2_root_panel_id']] = 1

    for l3_panel_id, count in l3_panel_hash.items():
        version_comment = comment if l3_panel_id == panel_id else f"subpanel({panel_id}):{comment}"
        do_root_panel_minor_version_upgrade(
            l3_panel_id, count, version_comment, update_type, dic_cursor
        )

    for l2_panel_id, count in l2_panel_hash.items():
        version_comment = f"subpanel({panel_id}):{comment}"
        do_root_panel_minor_version_upgrade(
            l2_panel_id, count, version_comment, update_type, dic_cursor
        )

    #
    # record panel changes, this must be after the version upgrade, to make sure the change record is linked to the newest version
    #
    panel_change_id = record_panel_change(
        panel_id, panel_change_category, target_change_id, user_id, comment, dic_cursor
    )

    for l3_panel_id in l3_panel_hash.keys():
        if l3_panel_id != panel_id:
            record_panel_change(
                l3_panel_id, 
                PANEL_CHANGE_CATEGORY_SUBPANEL, 
                panel_change_id, 
                user_id, 
                f"subpanel({panel_id}):{comment}", 
                dic_cursor
        )

    for l2_panel_id in l2_panel_hash.keys():
        record_panel_change(
            l2_panel_id, 
            PANEL_CHANGE_CATEGORY_SUBPANEL, 
            panel_change_id, 
            user_id, 
            f"subpanel({panel_id}):{comment}", 
            dic_cursor
        )

    return panel_change_id


###
# for review
###

# construct entity data by input field at client input
def build_review_fields(entity_type_id, data):
    extra = {}
    gene_symbol = None
    gene_id = None
    entity_name = data.get("input_review_entity_name")

    if entity_type_id in (ENTITY_TYPE_ID_GENE, ENTITY_TYPE_ID_STR):
        gene_list = data.get("input_review_gene_symbol") or ""
        parts = gene_list.split(",")
        gene_id, gene_symbol = parts[0], parts[1]

    if entity_type_id == ENTITY_TYPE_ID_GENE:
        entity_name = gene_symbol

    if entity_type_id == ENTITY_TYPE_ID_STR:
        extra.update({
            "position_chromosome":    data.get("input_review_position_chromosome"),
            "position_grch37_start":  data.get("input_review_position_grch37_start"),
            "position_grch37_end":    data.get("input_review_position_grch37_end"),
            "position_grch38_start":  data.get("input_review_position_grch38_start"),
            "position_grch38_end":    data.get("input_review_position_grch38_end"),
            "str_repeated_sequence":  data.get("input_review_str_repeated_sequence"),
            "str_normal_repeats":     data.get("input_review_str_normal_repeats"),
            "str_pathogenic_repeats": data.get("input_review_str_pathogenic_repeats"),
        })

    if entity_type_id == ENTITY_TYPE_ID_REGION:
        extra.update({
            "position_chromosome":                data.get("input_review_position_chromosome"),
            "position_grch37_start":              data.get("input_review_position_grch37_start"),
            "position_grch37_end":                data.get("input_review_position_grch37_end"),
            "position_grch38_start":              data.get("input_review_position_grch38_start"),
            "position_grch38_end":                data.get("input_review_position_grch38_end"),
            "region_haploinsufficiency_score":    data.get("input_review_region_haploinsufficiency_score"),
            "region_triplosensitivity_score":     data.get("input_review_region_triplosensitivity_score"),
            "region_required_overlap_percentage": data.get("input_review_region_required_overlap_percentage"),
            "region_variant_type":                data.get("input_review_region_variant_type"),
            "region_verbose_name":                data.get("input_review_region_verbose_name"),
        })

    return {
        "gene_symbol": gene_symbol,
        "gene_id":     gene_id,
        "entity_name": entity_name,
        "extra":       extra
    }


# get former review data
def get_former_review(cursor, review_id):
    cursor.execute(
        """
        SELECT A.* 
        FROM panelsearch_nando_entity_review A 
        JOIN panelsearch_nando_entity_review B 
            ON A.original_review_id=B.original_review_id 
        WHERE 
            B.review_id=%s AND A.is_latest=%s    
        """,
        (review_id,ENUM_VAL_YES)
    )
    return cursor.fetchone()


# insert new review 
def insert_entity_review(cursor, fields: dict):
    cols = ", ".join(f"`{k}`" for k in fields.keys())
    vals = ", ".join(["%s"] * len(fields))
    sql = f"""
        INSERT INTO panelsearch_nando_entity_review ({cols})
        VALUES ({vals})
    """
    cursor.execute(sql, list(fields.values()))
    return cursor.lastrowid


# set the former review to be invalid
def set_review_outdated(cursor, review_id):
    cursor.execute(
        """
        UPDATE 
            panelsearch_nando_entity_review 
        SET 
            is_latest=%s, modified_at=NOW() 
        WHERE
            review_id=%s
        """,
        (ENUM_VAL_NO, review_id)
    )


#
# delete all reviews with the same original_review
# 
def delete_review(cursor, original_review_id):
    cursor.execute(
        """
        UPDATE 
            panelsearch_nando_entity_review 
        SET 
            is_latest=%s, is_deleted=%s, modified_at=NOW() 
        WHERE 
            original_review_id=%s
        """,
        (ENUM_VAL_NO, ENUM_VAL_YES, original_review_id)
    )


# for the new inserted review, set it to be the original review
def set_original_review_id(cursor, review_id):
    cursor.execute(
        """
        UPDATE 
            panelsearch_nando_entity_review 
        SET 
            original_review_id=%s 
        WHERE 
            review_id=%s
        """,
        (review_id, review_id)
    )


# add a new review comment
def insert_review_comment(cursor, review_id, original_review_id, comment, created_at):

    cols = ['review_id', 'original_review_id', 'comment']
    parms = [review_id, original_review_id, comment]

    if created_at:
        cols.append('created_at')
        parms.append(created_at)

    sql = f"""
        INSERT INTO panelsearch_nando_entity_review_comment
        ({','.join(cols)})
        VALUES ({','.join(['%s'] * len(parms))})
    """
    cursor.execute(sql,parms)
    return cursor.lastrowid


def get_review_comment_id_list(cursor,original_review_id):
    cursor.execute(
        """
        SELECT review_comment_id
        FROM panelsearch_nando_entity_review_comment
        WHERE is_latest = %s AND original_review_id = %s
        """,
        (ENUM_VAL_YES, original_review_id)
    )

    return [str(r["review_comment_id"]) for r in list(cursor.fetchall())]


#set the former review comment to be invalid(delete)
def set_review_comment_outdated(cur, review_comment_id):
    cur.execute(
        """
        UPDATE panelsearch_nando_entity_review_comment
        SET is_latest=%s, modified_at=NOW()
        WHERE review_comment_id=%s
        """,
        (ENUM_VAL_NO, review_comment_id)
    )


#
# delete all reviews with the same original_review
# 
def delete_all_review_comment(cursor, original_review_id):
    cursor.execute(
        """
        UPDATE 
            panelsearch_nando_entity_review_comment 
        SET 
            is_latest=%s, is_deleted=%s, modified_at=NOW() 
        WHERE 
            original_review_id=%s
        """,
        (ENUM_VAL_NO, ENUM_VAL_YES, original_review_id)
    )


def record_review_panel_version(review_id,panel_version_info_arr, cur):

    sql= """
    INSERT INTO panelsearch_nando_entity_review_panel_version 
    (review_id,panel_version_id)
    VALUES (%s,%s)
    """

    data = [
        (review_id, item['panel_version_id'])
        for item in panel_version_info_arr
    ]

    if data:
        cur.executemany(sql, data)


# add or modify review
# for modification: set the former one to be invalid 
def api_psn_regist_review(user_id, data):

    panel_id         = data.get("input_review_panel_id")
    former_review_id = data.get("input_review_review_id")
    entity_type_id   = data.get("input_review_entity_type_id")
    comment          = data.get("input_review_comment")

    entity_fields = build_review_fields(entity_type_id, data)

    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:

                base_fields = {
                    "panel_id":             panel_id,
                    "entity_type_id":       entity_type_id,
                    "entity_name":          entity_fields["entity_name"],
                    "gene_symbol":          entity_fields.get("gene_symbol"),
                    "gene_id":              entity_fields.get("gene_id"),
                    "is_from_user":         data.get("input_review_is_from_user"),
                    "user_id":              user_id,
                    "rating_id":            data.get("input_review_rating_id"),
                    "phenotypes":           data.get("input_review_phenotype"),
                    "publications":         data.get("input_review_publications"),
                    "mode_of_inheritances": data.get("input_review_mode_of_inheritances"),
                    **entity_fields["extra"]
                }

                former_data = None
                original_review_id = None
                if former_review_id:
                    former_data = get_former_review(cursor, former_review_id)
                    if not former_data:
                        return {'error': 'the review to be modified was not found.'}
                    base_fields["created_at"] = former_data["created_at"]
                    base_fields["original_review_id"] = former_data["original_review_id"]
                    original_review_id = former_data["original_review_id"]
                else:
                    base_fields["original_review_id"] = None

                new_review_id = insert_entity_review(cursor, base_fields)
                if former_review_id:
                    # for modify review, set the former review
                    set_review_outdated(cursor, former_data["review_id"])
                else:
                    # for add new review, set the original_review_id column with the new review id
                    set_original_review_id(cursor, new_review_id)
                    original_review_id = new_review_id

                newest_panel_version_info_arr = _get_newest_panel_version(panel_id,cursor)
                record_review_panel_version(new_review_id,newest_panel_version_info_arr, cursor)

                new_review_comment_id = None
                if comment:
                    new_review_comment_id = insert_review_comment(cursor, new_review_id, original_review_id, comment, None)
                new_data = dict(base_fields)
                new_data["review_id"]          = new_review_id
                new_data["original_review_id"] = original_review_id
                new_data["review_comment_id"]  = new_review_comment_id
                if comment:
                    new_data["comment"] = comment

                action = USER_ACTIVITY_ACTION_ADD if former_data is None else USER_ACTIVITY_ACTION_CHANGE
                activity_id = add_user_activity_log(cursor, user_id, former_data, new_data, USER_ACTIVITY_TARGET_REVIEW, action)
                record_user_activity_panel_version(activity_id, newest_panel_version_info_arr, cursor)

            conn.commit()
            return {'success': True}
        
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}
        
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def build_review_sql(join_sql="", join_params=None, where_sql="", where_params=None, order_sql=""):
    """
    返回 (sql, params)
    """

    sql = f"""
    SELECT DISTINCT
        r.review_id,
        r.original_review_id,
        r.user_id,
        r.panel_id,
        
        concat(rpvpv.major_version, '.', rpvpv.minor_version,'(',rpvpvp.panel_name_ja,')') AS panel_version,

        p.nando_id,
        p.panel_name_ja AS panel_name,
        p.panel_name_ja,
        p.panel_name_en,
        p.type AS panel_type,
        p.depth AS panel_depth,

        r.gene_symbol,
        r.gene_id,
        r.entity_type_id,
        r.entity_name,
        r.is_from_user,

        r.rating_id,
        rt.rating_name AS rating,

        r.mode_of_inheritances,
        r.phenotypes,
        r.publications,

        r.is_latest,
        r.created_at,
        r.modified_at,
        UNIX_TIMESTAMP(r.modified_at) AS modified_at_int,

        u.user_type,
        u.first_name_en,
        u.last_name_en,
        u.affiliation,
        u.job_title,

        r.position_chromosome,
        r.position_grch37_start,
        r.position_grch37_end,
        r.position_grch38_start,
        r.position_grch38_end,
        r.str_repeated_sequence,
        r.str_normal_repeats,
        r.str_pathogenic_repeats,
        r.region_haploinsufficiency_score,
        r.region_triplosensitivity_score,
        r.region_required_overlap_percentage,
        r.region_variant_type,
        r.region_verbose_name

    FROM panelsearch_nando_entity_review r
    INNER JOIN panelsearch_nando_panel p
        ON r.panel_id = p.panel_id
    INNER JOIN panelsearch_nando_entity_rating rt
        ON r.rating_id = rt.rating_id
    INNER JOIN panelsearch_nando_entity_review_panel_version rpv
        ON r.review_id = rpv.review_id
    INNER JOIN panelsearch_nando_panel_version rpvpv
        ON rpv.panel_version_id = rpvpv.panel_version_id
    INNER JOIN panelsearch_nando_panel rpvpvp
        ON rpvpv.root_panel_id = rpvpvp.panel_id
    INNER JOIN user_info_psn u
        ON r.user_id = u.id AND u.status IN (%s, %s)
    {join_sql} 
    """

    params = [STATUS_PASSED, STATUS_PASSED_TO_GO]

    if join_params:
        params.extend(join_params)

    if where_sql:
        sql += f"\nWHERE {where_sql}"

    if where_params:
            params.extend(where_params)

    if order_sql:
        sql += f"\nORDER BY {order_sql}"

    return sql, params


# load all newest review for panel and its descendant
def api_psn_get_panel_review(panel_id):

    sql, params = build_review_sql(
        join_sql="""
            JOIN panelsearch_nando_panel_descendant pd 
                ON pd.descendant_panel_id = r.panel_id AND pd.panel_id = %s
        """,
        join_params=[panel_id],
        where_sql="r.is_latest = %s",
        where_params=[ENUM_VAL_YES]
    )

    rows = fetch_all(sql, params, dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:
        return rows
   
    if rows: 
        return combine_row_version(rows,'review_id')
    else:
        return rows


#load all newest reviews created by indicated user
def api_psn_get_user_review(user_id):

    sql, params = build_review_sql(
        where_sql="r.user_id = %s AND r.is_latest = %s",
        where_params=[user_id, ENUM_VAL_YES]
    )

    rows = fetch_all(sql, params, dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:
        return rows
   
    if rows: 
        return combine_row_version(rows,'review_id')
    else:
        return rows

#load both new and old reviews for indicated panel entity
def api_psn_get_panel_entity_review(panel_id,entity_type_id,entity_name):
   
    sql, params = build_review_sql(
        where_sql="""
            r.panel_id = %s AND 
            r.entity_type_id = %s AND 
            r.entity_name = %s AND 
            r.is_deleted = %s
        """,
        where_params=[
            panel_id, 
            entity_type_id, 
            entity_name, 
            ENUM_VAL_NO
        ]
    )

    rows = fetch_all(sql, params, dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:
        return rows
    
    if rows: 
        return combine_row_version(rows,'review_id')
    else:
        return rows


def _get_newest_panel_review_info(original_review_id, dict_cursor):
    dict_cursor.execute(
        """
        SELECT * FROM panelsearch_nando_entity_review
        WHERE original_review_id = %s AND is_latest = %s
        """,
        (original_review_id, ENUM_VAL_YES)
    )

    return dict_cursor.fetchone()


# delete review
def api_psn_delete_panel_entity_review(user_id, data):

    review_id = data.get('review_id')
    if not review_id:
        return {"error": "review_id is required"}
    
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cur:

                former_data = get_former_review(cur, review_id)
                if not former_data:
                    return {"error": "The review to be deleted was not found or already deleted"}
                                
                original_review_id = former_data['original_review_id']

                comment_ids = get_review_comment_id_list(cur, original_review_id)

                if len(comment_ids) > 0:
                    former_data["comment_ids"] = ",".join(comment_ids)

                delete_review(cur, original_review_id)
                delete_all_review_comment(cur,original_review_id)

                newest_panel_version_info_arr = _get_newest_panel_version(former_data["panel_id"], cur)
                activity_id = add_user_activity_log(
                    cur, 
                    user_id, 
                    former_data, 
                    None, 
                    USER_ACTIVITY_TARGET_REVIEW, 
                    USER_ACTIVITY_ACTION_DELETE
                )

                record_user_activity_panel_version(activity_id, newest_panel_version_info_arr, cur)
                conn.commit()

                return {"suceed": 'done'}
            
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}


###
# review comment
###
def _fetch_entity_review_comments(where_sql, params):
    sql = f"""
    SELECT
        t1.review_id,
        t1.original_review_id,
        t1.user_id,
        t1.panel_id,
        concat(pv.major_version, '.',pv.minor_version, '(', p.panel_name_ja, ')') as panel_version,
        t1.entity_type_id,
        t1.entity_name,
        t1.is_from_user,
        t4.review_comment_id,
        t4.comment,
        t4.created_at AS comment_created_at,
        UNIX_TIMESTAMP(t4.created_at) AS comment_created_at_int,
        t4.modified_at AS comment_modified_at,
        UNIX_TIMESTAMP(t4.modified_at) AS comment_modified_at_int
    FROM
        panelsearch_nando_entity_review AS t1
    INNER JOIN
        user_info_psn AS t2
            ON t1.user_id = t2.id AND t2.status IN (%s, %s)
    INNER JOIN
        panelsearch_nando_entity_review_panel_version t3
            ON t1.review_id=t3.review_id
    INNER JOIN
        panelsearch_nando_panel_version AS pv
            ON t3.panel_version_id = pv.panel_version_id 
    INNER JOIN 
        panelsearch_nando_panel AS p
            ON pv.root_panel_id = p.panel_id
    INNER JOIN
        panelsearch_nando_entity_review_comment AS t4
            ON t1.review_id = t4.review_id AND t4.is_latest = %s
    WHERE
        {where_sql}
    ORDER BY
        t4.created_at DESC
    """

    base_params = [
        STATUS_PASSED,
        STATUS_PASSED_TO_GO,
        ENUM_VAL_YES
    ]

    rows = fetch_all(sql, base_params + params, dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:
        return rows

    if rows:
        results = combine_row_version(rows,'review_comment_id')
        
        # sort the result by comment_created_at_int in descending order
        return sorted(
            results,
            key=lambda x: x['review_comment_id'],
            reverse=True
        )
    else:
        return rows

def api_psn_get_user_review_comment(user_id):
    where_sql = "t1.user_id = %s"
    params = [user_id]
    return _fetch_entity_review_comments(where_sql, params)


def api_psn_get_panel_entity_review_comment(panel_id,entity_type_id,entity_name):

    where_sql = """
        t1.panel_id = %s AND
        t1.entity_type_id = %s AND
        t1.entity_name = %s
    """
    params = [
        panel_id,
        entity_type_id,
        entity_name
    ]

    return _fetch_entity_review_comments(where_sql, params)


def _get_panel_entity_review_comment_info(review_comment_id,cur):
    cur.execute(
        """
        SELECT review_comment_id, comment, created_at
        FROM   panelsearch_nando_entity_review_comment
        WHERE  review_comment_id = %s AND is_latest = %s
        """,
        (review_comment_id,ENUM_VAL_YES)
    )
    return  cur.fetchone()


def _copy_panel_entity_review(original_review_id, cur):

    former_review = _get_newest_panel_review_info(original_review_id, cur)
    if not former_review:
        return None,None

    new_review = copy.copy(former_review)
    del new_review['review_id']
    del new_review['modified_at']

    new_review['review_id'] = insert_entity_review(cur, new_review)

    set_review_outdated(cur, former_review['review_id'])

    return former_review, new_review


def api_psn_add_panel_entity_review_comment(user_id, review_id, original_review_id, new_comment):
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cur:

                former_review, new_review = _copy_panel_entity_review(original_review_id, cur)
                if not former_review:
                    return {"error": f"the indicated review(id:{review_id},oid:{original_review_id}) was not found"}

                newest_panel_version_info_arr = _get_newest_panel_version(new_review["panel_id"],cur)
                record_review_panel_version(new_review["review_id"],newest_panel_version_info_arr, cur)

                #insert review comment to review comment table
                review_comment_id = insert_review_comment(
                    cur, new_review['review_id'], original_review_id, new_comment, None
                )

                former_review['comment'] = None
                former_review['review_comment_id'] = None
                
                new_review['comment'] = new_comment
                new_review['review_comment_id'] = review_comment_id

                activity_id = add_user_activity_log(
                    cur, 
                    user_id, 
                    former_review, 
                    new_review, 
                    USER_ACTIVITY_TARGET_REVIEW, 
                    USER_ACTIVITY_ACTION_CHANGE
                )
                record_user_activity_panel_version(activity_id, newest_panel_version_info_arr, cur)

                conn.commit()
                return {"suceed": 'done', 'review_comment_id': review_comment_id}

        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}


def api_psn_modify_panel_entity_review_comment(user_id, review_id, original_review_id, review_comment_id, new_comment):

    if not review_comment_id:
        return {'error': 'insufficent parameter review_comment_id'}
    if not new_comment:
        return {'error': 'comment is empty'}
    
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cur:

                former_review_comment = _get_panel_entity_review_comment_info(review_comment_id, cur)
                if not former_review_comment:
                    return {"error": f"the review comment(id:{review_comment_id}) to be modified was not found."}

                former_review, new_review = _copy_panel_entity_review(original_review_id, cur)
                if not former_review:
                    return {"error": f"the indicated review(id:{review_id},original_review_id:{original_review_id}) was not found"}

                newest_panel_version_info_arr = _get_newest_panel_version(new_review["panel_id"],cur)
                record_review_panel_version(new_review["review_id"],newest_panel_version_info_arr, cur)

                set_review_comment_outdated(cur, review_comment_id) 

                new_review_comment_id = insert_review_comment(
                    cur, new_review["review_id"], original_review_id, new_comment, former_review_comment["created_at"]
                ) 

                former_review["comment"] = former_review_comment['comment']
                former_review["review_comment_id"] = review_comment_id 

                new_review["comment"] = new_comment
                new_review["review_comment_id"] = new_review_comment_id

                activity_id = add_user_activity_log(
                    cur, 
                    user_id, 
                    former_review, 
                    new_review, 
                    USER_ACTIVITY_TARGET_REVIEW, 
                    USER_ACTIVITY_ACTION_CHANGE
                )
                record_user_activity_panel_version(activity_id, newest_panel_version_info_arr, cur)

                conn.commit()
                return {"suceed": 'done', 'review_comment_id': new_review_comment_id}
        
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}       
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}


def api_psn_delete_panel_entity_review_comment(user_id, review_id, original_review_id, review_comment_id):
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cur:

                former_review_comment = _get_panel_entity_review_comment_info(review_comment_id, cur)
                if not former_review_comment:
                    return {"error": f"the review comment(id:{review_comment_id}) to be deleted was not found."}

                former_review, new_review = _copy_panel_entity_review(original_review_id, cur)
                if not former_review:
                    return {"error": f"the indicated review(id:{review_id},oid:{original_review_id}) was not found"}

                newest_panel_version_info_arr = _get_newest_panel_version(new_review["panel_id"],cur)
                record_review_panel_version(new_review["review_id"],newest_panel_version_info_arr, cur)

                set_review_comment_outdated(cur, review_comment_id) 

                former_review['comment'] = former_review_comment['comment']
                former_review["review_comment_id"] = review_comment_id

                new_review['comment'] = None
                new_review['review_comment_id'] = None

                activity_id = add_user_activity_log(
                    cur, 
                    user_id, 
                    former_review, 
                    new_review, 
                    USER_ACTIVITY_TARGET_REVIEW, 
                    USER_ACTIVITY_ACTION_CHANGE
                )
                record_user_activity_panel_version(activity_id, newest_panel_version_info_arr, cur)
                conn.commit()
                return {"suceed": 'done'}
            
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}


###
# entity
###

#set the former review comment to be invalid(delete)
def set_entity_outdated(cur, entity_id):
    cur.execute(
        """
        UPDATE panelsearch_nando_entity
        SET is_latest=%s, modified_at=NOW()
        WHERE entity_id=%s
        """,
        (ENUM_VAL_NO, entity_id)
    )


def get_entity_by_id(cursor, entity_id):
    cursor.execute(
        f"""
        SELECT *
        FROM panelsearch_nando_entity
        WHERE entity_id = %s
        """,
        (entity_id,)
    )
    return cursor.fetchone()


def record_entity_panel_version(entity_id, panel_version_info_arr, cur):

    sql= """
    INSERT INTO panelsearch_nando_entity_panel_version 
    (entity_id,panel_version_id)
    VALUES (%s,%s)
    """

    data = [
        (entity_id, item['panel_version_id'])
        for item in panel_version_info_arr
    ]

    if data:
        cur.executemany(sql, data)


def api_psn_regist_panel_entity_definition(user_id, data):

    former_entity_id     = data.get('input_definition_review_id')
    panel_id             = data.get('input_definition_panel_id')
    gene_id              = data.get('input_definition_gene_id')
    gene_symbol          = data.get('input_definition_gene_symbol')
    entity_type_id       = data.get('input_definition_entity_type_id')
    entity_name          = data.get('input_definition_entity_name')
    is_from_user         = data.get('input_definition_is_from_user')
    rating_id            = data.get('input_definition_rating_id')
    phenotypes           = data.get('input_definition_phenotype')
    publications         = data.get('input_definition_publications')
    comment              = data.get('input_definition_comment')
    source               = data.get('input_definition_source')
    mode_of_inheritances = data.get('input_definition_mode_of_inheritances')

    if entity_type_id == ENTITY_TYPE_ID_GENE:
        entity_name = gene_symbol

    columns = [
        "panel_id",
        "gene_symbol",
        "gene_id",
        "entity_type_id",
        "entity_name",
        "is_from_user",
        "user_id",
        "rating_id",
        "phenotypes",
        "publications",
        "mode_of_inheritances",
        "comment",
        "source"
    ]

    values = [
        panel_id,
        gene_symbol,
        gene_id,
        entity_type_id,
        entity_name,
        is_from_user,
        user_id,
        rating_id,
        phenotypes,
        publications,
        mode_of_inheritances,
        comment,
        source
    ]

    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:

                former_data = None
                if former_entity_id:
                    former_data = get_entity_by_id(cursor, former_entity_id)

                col_str = ", ".join(f"`{c}`" for c in columns)
                placeholders = ", ".join(["%s"] * len(columns))

                insert_sql = f"""
                    INSERT INTO panelsearch_nando_entity ({col_str})
                    VALUES ({placeholders})
                """
                cursor.execute(insert_sql, values)
                new_entity_id = cursor.lastrowid

                # 2. delete old data
                if former_entity_id:
                    set_entity_outdated(cursor, former_entity_id)

                # 3. 构造 new_data（用于 activity log）
                new_data = dict(zip(columns, values))
                new_data['entity_id'] = new_entity_id


                action = (
                    USER_ACTIVITY_ACTION_ADD
                    if former_data is None
                    else USER_ACTIVITY_ACTION_CHANGE
                )

                activity_id = add_user_activity_log(
                    cursor,
                    user_id,
                    former_data,
                    new_data,
                    USER_ACTIVITY_TARGET_DEFINITION,
                    action
                )

                _psn_panel_version_minor_up(
                    panel_id, 
                    user_id,
                    PANEL_CHANGE_CATEGORY_ENTITY, 
                    PANEL_VERSION_UPDATE_TYPE_MINOR,
                    activity_id, 
                    f"entity({entity_name}) {'added' if former_data is None else 'modified'}",
                    cursor
                )

                panel_version_info_arr = _get_newest_panel_version(panel_id, cursor)
                record_entity_panel_version(new_entity_id, panel_version_info_arr, cursor)
                record_user_activity_panel_version(activity_id, panel_version_info_arr, cursor)

                conn.commit()
                return {'success': True}

        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}

        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_psn_get_multi_panel_entity_definition(nando_id_list,entity_type_id,entity_name):

    nando_ids = nando_id_list.split(',')

    placeholders = ",".join(["%s"] * len(nando_ids))

    sql = f"""
        SELECT A.panel_id, A.rating_id, B.rating_name
        FROM panelsearch_nando_entity as A
        JOIN panelsearch_nando_entity_rating as B
            ON A.rating_id = B.rating_id
        WHERE 
            A.is_latest = %s AND 
            A.entity_type_id = %s AND 
            A.entity_name = %s AND 
            A.panel_id IN ({placeholders})
    """

    params = [ENUM_VAL_YES, entity_type_id, entity_name] + nando_ids

    return fetch_all(sql, params, dict_cursor=True)


#
# load panel entity definition for panel or for panel entity
# for panel: load all newest definition for panel and its descendant
# for panel entity: load all definition(new and old) for indicated panel entity
#
def api_psn_get_panel_entity_definition(panel_id,entity_type_id,entity_name):

    sql = """
    SELECT DISTINCT
        e.entity_id as review_id,
        e.gene_symbol,
        e.gene_id,
        e.entity_type_id,
        e.entity_name,
        e.is_from_user,

        e.rating_id,
        r.rating_name AS rating,
        e.mode_of_inheritances,
        e.phenotypes,
        e.publications,
        e.source,
        e.comment,

        e.is_latest,
        e.user_id,
        e.created_at,

        e.panel_id,
        p.nando_id,
        p.panel_name_ja AS panel_name,
        p.panel_name_ja,
        p.panel_name_en

    FROM panelsearch_nando_entity e
    INNER JOIN panelsearch_nando_panel p
        ON e.panel_id = p.panel_id
    INNER JOIN panelsearch_nando_entity_rating r
        ON e.rating_id = r.rating_id
    """

    params = []

    # 精确匹配（单 panel + entity）
    # return both the latest and the former data
    if entity_type_id and entity_name:
        sql += """
        WHERE
            e.panel_id = %s AND 
            e.entity_type_id = %s AND 
            e.entity_name = %s
        """
        params.extend([panel_id, entity_type_id, entity_name])

    # 子 panel 全部展开
    # only return the latest
    else:
        sql += """
        INNER JOIN panelsearch_nando_panel_descendant pd
            ON pd.descendant_panel_id = e.panel_id AND pd.panel_id = %s
        WHERE
            e.is_latest = %s 
        """
        params.extend([panel_id,ENUM_VAL_YES])

    sql += " ORDER BY e.created_at DESC"

    return fetch_all(sql, params, dict_cursor=True)


####
#
# functions for group operation.
#
####

def api_psn_group_add_group(group_title, user_id):
    result = execute_sql(
        """
        INSERT INTO panelsearch_nando_group
            (group_title, created_by)
        VALUES
            (%s, %s)
        """,
        (group_title, user_id)
    )

    if 'error' in result:
        return result
    else:
        group_id = result["lastrowid"]
        return {"suceed": 'done', 'group_id': group_id}


def api_psn_group_update_group(group_id, group_title):
    result = execute_sql(
        """
        UPDATE panelsearch_nando_group 
        SET group_title=%s  
        WHERE group_id=%s
        """,
        (group_title, group_id)
    )
    if 'error' in result:
        return result
    elif result["rowcount"] == 0:
        return {"error": "the group to be modified was not found"}
    else:
        return {"suceed": 'done'}


def api_psn_group_delete_group(group_id):
    result = execute_sql(
        """
        UPDATE panelsearch_nando_group 
        SET isValid=%s 
        WHERE group_id=%s AND isValid = %s
        """,
        (ENUM_VAL_NO, group_id, ENUM_VAL_YES)
    )
    if 'error' in result:
        return result
    else:
        return {"suceed": 'done'}


def api_psn_group_get_group(user_type_or_role, user_id):
    if api_is_user_admin(user_type_or_role):
        return fetch_all(
            """
            SELECT 
                g.group_id,
                g.group_title,
                COUNT(u.user_id) AS num_of_users
            FROM
                panelsearch_nando_group AS g
            LEFT JOIN
                panelsearch_nando_group_user AS u
                ON g.group_id = u.group_id
            WHERE
                g.isValid = %s
            GROUP BY
                g.group_id, g.group_title
            ORDER BY
                g.group_title COLLATE utf8mb4_unicode_ci ASC
            """,
            (ENUM_VAL_YES,),
            dict_cursor=True
            )
    else:
        return fetch_all(
            """
            SELECT
                g.group_id,
                g.group_title,
                COUNT(u.user_id) AS num_of_users
            FROM
                panelsearch_nando_group AS g
            LEFT JOIN
                panelsearch_nando_group_user AS u
                ON g.group_id = u.group_id
            WHERE
                g.isValid = %s
                AND g.group_id IN (
                    SELECT group_id
                    FROM panelsearch_nando_group_user
                    WHERE user_id = %s
                      AND user_role = %s
                )
            GROUP BY
                g.group_id, g.group_title
            ORDER BY
                g.group_title COLLATE utf8mb4_unicode_ci ASC
            """,
            (ENUM_VAL_YES, user_id, GROUP_USER_ROLE_CURATOR),
            dict_cursor=True
        )
    
    return []


def api_psn_group_get_group_hash():
    rows = fetch_all(
        """
        SELECT group_id, group_title 
        FROM panelsearch_nando_group 
        WHERE isValid=%s
        """,
        (ENUM_VAL_YES,),
        dict_cursor=True
    )

    return {row["group_id"]: row["group_title"] for row in rows}


def api_psn_group_add_group_user(admin_user_id, group_id, user_ids):
    if not user_ids:
        return {"suceed": "done", "added": 0}
    
    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:

                values = [(group_id, uid, GROUP_USER_ROLE_REVIEWER) for uid in user_ids]

                cur.executemany(
                    """
                    INSERT IGNORE INTO panelsearch_nando_group_user
                        (group_id,user_id,user_role)
                    VALUES 
                        (%s,%s,%s)
                    """, 
                    values
                )

                for user_id in user_ids:
                    add_group_activity_log(
                        cur,
                        group_id,
                        admin_user_id,
                        user_id,
                        GROUP_ACTIVITY_ACTION_ADD,
                        None,
                        GROUP_USER_ROLE_REVIEWER
                    )

            conn.commit()
            return {"suceed": 'done'}
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_psn_group_delete_group_user(admin_user_id, group_id, user_ids):
    if not user_ids:
        return {"suceed": "done", "removed": 0}

    placeholders = ",".join(["%s"] * len(user_ids))
    params = [group_id] + user_ids

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    DELETE FROM panelsearch_nando_group_user
                    WHERE group_id = %s
                        AND user_id IN ({placeholders})
                    """,
                    params
                )
                removed_count = cur.rowcount
                if removed_count > 0:
                    for user_id in user_ids:
                        add_group_activity_log(
                            cur, 
                            group_id, 
                            admin_user_id, 
                            user_id, 
                            GROUP_ACTIVITY_ACTION_REMOVE, 
                            None, 
                            None
                        )

            conn.commit()
            return {"suceed": 'done',  "removed": removed_count}
        
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}

        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_psn_group_change_group_user_role(admin_user_id, group_id, group_user_id, user_role_to):
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cur:

                # 1. 查询当前角色
                cur.execute(
                    """
                    SELECT user_role
                    FROM panelsearch_nando_group_user
                    WHERE group_id = %s AND user_id = %s
                    """,
                    (group_id, group_user_id)
                )
                row = cur.fetchone()
                if not row:
                    return {"error": "group user not found"}

                user_role_from = row["user_role"]

                # 2. 角色未变化，直接返回
                if user_role_from == user_role_to:
                    return {"suceed": "done", "changed": False}

                # 3. 更新角色
                cur.execute(
                    """
                    UPDATE panelsearch_nando_group_user
                    SET user_role = %s
                    WHERE group_id = %s AND user_id = %s
                    """,
                    (user_role_to, group_id, group_user_id)
                )

                if cur.rowcount == 0:
                    return {"error": "role update failed"}

                # 4. 记录日志
                add_group_activity_log(
                    cur,
                    group_id,
                    admin_user_id,
                    group_user_id,
                    GROUP_ACTIVITY_ACTION_CHANGE,
                    user_role_from,
                    user_role_to
                )

            conn.commit()
            return {"suceed": "done", "changed": True}

        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {"error": str(e)}
        except Exception as e:
            conn.rollback()
            return {"error": str(e)}


def get_group_user_relation_hash(
    *,
    key_by="group",          # "group" | "user"
    user_type=None,
    current_user_id=None
):
    """
    key_by="group":
        { group_id: { user_id: user_role } }

    key_by="user":
        { user_id: { group_id: user_role } }
    """

    if key_by not in ("group", "user"):
        raise ValueError("key_by must be 'group' or 'user'")

    result = defaultdict(dict)

    sql = """
    SELECT
        gu.group_id,
        gu.user_id,
        gu.user_role
    FROM
        panelsearch_nando_group_user AS gu
    INNER JOIN
        panelsearch_nando_group AS g
            ON gu.group_id = g.group_id
            AND g.isValid = %s
    INNER JOIN
        user_info_psn AS u
            ON gu.user_id = u.id
            AND u.status IN (%s, %s)
    """

    params = [ENUM_VAL_YES, STATUS_PASSED, STATUS_PASSED_TO_GO]

    # only those groups that user has curator privilege.
    if not api_is_user_admin(user_type):
        if not current_user_id:
            return { "error": "current_user_id is required for curator"}

        sql += """
        WHERE
            gu.group_id IN (
                SELECT group_id
                FROM panelsearch_nando_group_user
                WHERE user_id = %s
                  AND user_role = %s
            )
        """
        params.extend([current_user_id, GROUP_USER_ROLE_CURATOR])

    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cur:
            cur.execute(sql, params)
            rows = list(cur.fetchall())

            for row in rows:
                if key_by == "group":
                    result[row["group_id"]][row["user_id"]] = row["user_role"]
                else:
                    result[row["user_id"]][row["group_id"]] = row["user_role"]

    return dict(result)


def api_psn_group_get_group_user_hash(user_type, user_id):
    return get_group_user_relation_hash(
        key_by="group",
        user_type=user_type,
        current_user_id=user_id
    )


def api_psn_group_get_user_group_hash(user_type, user_id):
    return get_group_user_relation_hash(
        key_by="user",
        user_type=user_type,
        current_user_id=user_id
    )


def api_psn_group_get_group_panel(group_id):

    if group_id is None:
        return []

    sql = """
        SELECT 
            p.panel_id, p.panel_name_ja as panel_name, p.notification_number
        FROM 
            panelsearch_nando_group_panel as g
        JOIN 
            panelsearch_nando_panel as p ON g.panel_id = p.panel_id
        WHERE
            g.group_id = %s
        ORDER BY p.panel_name_ja
    """
    return fetch_all(sql, (group_id,), dict_cursor=True)


def api_psn_group_add_group_panel(group_id, panel_ids):

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                values = [(group_id, panel_id) for panel_id in panel_ids]
                cur.executemany(
                    """
                    INSERT IGNORE INTO panelsearch_nando_group_panel (group_id,panel_id)
                    VALUES (%s,%s)
                    """,
                    values
                )
            conn.commit()
            return {'suceed': 'done'}
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_psn_group_delete_group_panel(group_id, panel_id):

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM panelsearch_nando_group_panel
                    WHERE  group_id = %s AND panel_id = %s
                    """,
                    (group_id, panel_id)
                )
            conn.commit()
            return {'suceed': 'done'}
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_psn_group_is_user_curator_of_some_group(user_id):
    sql = """
        SELECT
            gu.group_id
        FROM
            panelsearch_nando_group_user as gu
        JOIN 
            panelsearch_nando_group as g ON gu.group_id=g.group_id AND g.isValid = %s
        WHERE
            gu.user_id = %s AND gu.user_role = %s
    """
    rows = fetch_all(sql, (ENUM_VAL_YES,user_id,GROUP_USER_ROLE_CURATOR), dict_cursor=False)

    return len(rows) > 0


def api_psn_group_is_user_curator_of_group(user_id,group_id):
    sql = """
        SELECT group_id
        FROM   panelsearch_nando_group_user
        WHERE  group_id = %s AND user_id = %s AND user_role = %s
    """
    rows = fetch_all(sql, (group_id, user_id, GROUP_USER_ROLE_CURATOR), dict_cursor=False)

    return len(rows) > 0


def api_psn_group_is_user_role_curator(user_role):
    return user_role == GROUP_USER_ROLE_CURATOR


def api_psn_group_is_user_role_reviewer(user_role):
    return user_role == GROUP_USER_ROLE_REVIEWER


def api_psn_group_get_user_role_of_panel(user_id,panel_id):
    sql = """
        SELECT
            gu.user_role
        FROM
            panelsearch_nando_group_user as gu
        JOIN
            panelsearch_nando_group_panel as gp ON gu.group_id=gp.group_id AND gp.panel_id=%s
        WHERE
            gu.user_id = %s
        ORDER BY
            gu.user_role DESC
    """
    return fetch_one(sql, (panel_id,user_id), dict_cursor=True)


######
#
# for Group activity
#
######
def add_group_activity_log(cursor, group_id, admin_user_id, target_user_id, action, user_role_from, user_role_to):

    columns = ['group_id', 'target_user_id', 'admin_user_id', 'action', 'user_role_from', 'user_role_to']

    values = [group_id, target_user_id, admin_user_id, action, user_role_from, user_role_to]

    columns_str  = ", ".join(f"`{col}`" for col in columns)

    placeholders = ", ".join(["%s"] * len(columns))

    sqlstr =  f"INSERT INTO `panelsearch_nando_group_activity` ({columns_str}) VALUES ({placeholders})"

    cursor.execute(sqlstr, values)


def api_psn_load_group_activity_log(filter_text=None):
    sql = """
    SELECT
        a.group_activity_id,
        a.created_at,
        a.action,
        a.user_role_from,
        a.user_role_to,
        a.group_id,
        g.group_title,
        CONCAT(u_target.last_name_nl, u_target.first_name_nl) AS target_user_name,
        u_target.email AS target_user_email,
        CONCAT(u_admin.last_name_nl, u_admin.first_name_nl) AS admin_user_name
    FROM
        panelsearch_nando_group_activity AS a
    INNER JOIN
        panelsearch_nando_group AS g
            ON a.group_id = g.group_id
    INNER JOIN
        user_info_psn AS u_target
            ON a.target_user_id = u_target.id
    INNER JOIN
        user_info_psn AS u_admin
            ON a.admin_user_id = u_admin.id
    """

    params = []

    if filter_text:
        sql += """
        WHERE
            CONCAT(u_target.last_name_nl, u_target.first_name_nl) LIKE %s
            OR u_target.email LIKE %s
        """
        like = f"%{filter_text}%"
        params.extend([like, like])

    return fetch_all(sql, params, dict_cursor=True)


######
#
# for change log 
#
######

def record_user_activity_panel_version(activity_id,panel_version_info_arr, cur):

    sql= """
    INSERT INTO panelsearch_nando_user_activity_panel_version
    (activity_id,panel_version_id)
    VALUES (%s,%s)
    """

    data = [
        (activity_id, item['panel_version_id'])
        for item in panel_version_info_arr
    ]

    if data:
        cur.executemany(sql, data)


def add_user_activity_log(cursor, user_id, former_data, data, target, action):

    former_data = former_data or {}
    data = data or {}
    obj = former_data if action == USER_ACTIVITY_ACTION_DELETE else data

    fields = [
        "rating_id",
        "phenotypes",
        "publications",
        "comment",
        "source",
        "mode_of_inheritances"
    ]

    # -------- 1. 基本 ID 信息 --------
    payload = {
        "target":                   target,
        "action":                   action,
        "user_id":                  user_id,
        "entity_id":                data.get("entity_id"),
        "review_id":                data.get("review_id"),
        "review_comment_id":        data.get("review_comment_id"),
        "former_entity_id":         former_data.get("entity_id"),
        "former_review_id":         former_data.get("review_id"),
        "former_review_comment_id": former_data.get("review_comment_id"),
        "panel_id":                 obj.get("panel_id"),
        "gene_symbol":              obj.get("gene_symbol"),
        "gene_id":                  obj.get("gene_id"),
        "entity_type_id":           obj.get("entity_type_id"),
        "entity_name":              obj.get("entity_name"),
        "is_from_user":             obj.get("is_from_user"),
        "original_review_id":       obj.get("original_review_id")
    }
    diff = []

    # -------- 2. diff 计算 --------
    if action == USER_ACTIVITY_ACTION_ADD:
        for f in fields:
            if data.get(f):
                diff.append({f: USER_ACTIVITY_DETAIL_ACTION_ADD})

    elif action == USER_ACTIVITY_ACTION_CHANGE:
        for f in fields:
            old = former_data.get(f)
            new = data.get(f)

            if old == new:
                continue
            if not old and new:
                diff.append({f: USER_ACTIVITY_DETAIL_ACTION_ADD})
            elif old and not new:
                diff.append({f: USER_ACTIVITY_DETAIL_ACTION_REMOVE})
            elif str(old) == str(new):
                continue
            else:
                diff.append({f: USER_ACTIVITY_DETAIL_ACTION_CHANGE})

    elif action == USER_ACTIVITY_ACTION_DELETE:
        for f in fields:
            if former_data.get(f):
                diff.append({f: USER_ACTIVITY_DETAIL_ACTION_REMOVE})
        if former_data.get("comment_ids"):
            diff.append({"comment_ids": former_data["comment_ids"]})

    # -------- 3. 特殊规则：definition + rating → classify --------
    if (
        target == USER_ACTIVITY_TARGET_DEFINITION
        and any("rating_id" in d for d in diff)
    ):
        payload["action"] = USER_ACTIVITY_ACTION_CLASSIFY

    payload["difference"] = json.dumps(diff)

    # -------- 4. 写入 DB --------
    sql = """
    INSERT INTO panelsearch_nando_user_activity (
        panel_id,
        gene_symbol,
        gene_id,
        entity_type_id,
        entity_name,
        is_from_user,
        target,
        action,
        user_id,
        entity_id,
        review_id,
        original_review_id,
        review_comment_id,
        former_entity_id,
        former_review_id,
        former_review_comment_id,
        difference
    )
    VALUES (%(panel_id)s, 
            %(gene_symbol)s, %(gene_id)s,%(entity_type_id)s,%(entity_name)s,
            %(is_from_user)s, %(target)s, %(action)s, %(user_id)s, %(entity_id)s,
            %(review_id)s, %(original_review_id)s, %(review_comment_id)s,
            %(former_entity_id)s, %(former_review_id)s,%(former_review_comment_id)s,
            %(difference)s)
    """
    cursor.execute(sql, payload)

    return cursor.lastrowid


def get_select_activity_log_sql(join_clause, where_clause):
    return f"""
    SELECT
        A.activity_id,
        A.user_id,
        A.created_at,
        A.entity_id,
        A.review_id,
        A.original_review_id,
        A.review_comment_id,
        A.former_entity_id,
        A.former_review_id,
        A.former_review_comment_id,
        A.target,
        A.action,
        A.difference,
        A.panel_id,
        uapv.panel_version_id,
        concat(pv.major_version,'.',pv.minor_version,'(',uapvp.panel_name_ja,')') as panel_version,
        D.nando_id,
        D.panel_name_ja AS panel_name,
        A.gene_symbol,
        A.gene_id,
        A.entity_type_id,
        A.entity_name,
        A.is_from_user,
        CONCAT(F.last_name_nl, F.first_name_nl) AS user_name,
        F.user_type,
        F.affiliation
    FROM panelsearch_nando_user_activity A
    JOIN panelsearch_nando_user_activity_panel_version uapv
        ON A.activity_id=uapv.activity_id
    JOIN panelsearch_nando_panel_version pv
        ON uapv.panel_version_id=pv.panel_version_id
    JOIN panelsearch_nando_panel uapvp
        ON uapvp.panel_id=pv.root_panel_id
    {join_clause}
    JOIN panelsearch_nando_panel D ON A.panel_id = D.panel_id
    JOIN user_info_psn F ON A.user_id = F.id
    {where_clause}
    """

def api_psn_load_user_activity_log(
    filter_panel, filter_version, filter_entity, filter_from, filter_to
):

    where = []
    params = []

    if filter_panel:
        ids = filter_panel.split(',')
        where.append(f"A.panel_id IN ({','.join(['%s'] * len(ids))})")
        params.extend(ids)

    if filter_version:
        ids = [int(x) for x in filter_version.split(',')]
        where.append(f"uapv.panel_version_id IN ({','.join(['%s'] * len(ids))})")
        params.extend(ids)

    if filter_entity:
        names = [x.strip() for x in filter_entity.split(',')]
        where.append(f"A.entity_name IN ({','.join(['%s'] * len(names))})")
        params.extend(names)

    if filter_from:
        where.append("A.created_at >= %s")
        params.append(filter_from)

    if filter_to:
        where.append("A.created_at <= %s")
        params.append(filter_to)

    where_sql = " AND ".join(where)
    sql = get_select_activity_log_sql('', ('WHERE ' + where_sql) if where_sql else '')

    rows = fetch_all(sql, params, dict_cursor=True)
    if isinstance(rows, dict) and 'error' in rows:
        return rows

    if rows:
        return combine_row_version(rows, 'activity_id')
    else:
        return []


def api_psn_load_incharge_user_activity_log(curator_user_id):

    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:

            join_clause_newest = """
                JOIN (
                    SELECT
                        panel_id,
                        gene_id,
                        entity_type_id,
                        entity_name,
                        user_id,
                        target,
                        original_review_id,
                        MAX(activity_id) AS max_id
                    FROM panelsearch_nando_user_activity
                    GROUP BY
                        panel_id,
                        gene_id,
                        entity_type_id,
                        entity_name,
                        user_id,
                        target,
                        original_review_id
                ) m ON A.activity_id = m.max_id
            """

            join_clause_curator = """
                JOIN (
                    SELECT DISTINCT gp.panel_id
                    FROM panelsearch_nando_group_user gu_me
                    JOIN panelsearch_nando_group g
                      ON g.group_id = gu_me.group_id
                    JOIN panelsearch_nando_group_panel gp
                      ON gp.group_id = g.group_id
                    WHERE g.isValid = %s
                      AND gu_me.user_id = %s
                      AND gu_me.user_role = %s
                ) U ON A.panel_id = U.panel_id               
            """
            
            sql = get_select_activity_log_sql(f"{join_clause_newest} {join_clause_curator if curator_user_id else ''}", "" )

            cursor.execute(
                sql, 
                (ENUM_VAL_YES, curator_user_id, GROUP_USER_ROLE_CURATOR) if curator_user_id else []
            )

            rows = list(cursor.fetchall())

            if rows:
                return combine_row_version(rows,'activity_id')
            else:
                return []


def api_psn_check_user_activity(user_id, activity_id):
    results = execute_sql(
        """
        INSERT IGNORE INTO panelsearch_nando_curator_check_history 
            (user_id,activity_id) 
        VALUES 
            (%s,%s)
        """,
        (user_id,activity_id)
    )

    if isinstance(results, dict) and 'error' in results:
        return results
    
    return {"suceed": 'done'}



def api_psn_uncheck_user_activity(user_id, activity_id):
    results = execute_sql(
        """
        DELETE FROM panelsearch_nando_curator_check_history 
        WHERE user_id = %s AND activity_id = %s
        """,
        (user_id,activity_id)
    )

    if isinstance(results, dict) and 'error' in results:
        return results
    
    return {"suceed": 'done'}


def api_psn_load_curator_check_history(curator_user_id):
    results = fetch_all(
        """
        SELECT activity_id 
        FROM panelsearch_nando_curator_check_history 
        WHERE user_id = %s
        """,
        (curator_user_id, ), 
        dict_cursor=False
    )

    if isinstance(results, dict) and 'error' in results:
        return results

    id_list = [row[0] for row in results]

    return {
        "suceed": 'done',
        "data":  id_list 
    }

def get_review_comment_by_ids(cursor, comment_ids_list):

    placeholders = ','.join(['%s'] * len(comment_ids_list))

    sql = f"""
    SELECT review_comment_id, comment 
    FROM panelsearch_nando_entity_review_comment 
    WHERE review_comment_id IN ({placeholders}) 
    ORDER BY review_comment_id DESC
    """
    cursor.execute(sql, comment_ids_list)
    return list(cursor.fetchall())


def api_psn_load_user_activity_detail(activity):

    response = {
        'former_data': {},
        'data': {}
    }

    with get_mysql_connection() as conn:
        try:    
            with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:

                # ----------- Definition -------------
                if activity['target'] == USER_ACTIVITY_TARGET_DEFINITION:
                    entity_ids = []
                    if activity.get('former_entity_id'):
                        entity_ids.append(activity['former_entity_id'])
                    if activity.get('entity_id'):
                        entity_ids.append(activity['entity_id'])

                    if entity_ids:
                        placeholders = ','.join(['%s'] * len(entity_ids))
                        sql = f"SELECT * FROM panelsearch_nando_entity WHERE entity_id IN ({placeholders})"
                        cursor.execute(sql, entity_ids)
                        results = list(cursor.fetchall())
                        for row in results:
                            if row['entity_id'] == activity.get('former_entity_id'):
                                response['former_data'] = row
                            if row['entity_id'] == activity.get('entity_id'):
                                response['data'] = row

                # ----------- Review / Review Comment -------------
                else:
                    # review
                    review_ids = []
                    if activity.get('review_id'):
                        review_ids.append(activity['review_id'])
                    if activity.get('former_review_id') and activity['former_review_id'] != activity.get('review_id'):
                        review_ids.append(activity['former_review_id'])

                    if review_ids:
                        placeholders = ','.join(['%s'] * len(review_ids))
                        sql = f"SELECT * FROM panelsearch_nando_entity_review WHERE review_id IN ({placeholders})"
                        cursor.execute(sql, review_ids)
                        results = list(cursor.fetchall())
                        for row in results:
                            if row['review_id'] == activity.get('review_id'):
                                response['data'] = row
                            if row['review_id'] == activity.get('former_review_id'):
                                if activity.get('review_id') != activity.get('former_review_id'):
                                    response['former_data'] = row
                                else:
                                    response['former_data'] = copy.deepcopy(row)

                    # review_comment
                    if activity.get('action') == USER_ACTIVITY_ACTION_DELETE:
                        # delete action, get comment by comment_ids
                        comment_ids = activity.get('comment_ids')
                        if comment_ids:
                            comment_ids_list = [int(x) for x in comment_ids.split(',')]
                            results_comment = get_review_comment_by_ids(cursor, comment_ids_list)
                            response['former_data']['comment'] = '\n-----\n'.join(row['comment'] for row in results_comment)

                    else:
                        review_comment_ids = []
                        if activity.get('review_comment_id'):
                            review_comment_ids.append(activity['review_comment_id'])
                        if activity.get('former_review_comment_id'):
                            review_comment_ids.append(activity['former_review_comment_id'])

                        if review_comment_ids:
                            results_comment = get_review_comment_by_ids(cursor, review_comment_ids)
                            for row in results_comment:
                                if row['review_comment_id'] == activity.get('former_review_comment_id'):
                                    response['former_data']['comment'] = row['comment']
                                if row['review_comment_id'] == activity.get('review_comment_id'):
                                    response['data']['comment'] = row['comment']

        except MySQLdb.IntegrityError as e:
            return {'error': str(e)}
        except Exception as e:
            return {'error': str(e)}
                
    return response    


def api_psn_load_user_activity_history(activity_log):
    response = {
        'panel_upstream_trace': {},
        'activity_history': {},
        'lastest': None
    }
    
    with get_mysql_connection() as OBJ_MYSQL:

        with OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:
            try:
                #1. upstream trace
                cursor.execute(
                    "SELECT trace FROM panelsearch_nando_panel_upstream_trace WHERE panel_id=%s", 
                    (activity_log['panel_id'],)
                )
                trace_row = cursor.fetchone()
                response['panel_upstream_trace'] = trace_row['trace'] if trace_row else ""

                #2.activity history
                params = [
                    activity_log['panel_id'],
                    activity_log['gene_id'],
                    activity_log['entity_type_id'],
                    activity_log['entity_name'],
                    activity_log['user_id'],                    
                    activity_log['target']
                ]

                condition_original_rid = ""
                if activity_log['target'] == USER_ACTIVITY_TARGET_REVIEW:
                    params.append(activity_log['original_review_id'])
                    condition_original_rid = "AND original_review_id=%s"


                sql_activity = f"""
                SELECT *
                FROM panelsearch_nando_user_activity
                WHERE 
                  panel_id=%s
                  AND gene_id=%s
                  AND entity_type_id=%s
                  AND entity_name=%s
                  AND user_id=%s
                  AND target=%s
                  {condition_original_rid}
                ORDER BY activity_id DESC
                """
                cursor.execute(sql_activity, params)
                rows = list(cursor.fetchall())

                if not rows:
                    return response
                
                for row in rows:
                    response['activity_history'][row['activity_id']] = row

                latest_activity = rows[0]

                #3. latest data

                if latest_activity['target'] == USER_ACTIVITY_TARGET_DEFINITION:
                    cursor.execute(
                        "SELECT * FROM panelsearch_nando_entity WHERE entity_id=%s",
                        (latest_activity['entity_id'],)
                    )
                    response['lastest'] = cursor.fetchone()

                elif latest_activity['action'] == USER_ACTIVITY_ACTION_DELETE:
                    response['lastest'] = ""
                else:
                    cursor.execute(
                        "SELECT * FROM panelsearch_nando_entity_review WHERE review_id=%s",
                        (latest_activity['review_id'],)
                    )
                    lastest_review = cursor.fetchone()
                    response['lastest'] = lastest_review

                    # review comments
                    cursor.execute(
                        """
                        SELECT comment, created_at, modified_at
                        FROM panelsearch_nando_entity_review_comment
                        WHERE is_latest=%s AND original_review_id=%s
                        """,
                        (ENUM_VAL_YES, lastest_review['original_review_id'])
                    )
                    comments = list(cursor.fetchall())
                    if comments:
                        response['lastest']['comment'] = comments

                return response

            except MySQLdb.IntegrityError as e:
                return {'error': str(e)}
            except Exception as e:
                return {'error': str(e)}


def api_psn_load_panel_version_and_entity(panel_id):

    if panel_id in {ROOT_NANDO_ID_ALL,ROOT_NANDO_ID_SPECIFIED,ROOT_NANDO_ID_UNSPECIFIED}:
        return {
            'panel_version': [],
            'entity': []
        }

    with get_mysql_connection() as OBJ_MYSQL:
        with OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:
       
            sql_version = """
            SELECT DISTINCT
                pcpv.panel_version_id as value,
                concat('v',pv.major_version, '.', pv.minor_version, '(',p.panel_name_ja,')') as name
            FROM panelsearch_nando_panel_change pc
            JOIN panelsearch_nando_panel_change_panel_version pcpv
                ON pc.panel_change_id=pcpv.panel_change_id
            JOIN panelsearch_nando_panel_version pv
                ON pcpv.panel_version_id=pv.panel_version_id
            JOIN panelsearch_nando_panel p
                ON pv.root_panel_id=p.panel_id
            WHERE
                pc.panel_id=%s AND pv.is_deleted=%s
            ORDER BY
                pcpv.panel_version_id DESC
            """
            cursor.execute(sql_version, (panel_id,ENUM_VAL_NO))
            results_version = list(cursor.fetchall())

            sql_entity = """
            SELECT distinct entity_name as name, entity_name as value 
            FROM panelsearch_nando_entity 
            WHERE panel_id = %s
            
            UNION
            
            SELECT distinct entity_name as name, entity_name as value 
            FROM panelsearch_nando_entity_review 
            WHERE panel_id = %s
            """
            cursor.execute(sql_entity, (panel_id, panel_id))
            results_entity = list(cursor.fetchall())

            return {
                'panel_version': results_version,
                'entity': results_entity
            }



def main():
    print('Test regist review:')
    #print(api_psn_get_panel_id_match_panel_name_synonym('panel', 'asc', 'ja', 'NANDO:0000003', 'あ'))
    #print(api_psn_get_panel_id_match_gene_symbol_ncbiid('ja','gene', 'asc', 'NANDO:0000003', 'DH'))
    #print(api_psn_get_panel_review('NANDO:0000003'))
    #print(api_psn_get_panel_version_info('NANDO:1200477'))
    #print(api_psn_get_panel_version_info('NANDO:1200583'))
    #print(api_psn_get_all_panel('ja', 'panel', 'asc', 'NANDO:1200477'))
    data = {
        'input_review_panel_name': '先天性ミオパチー', 
        'input_review_panel_id': 'NANDO:1200477', 
        'input_review_review_id': '', 
        'input_review_rating_id': '10', 
        'input_review_entity_type_id': '1', 
        'input_review_is_from_user': 'NO', 
        'input_review_gene_symbol': '58,ACTA1', 
        'input_review_phenotype': 'NANDO:1200477--先天性ミオパチー', 
        'input_review_mode_of_inheritances': 'HP:0000006', 
        'input_review_entity_name': 'ACTA1', 
        'input_review_publications': 'PMID:19562689 PMCID: PMC2784950 DOI:10.1002/humu.21059', 
        'input_review_comment': 'ACTA1遺伝子変異に関する四半世紀にわたる研究は、今まさに明確な転換点を迎えています。\n\n全ての患者さんを一律に救う単一の「魔法の弾丸」は存在しないかもしれません。しかし、基礎生化学の蓄積、3D人工筋肉を用いた創薬プラットフォーム、そして「REMEDY」のような次世代CRISPR技術が融合し、この致死的な難病を「管理可能、あるいは治癒可能な疾患」へと変える時代がすぐ目の前まで来ています。\n\n遺伝子の病気は「親のせい」ではありません。最先端の医療情報と遺伝カウンセリングを通じて、患者さんとご家族が希望を持てる選択ができるよう、私たちは全力でサポートいたします。', 
        'input_review_position_chromosome': '', 
        'input_review_position_grch37_start': '', 
        'input_review_position_grch37_end': '', 
        'input_review_position_grch38_start': '', 
        'input_review_position_grch38_end': '', 
        'input_review_str_repeated_sequence': '', 
        'input_review_str_normal_repeats': '', 
        'input_review_str_pathogenic_repeats': '', 
        'input_review_region_haploinsufficiency_score': '', 
        'input_review_region_triplosensitivity_score': '', 
        'input_review_region_required_overlap_percentage': '', 
        'input_review_region_variant_type': '', 
        'input_review_region_verbose_name': ''
    }
    #print(api_psn_regist_review(1, data))
    #print(api_psn_get_panel_version_info('NANDO:1200477', 'ja'))
    #print(api_psn_get_panel_upstream_trace('NANDO:1200477'))
    #print(api_psn_get_panel_entity_review('NANDO:1200477','1','ACTA1'))
    #print(api_psn_get_panel_entity_review_comment('NANDO:1200477','1','ACTA1'))
    #print(api_psn_get_panel_entity_review_comment('NANDO:1200i582','1','SLC17A5'))
    #print(api_psn_get_panel_entity_definition('NANDO:1200477','1','ACTA1'))
    print(api_psn_get_panel_id_match_panel_name_synonym('panel','asc','ja','NANDO:0000003','筋ジストロフィー'))

if __name__ == '__main__':
    main()
