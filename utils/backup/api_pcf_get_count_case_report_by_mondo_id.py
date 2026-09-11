# -*- coding: utf-8 -*-

import os
import re
import MySQLdb
import json
from flask import Flask, session, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)
app.secret_key = 'pubcasefinder1210'

#####
# DB setting
app.config.from_pyfile('../config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']

def pcf_get_count_case_report_by_mondo_id(r_mondo_id, r_lang):

    list_dict_count = []
    list_r_mondo_id = r_mondo_id.split(",")
    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    sql = ""

    if r_mondo_id != "":
        # J-Stageの症例報告の数を取得
        if r_lang == "ja":
            sql = u"select b.id_mondo, count(distinct a.id_jstage) from JStage as a left join AnnotOntoMONDOJStage as b on a.id_jstage=b.id_jstage where b.id_mondo in (%s) group by b.id_mondo"
        # PubMedの症例報告の数を取得
        elif r_lang == "en":
            sql = u"select a.OntoID, count(distinct a.PMID) from AnnotOntoMONDO as a left join CaseReports as b on a.PMID = b.PMID where a.OntoID in (%s) group by a.OntoID"

        in_p=', '.join(map(lambda x: '%s', list_r_mondo_id))
        sql = sql % in_p
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql, list_r_mondo_id)
        values = cursor.fetchall()
        cursor.close()
        for value in values:
            id_mondo = value[0]
            count    = value[1]
            dict_count = {}
            dict_count['id']    = id_mondo
            dict_count['count'] = count
            list_dict_count.append(dict_count)

    OBJ_MYSQL.close()

    return list_dict_count

