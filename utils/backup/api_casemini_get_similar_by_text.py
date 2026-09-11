# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import re
import json
import MySQLdb

import Levenshtein

app = Flask(__name__)


#####
# DB設定
app.config.from_pyfile('../config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']


#####
# GET: API for text search
#
# input: text - search key words
#        target - omim_orpha,or icd-10, or nando
#
# dict形式で結果を返す
# マッチするものがない場合はnoneを返す
#####
def casemini_search_similar_by_text_with_dict(text,target):

    dict_match = {}

    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")

    sql = "";
    if target == 'omim_orpha':
        sql =  u"select Mondo,disease_name_en,disease_name_ja,disease_name_synonym_en,disease_name_synonym_ja,OMIM,Orphanet from casemini_omim_orpha;"
    elif target == 'icd-10':
        sql = u"select `ICD-10`,'' as disease_name_en,`disease_name`,'' as disease_name_synonym_en,'' as disease_name_synonym_ja,`ICD-10_group`,`disease_control_number` from casemini_icd_10;"
    elif target == 'nando':
        sql = u"select NANDO,disease_name_en,disease_name_ja,disease_name_synonym_en,disease_name_synonym_ja,Mondo,notification_number from casemini_nando;"
    elif target == 'hpo':
        sql = u"select OntoID,OntoName,OntoNameJa,OntoSynonym,OntoSynonymJa,'' as opt1,'' as opt2 from casemini_OntoTermHPInformation;"
    
    if len(sql):
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()

        for val in values:
            id                      = val[0]
            disease_name_en         = val[1]
            disease_name_ja         = val[2]
            disease_name_synonym_en = val[3]
            disease_name_synonym_ja = val[4]
            option_1                = val[5]
            option_2                = val[6]
            synonym_similar         = ''

            # ジャロ・ウィンクラー距離を計算
            # search at disease_name_en,disease_name_ja,disease_name_synonym_en,disease_name_synonym_ja

            jaro_dist = Levenshtein.jaro_winkler(text, disease_name_en)

            if type(disease_name_ja) is str and len(disease_name_ja):
                jaro_dist2 = Levenshtein.jaro_winkler(text, disease_name_ja)
                if jaro_dist2 > jaro_dist:
                    jaro_dist = jaro_dist2

            if type(disease_name_synonym_en) is str and len(disease_name_synonym_en):
                list_synonym = disease_name_synonym_en.split('|')
                for synonym in list_synonym:
                    if type(synonym) is str and len(synonym):
                        jaro_dist2 = Levenshtein.jaro_winkler(text, synonym)
                        if jaro_dist2 > jaro_dist:
                            jaro_dist = jaro_dist2
                            synonym_similar = synonym

            if type(disease_name_synonym_ja) is str and len(disease_name_synonym_ja):
                list_synonym = disease_name_synonym_ja.split('|')
                for synonym in list_synonym:
                    if type(synonym) is str and len(synonym):
                        jaro_dist2 = Levenshtein.jaro_winkler(text, synonym)
                        if jaro_dist2 > jaro_dist:
                            jaro_dist = jaro_dist2
                            synonym_similar = synonym


            if jaro_dist in dict_match:
                (dict_match[jaro_dist]).append("---".join([id,disease_name_en,disease_name_ja,option_1,option_2,synonym_similar]))
            else:
                dict_match[jaro_dist] = []
                (dict_match[jaro_dist]).append("---".join([id,disease_name_en,disease_name_ja,option_1,option_2,synonym_similar]))

        str_list_hpo = ""
        counter = 0
        list_return = []
        for key, list_uid_value in sorted(dict_match.items(), reverse=True):
            for uid_value in sorted(list_uid_value):
                item_list = uid_value.split("---")
                dict_json = {}
                dict_json["id"]                         = item_list[0]
                dict_json["name_en"]                    = item_list[1]
                dict_json["name_ja"]                    = item_list[2]
                if target == 'omim_orpha':
                    dict_json["omim"]                   = item_list[3]
                    dict_json["orphanet"]               = item_list[4]
                elif target == 'icd-10':
                    dict_json["group"]                  = item_list[3]
                    dict_json["disease_control_number"] = item_list[4]
                elif target == 'nando':
                    dict_json["mondo"]                  = item_list[3]
                    dict_json["notification_number"]    = item_list[4]

                dict_json["synonym"]  = item_list[5]
                
                list_return.append(dict_json)

                counter += 1
                if counter == 10:
                    break

            if counter == 10:
                break
    OBJ_MYSQL.close()

    return list_return


def main():
    #print(casemini_search_similar_by_text_with_dict("乳児肝不全",'omim_orpha'))
    #print(casemini_search_similar_by_text_with_dict("カンジダ性間擦疹",'icd-10'))
    #print(casemini_search_similar_by_text_with_dict("毛細血管拡張性運動",'nando'))
    print(casemini_search_similar_by_text_with_dict("膀胱尿管逆流現象",'hpo'))

if __name__ == '__main__':
    main()
