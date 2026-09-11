# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import re
import json
import MySQLdb
import mojimoji


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
def casemini_tokeninput_hpo(query_text,lang):

    list_json = []

    tokeninputs = query_text.replace(u'　', u' ').split()
    sql_params = []
    in_tokeninputs = []
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
        in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
    for v in tokeninputs:
        sql_params.append("%"+v+"%")

    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    sql_OntoTerm = ""
    if lang.startswith('ja') :
        sql_OntoTerm = u"select  distinct a.uid, a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on replace(a.uid, '_ja', '')=b.OntoID LEFT JOIN casemini_OntoTermHPInformation AS c ON replace(a.uid, '_ja', '')=c.OntoID where ( {0}  AND LENGTH(a.value)!=CHARACTER_LENGTH(a.value) )  OR ( a.uid IN (SELECT OntoID FROM casemini_OntoTermHPSynonymJa WHERE {1})) order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
    elif lang.startswith('en,ja'):
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
        sql_OntoTerm = u"select  distinct  a.uid,  a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on replace(a.uid, '_ja', '')=b.OntoID LEFT JOIN casemini_OntoTermHPInformation AS c ON replace(a.uid, '_ja', '')=c.OntoID where {0} OR (a.uid IN (SELECT OntoID FROM casemini_OntoTermHPSynonym WHERE {1}) ) OR (a.uid IN (SELECT OntoID FROM casemini_OntoTermHPSynonymJa WHERE {2}) )  order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
    elif lang.startswith('en') :
        sql_OntoTerm = u"select  distinct a.uid, a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on a.uid=b.OntoID LEFT JOIN casemini_OntoTermHPInformation AS c ON a.uid=c.OntoID where ( {0}  AND LENGTH(a.value)=CHARACTER_LENGTH(a.value) )  OR ( a.uid IN (SELECT OntoID FROM casemini_OntoTermHPSynonym WHERE {1})) order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
    #app.logger.error(sql_OntoTerm)
    
    if sql_OntoTerm != "":
        cursor_OntoTerm = OBJ_MYSQL.cursor()
        cursor_OntoTerm.execute(sql_OntoTerm, tuple(sql_params))
        values = cursor_OntoTerm.fetchall()
        cursor_OntoTerm.close()
        for value in values:
            dict_json = {}
            onto_id = mojimoji.zen_to_han(value[0], kana=False).lower()
            onto_id_term = mojimoji.zen_to_han(value[1], kana=False).lower()
            onto_id_synonym = []

            for in_tokeninput in in_tokeninputs:
                if type(onto_id) is str and len(onto_id) and in_tokeninput not in onto_id:
                    onto_id = None
                if type(onto_id_term) is str and len(onto_id_term) and in_tokeninput not in onto_id_term:
                    onto_id_term = None
                if onto_id is None and onto_id_term is None:
                    break

            if (lang == 'en' or lang == 'en,ja') and type(value[2]) is str and len(value[2]):
                list_synonym = value[2].split('|')
                for synonym in list_synonym:
                    temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                    for in_tokeninput in in_tokeninputs:
                        if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                            temp_synonym = None
                            break
                    if temp_synonym is not None:
                        onto_id_synonym.append(synonym)

            if (lang == 'ja' or lang == 'en,ja') and type(value[4]) is str and len(value[4]):
                list_synonym = value[4].split('|')
                for synonym in list_synonym:
                    temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                    for in_tokeninput in in_tokeninputs:
                        if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                            temp_synonym = None
                            break
                    if temp_synonym is not None:
                        onto_id_synonym.append(synonym)

            dict_json['id'] = value[0]
            dict_json['name'] = value[1].strip('"')
            if len(onto_id_synonym)>0:
                dict_json['synonym'] = onto_id_synonym
            else:
                dict_json['synonym'] = None
            list_json.append(dict_json)

    OBJ_MYSQL.close()

    return list_json

