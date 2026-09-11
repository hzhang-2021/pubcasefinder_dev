# -*- coding: utf-8 -*-

from flask import Flask
import os
import re
import json

import MySQLdb
import MySQLdb.cursors
from db.mysql import get_mysql_connection

import requests
from datetime import datetime
from contextlib import contextmanager

app = Flask(__name__)

def api_panelsearch_mondo_get_disease_and_panel_num(mondo_id,r_lang):

    mondo_name = ""
    disease_num = 0
    panel_num = 0

    with get_mysql_connection() as OBJ_MYSQL:

        col = "OntoNameJa" if r_lang == "ja" else "OntoName"
        sql_OntoTerm = f"""
            select {col},OntoDescendantNum 
            from ps_OntoTermMONDO_all_upstream_trace 
            where OntoID=%s
        """
        cursor_OntoTerm = OBJ_MYSQL.cursor()
        cursor_OntoTerm.execute(sql_OntoTerm, (mondo_id,))
        value = cursor_OntoTerm.fetchone()
        mondo_name = value[0]
        disease_num = value[1]

        cursor_OntoTerm.execute(
           """
           SELECT
               count(distinct A.MondoID) as num  
           FROM
               ps_Panel as A, ps_OntoTermMONDO_all_descendant as B 
           WHERE
               B.OntoID=%s AND B.OntoDescendantID=A.MondoID; 
           """,
           (mondo_id,)
        )
        value_panel = cursor_OntoTerm.fetchone()
        panel_num = value_panel[0]

        cursor_OntoTerm.close()

    return mondo_name, disease_num, panel_num



def api_panelsearch_mondo_get_descendant(mondo_id, r_lang):

    response_data = []
    col = "B.OntoNameJa" if r_lang == "ja" else "B.OntoName"
    sql = f"""
        select A.OntoID, {col}, B.OntoDescendantNum 
        from ps_OntoTermMONDOHierarchy as A, ps_OntoTermMONDO_all_upstream_trace as B 
        where A.OntoID=B.OntoID AND A.OntoParentID=%s 
        order by B.OntoName
    """
    with get_mysql_connection() as OBJ_MYSQL:
        cr = OBJ_MYSQL.cursor()
        cr.execute(sql, (mondo_id,))
        response_data = cr.fetchall()
        cr.close()
    return response_data


def api_panelsearch_mondo_get_hierarchy(mondo_id,r_lang):

    response_data = {}
    col = "trace_ja" if r_lang == "ja" else "trace_en"
    sql = f"""
        select {col} 
        from ps_OntoTermMONDO_all_upstream_trace 
        where OntoID=%s
    """
    with get_mysql_connection() as OBJ_MYSQL:
        cr = OBJ_MYSQL.cursor()
        cr.execute(sql, (mondo_id,))
        rows = cr.fetchall()
        cr.close()
        for row in rows:
            response_data = row[0]

    return response_data


def api_panelsearch_mondo_get_all_panel(r_root_mondo_id,r_sort,r_dir):
    response_data = []

    with get_mysql_connection() as OBJ_MYSQL:
        sql =  f"select distinct A.MondoID,lower(A.MondoTerm) as sortfield from ps_Panel as A, ps_OntoTermMONDO_all_descendant as B where B.OntoID='{r_root_mondo_id}' and B.OntoDescendantID=A.MondoID order by {r_sort} {r_dir}"
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql)
        response_data = cursor.fetchall()
        cursor.close()

    return response_data




def api_panelsearch_mondo_get_panel_by_name(r_root_mondo_id,r_sort,r_dir,input_text, r_lang):

    r_inputs = []

    sql_params = []
    if input_text is not None:
        r_inputs = input_text.replace(u'　', u' ').split()
        for v in r_inputs:
            sql_params.append("%"+v+"%")
        for v in r_inputs:
            sql_params.append("%"+v+"%")
        for v in r_inputs:
            sql_params.append("%"+v+"%")

    sql = u"select distinct A.MondoID, lower(A.MondoTerm) as sortfield from ps_Panel as A, ps_OntoTermMONDO_all_descendant as B where B.OntoID='{0}' and B.OntoDescendantID=A.MondoID AND (( {1} ) OR ( {2} ) OR ( {3} )) order by {4} {5}".format(r_root_mondo_id, ' AND '.join(map(lambda x: "A.MondoID collate utf8_unicode_ci like %s", r_inputs)), ' AND '.join(map(lambda x: "MondoTerm collate utf8_unicode_ci like %s", r_inputs)), ' AND '.join(map(lambda x: "MondoTermSynonym collate utf8_unicode_ci like %s", r_inputs)), r_sort, r_dir)

    if r_lang == 'ja':
        for v in r_inputs:
            sql_params.append("%"+v+"%")
        sql = u"select distinct A.MondoID, lower(A.MondoTerm) as sortfield from ps_Panel as A, ps_OntoTermMONDO_all_descendant as B where B.OntoID='{0}' and B.OntoDescendantID=A.MondoID AND ( ( {1} ) OR ( {2} ) OR ( {3} ) OR ( {4} ) ) order by {5} {6}".format(r_root_mondo_id, ' AND '.join(map(lambda x: "A.MondoID collate utf8_unicode_ci like %s", r_inputs)), ' AND '.join(map(lambda x: "MondoTerm collate utf8_unicode_ci like %s", r_inputs)), ' AND '.join(map(lambda x: "MondoTermSynonym collate utf8_unicode_ci like %s", r_inputs)), ' AND '.join(map(lambda x: "MondoTermJa collate utf8_unicode_ci like %s", r_inputs)),r_sort, r_dir)

    response_data = []
    with get_mysql_connection() as OBJ_MYSQL:
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql, tuple(sql_params))
        response_data = cursor.fetchall()
        cursor.close()

    return response_data


def api_panelsearch_mondo_get_panel_by_gene(r_root_mondo_id,r_sort,r_dir,input_text):
    r_inputs = []
    sql_params = []
    if input_text is not None:
        r_inputs = input_text.replace(u'　', u' ').split()
        for v in r_inputs:
            sql_params.append("%"+v+"%")
    sql = u"select distinct A.MondoID, lower(A.MondoTerm) as sortfield from ps_Panel  as A, ps_OntoTermMONDO_all_descendant as B where B.OntoID='{0}' and B.OntoDescendantID=A.MondoID AND ( {1} ) order by {2} {3}".format(r_root_mondo_id, ' AND '.join(map(lambda x: "GeneSymbolList collate utf8_unicode_ci like %s", r_inputs)), r_sort, r_dir)

    response_data = []
    with get_mysql_connection() as OBJ_MYSQL:
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql, tuple(sql_params))
        response_data = cursor.fetchall()
        cursor.close()

    return response_data


def main():
    print('Test regist review:')
    #print(api_panelsearch_mondo_get_descendant_num('MONDO:0700096'))
    #print(api_panelsearch_mondo_get_descendant('MONDO:0700096'))
    #print(api_panelsearch_mondo_get_hierarchy('MONDO:0000078'))
    #print(api_panelsearch_mondo_get_all_panel('MONDO:0000078',"sortfield","asc"))
    #print(api_panelsearch_mondo_get_panel_by_name('MONDO:0000078',"sortfield","asc","fer",'ja'))
    #print(api_panelsearch_mondo_get_panel_by_gene('MONDO:0000078',"sortfield","asc",'gfr'))
    print(api_panelsearch_mondo_get_descendant_num('MONDO:0700096','ja'))
    print(api_panelsearch_mondo_get_descendant('MONDO:0700096','ja'))
if __name__ == '__main__':
    main()
