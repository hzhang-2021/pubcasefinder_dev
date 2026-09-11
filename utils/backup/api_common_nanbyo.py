# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import re
import json
import MySQLdb
import MySQLdb.cursors
import requests
from datetime import datetime
from contextlib import contextmanager

app = Flask(__name__)

# DB設定
app.config.from_pyfile('../config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']



@contextmanager
def get_mysql_connection():
    conn = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    try:
        yield conn
    finally:
        conn.close()


def api_nanbyo_get_panel_hierarchy(r_nando_id,r_lang):

    response_data = {}
    with get_mysql_connection() as OBJ_MYSQL:
        col = "trace_ja" if r_lang == "ja" else "trace_en"
        sql = u"select {col} from nanbyodata_nando_panel_upstream_trace where nando_id=%s".format(col=col)
        cr = OBJ_MYSQL.cursor()
        cr.execute(sql, (r_nando_id,))
        rows = cr.fetchall()
        cr.close()
        for row in rows:
            response_data = row[0]

    return response_data



def api_nanbyo_get_panel_descendant(r_nando_id,r_lang):
    response_data = []
    with get_mysql_connection() as OBJ_MYSQL:
        sql = u"select B.OntoID, B.OntoName, B.OntoNameJa, B.OntoDescendantNum from nanbyodata_nando_panel_hierarchy as A, nanbyodata_nando_panel as B where A.nando_id=B.OntoID AND A.parent_nando_id=%s order by B.OntoID"
        cr = OBJ_MYSQL.cursor()
        cr.execute(sql, (r_nando_id,))
        rows = cr.fetchall()
        cr.close()
        for row in rows:
            ret_record = {}
            ret_record['nando_id']  = row[0]
            ret_record['name']      = row[1]
            ret_record['name_ja']   = row[2]
            ret_record['num_child'] = row[3]
            ret_record['lang']      = r_lang
            ret_record['displayName'] = row[1]+" <font class=\"treeview-decendant-num\">(" + str(row[3]) + ")</font>"
            if r_lang == "ja" and len(ret_record['name_ja']) > 0:
                ret_record['displayName'] = row[2]+ " <font class=\"treeview-decendant-num\">(" + str(row[3]) + ")</font>"
            ret_record['isFirstTimeLoad'] = True
            ret_record['isParent'] = False
            if row[3] > 0:
                ret_record['isParent'] = True
            else:
                ret_record['displayName'] = row[1]
                if r_lang == "ja" and len(ret_record['name_ja']) > 0:
                    ret_record['displayName'] = row[2]

            response_data.append(ret_record)

    return response_data

def main():
    # do some test
    print(api_nanbyo_get_panel_hierarchy("NANDO:0000001","ja"))
    #print(api_nanbyo_get_panel_descendant("NANDO:1200477","ja"))

if __name__ == '__main__':
    main()