def casemini_popup_hierarchy_hpo(onto_id):

    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")

    dict_json = {}

    # OntoTermHPInformationテーブルから情報取得
    sql_information = u"select OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoParentNum, OntoChildNum, OntoNameJa from casemini_OntoTermHPInformation where OntoID=%s"
    sql_informations_fmt = u"select OntoID, OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoChildNum, OntoNameJa from casemini_OntoTermHPInformation where OntoID in (%s)"

    sql_hierarchy_parent = u"select OntoParentID from casemini_OntoTermHPHierarchy where OntoID=%s"
    sql_hierarchy_child  = u"select OntoID from casemini_OntoTermHPHierarchy where OntoParentID=%s"

    # OntoTermHPInformationテーブルからクエリにマッチするレコードを取得
    cursor_information = OBJ_MYSQL.cursor()
    cursor_information.execute(sql_information, (onto_id,))
    values_information = cursor_information.fetchall()
    cursor_information.close()

    for value_information in values_information:
        dict_self_class = {}
        onto_name       = value_information[0]
        onto_synonym    = value_information[1]
        onto_definition = value_information[2]
        onto_comment    = value_information[3]
        onto_parent_num = value_information[4]
        onto_child_num  = value_information[5]
        onto_name_ja    = value_information[6]
        dict_self_class['id']         = onto_id
        dict_self_class['name']       = onto_name
        dict_self_class['name_ja']    = onto_name_ja if onto_name_ja != "" else onto_name
        dict_self_class['synonym']    = onto_synonym
        dict_self_class['definition'] = onto_definition
        dict_self_class['comment']    = onto_comment

        list_parent_child_onto_id = []
        # OntoTermHPHierarchyから親クラスの情報取得
        list_parent_onto_id = []
        if onto_parent_num > 0:
            cursor_hierarchy_parent = OBJ_MYSQL.cursor()
            cursor_hierarchy_parent.execute(sql_hierarchy_parent, (onto_id,))
            values_hierarchy_parent = cursor_hierarchy_parent.fetchall()
            cursor_hierarchy_parent.close()

            for value_hierarchy_parent in values_hierarchy_parent:
                parent_onto_id = value_hierarchy_parent[0]
                list_parent_onto_id.append(parent_onto_id)
                list_parent_child_onto_id.append(parent_onto_id)

        # OntoTermHPHierarchyから子クラスの情報取得
        list_child_onto_id = []
        if onto_child_num > 0:
            cursor_hierarchy_child = OBJ_MYSQL.cursor()
            cursor_hierarchy_child.execute(sql_hierarchy_child, (onto_id,))
            values_hierarchy_child = cursor_hierarchy_child.fetchall()
            cursor_hierarchy_child.close()

            for value_hierarchy_child in values_hierarchy_child:
                child_onto_id = value_hierarchy_child[0]
                list_child_onto_id.append(child_onto_id)
                list_parent_child_onto_id.append(child_onto_id)

        # OntoTermHPInformations_fmtテーブルからクエリにマッチするレコードを取得
        in_onto_id=', '.join(map(lambda x: '%s', list_parent_child_onto_id))
        sql_informations_fmt = sql_informations_fmt % in_onto_id
        cursor_informations_fmt = OBJ_MYSQL.cursor()
        cursor_informations_fmt.execute(sql_informations_fmt, list_parent_child_onto_id)
        values_informations_fmt = cursor_informations_fmt.fetchall()
        cursor_informations_fmt.close()

        dict_all_class = {}
        for value_informations_fmt in values_informations_fmt:
            onto_id         = value_informations_fmt[0]
            onto_name       = value_informations_fmt[1]
            onto_synonym    = value_informations_fmt[2]
            onto_comment    = value_informations_fmt[3]
            onto_definition = value_informations_fmt[4]
            onto_child_num  = value_informations_fmt[5]
            onto_name_ja    = value_informations_fmt[6]
            dict_all_class[onto_id] = {}
            dict_all_class[onto_id]['id']      = onto_id
            dict_all_class[onto_id]['name']    = onto_name
            dict_all_class[onto_id]['name_ja'] = onto_name_ja if onto_name_ja != "" else onto_name
            dict_all_class[onto_id]['count']   = onto_child_num

        # JSON作成
        ## self class リスト
        list_self_class = []
        list_self_class.append(dict_self_class)

        ## parent class リスト
        list_super_class = []
        if len(list_parent_onto_id) > 0:
            for parent_onto_id in list_parent_onto_id:
                list_super_class.append(dict_all_class[parent_onto_id])

        ## child class リスト
        list_sub_class = []
        if len(list_child_onto_id) > 0:
            for child_onto_id in list_child_onto_id:
                list_sub_class.append(dict_all_class[child_onto_id])
        
        ## dict_json に収納
        dict_json['selfclass']  = list_self_class
        dict_json['superclass'] = list_super_class
        dict_json['subclass']   = list_sub_class

    OBJ_MYSQL.close()
    return dict_json


def casemini_tokeninput_icd_10(query_text):

    list_json = []
    tokeninputs = query_text.replace(u'　', u' ').split()
    sql_params = []
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")

    sql_OntoTerm = u"select `ICD-10`,`ICD-10_group`,disease_control_number,disease_name from casemini_icd_10 where ( {0} )  OR ( {1} ) order by `ICD-10`".format(' AND '.join(map(lambda x: "disease_name collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "`ICD-10` collate utf8_unicode_ci like %s", tokeninputs)))
    #app.logger.error(sql_OntoTerm)
    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    cursor_OntoTerm = OBJ_MYSQL.cursor()
    cursor_OntoTerm.execute(sql_OntoTerm, tuple(sql_params))
    values = cursor_OntoTerm.fetchall()
    cursor_OntoTerm.close()
    for value in values:
        dict_json = {}
        dict_json['id']    = value[0]
        dict_json['name']  = value[3]
        dict_json['group'] = value[1]
        dict_json['disease_control_number'] = value[2]
        dict_json['synonym'] = None
        list_json.append(dict_json)
    OBJ_MYSQL.close()
    return list_json


def casemini_tokeninput_omim_orpha(input_text):
    list_json = []
    japanese_pattern = re.compile(r'[\u3040-\u30FF\u4E00-\u9FFF]')
    isJA = bool(japanese_pattern.search(input_text))

    tokeninputs = input_text.replace(u'　', u' ').split()
    sql_params = []
    in_tokeninputs = []
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
        in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")

    sql_OntoTerm = u"select Mondo,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,OMIM,Orphanet from casemini_omim_orpha where ( {0} )  OR ( {1} ) OR ( {2} )  OR ( {3} ) OR ( {4} ) order by Mondo".format(' AND '.join(map(lambda x: "Mondo collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "disease_name_en collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_synonym_en collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_ja collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_synonym_ja collate utf8_unicode_ci like %s", tokeninputs)) )
    #app.logger.error(sql_OntoTerm)
    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    cursor_OntoTerm = OBJ_MYSQL.cursor()
    cursor_OntoTerm.execute(sql_OntoTerm, tuple(sql_params))
    values = cursor_OntoTerm.fetchall()
    cursor_OntoTerm.close()

    for value in values:
        dict_json = {}
        onto_id_synonym = []
        if type(value[2]) is str and len(value[2]):
            list_synonym = value[2].split('|')
            for synonym in list_synonym:
                temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                for in_tokeninput in in_tokeninputs:
                    if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                        temp_synonym = None
                        break
                if temp_synonym is not None:
                    onto_id_synonym.append(synonym)

        if type(value[4]) is str and len(value[4]):
            list_synonym = value[4].split('|')
            for synonym in list_synonym:
                temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                for in_tokeninput in in_tokeninputs:
                    if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                        temp_synonym = None
                        break
                if temp_synonym is not None:
                    onto_id_synonym.append(synonym)

        dict_json['id']       = value[0]
        dict_json['name']     = value[1]
        dict_json['name_en']  = value[1]
        dict_json['name_ja']  = value[3]
        dict_json['omim']     = value[5]
        dict_json['orphanet'] = value[6]

        if isJA and len(value[3])>0:
            dict_json['name'] = value[3]

        if len(onto_id_synonym)>0:
            dict_json['synonym'] = onto_id_synonym
        else:
            dict_json['synonym'] = None
        list_json.append(dict_json)
    OBJ_MYSQL.close()
    return list_json


def casemini_tokeninput_nando(input_text):

    list_json = []

    japanese_pattern = re.compile(r'[\u3040-\u30FF\u4E00-\u9FFF]')
    isJA = bool(japanese_pattern.search(input_text))

    tokeninputs = input_text.replace(u'　', u' ').split()

    sql_params = []
    in_tokeninputs = []
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
        in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")
    for v in tokeninputs:
        sql_params.append("%"+v+"%")

    sql_OntoTerm = u"select NANDO,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,Mondo,notification_number from casemini_nando where ( {0} )  OR ( {1} ) OR ( {2} ) OR ( {3} ) OR ( {4} ) order by NANDO".format(' AND '.join(map(lambda x: "NANDO collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "disease_name_en collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_synonym_en collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_ja collate utf8_unicode_ci like %s", tokeninputs)), ' AND '.join(map(lambda x: "disease_name_synonym_ja collate utf8_unicode_ci like %s", tokeninputs)) )
    #app.logger.error(sql_OntoTerm)
    OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
    cursor_OntoTerm = OBJ_MYSQL.cursor()
    cursor_OntoTerm.execute(sql_OntoTerm, tuple(sql_params))
    values = cursor_OntoTerm.fetchall()
    cursor_OntoTerm.close()

    for value in values:
        dict_json = {}
        onto_id_synonym = []
        if type(value[2]) is str and len(value[2]):
            list_synonym = value[2].split('|')
            for synonym in list_synonym:
                temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                for in_tokeninput in in_tokeninputs:
                    if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                        temp_synonym = None
                        break
                if temp_synonym is not None:
                    onto_id_synonym.append(synonym)

        if type(value[4]) is str and len(value[4]):
            list_synonym = value[4].split('|')
            for synonym in list_synonym:
                temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                for in_tokeninput in in_tokeninputs:
                    if type(temp_synonym) is str and len(temp_synonym) and in_tokeninput not in temp_synonym:
                        temp_synonym = None
                        break
                if temp_synonym is not None:
                    onto_id_synonym.append(synonym)
        dict_json['id']       = value[0]
        dict_json['name']     = value[1]
        dict_json['name_en']  = value[1]
        dict_json['name_ja']  = value[3]
        dict_json['mondo']    = value[5]
        dict_json['notification_number'] = value[6]

        if isJA and len(value[3])>0:
            dict_json['name'] = value[3]

        if len(onto_id_synonym)>0:
            dict_json['synonym'] = onto_id_synonym
        else:
            dict_json['synonym'] = None
        list_json.append(dict_json)
    OBJ_MYSQL.close()
    return list_json


def main():
    print('tokeninput_hpo:')
    print(casemini_tokeninput_hpo("2717",'ja'))
    print('')
    print('popup_hierarchy_hpo:')
    print(casemini_popup_hierarchy_hpo('HP:0002717'))
    print('')
    print('tokeninput_icd_10:')
    print(casemini_tokeninput_icd_10('010'))
    print('')
    print('tokeninput_omim_orpha:')
    print(casemini_tokeninput_omim_orpha('00010'))
    print('')
    print('tokeninput_nando:')
    print(casemini_tokeninput_nando('00010'))
if __name__ == '__main__':
    main()
