# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import re
import json
import MySQLdb
import requests

app = Flask(__name__)


#####
# DB設定
app.config.from_pyfile('../config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']

sparqlist_url = app.config['SPARQLIST_BASE_URL']

# r_mondo_word: GENDER:male|GENDER:female|AGE:congenital|AGE:antenatal
# target: omim|orpha|gene
def pcf_filter_by_mondo_word(r_mondo_word, target):

    hash_target_id = {}

    if r_mondo_word != "":
        isAGE = True
        keyword = r_mondo_word.replace('AGE:','')
        if len(keyword) == len(r_mondo_word):
            isAGE = False
            keyword = r_mondo_word.replace('GENDER:','')

        list_mondo_id = []
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
        sql = u"select OntoID, LOWER(OntoName), LOWER(OntoSynonym) from OntoTermMONDOInformation where OntoName collate utf8_general_ci like %s  OR OntoSynonym collate utf8_general_ci like %s"
        cursor = OBJ_MYSQL.cursor()
        cursor.execute(sql, ( '%'+keyword+'%','%'+keyword+'%',))
        values = cursor.fetchall()
        cursor.close()
        for value in values:
            id      = value[0]
            name    = value[1]
            synonym = value[2]
        
            if isAGE or keyword == 'female':
                list_mondo_id.append(id.replace('MONDO:',''))
            else:
                str = name.replace('female','')
                if str.find('male') >= 0:
                    list_mondo_id.append(id.replace('MONDO:',''))
                else:
                    str = synonym.replace('female','')
                    if str.find('male') >= 0:
                        list_mondo_id.append(id.replace('MONDO:',''))



        if len(list_mondo_id) > 0:

            r_mondo_id = ','.join(list_mondo_id)
            #print (len(list_mondo_id))
            print(r_mondo_id)
            url_api_pcf_filter_get_id_by_mondo_id  = sparqlist_url + "/sparqlist/api/pcf_filter_get_omim_id_by_mondo_id"
            if target == 'orpha':
                url_api_pcf_filter_get_id_by_mondo_id  = sparqlist_url + "/sparqlist/api/pcf_filter_get_orpha_id_by_mondo_id"
            elif target == 'gene':
                url_api_pcf_filter_get_id_by_mondo_id  = sparqlist_url + "/sparqlist/api/pcf_filter_get_gene_id_by_mondo_id"

            dict_param_api_pcf_filter_get_id_by_mondo_id  = {"mondo_id":r_mondo_id}
            r_post_data = requests.post(url_api_pcf_filter_get_id_by_mondo_id, data=dict_param_api_pcf_filter_get_id_by_mondo_id)
            hash_target_id = r_post_data.json()

        OBJ_MYSQL.close()

        
    return hash_target_id


def main():
#    print('male:omim')
#    print(pcf_filter_by_mondo_word("GENDER:male",'omim'))
#    print('--------')
#    print(' ')
    print('female:omim')
    print(pcf_filter_by_mondo_word("GENDER:female",'omim'))
#    print('--------')
#    print(' ')
#    print('male:orpha')
#    print(pcf_filter_by_mondo_word("GENDER:male",'orpha'))
#    print('--------')
#    print(' ')
#    print('female:orpha')
#    print(pcf_filter_by_mondo_word("GENDER:female",'orpha'))
#    print('--------')
#    print(' ')   
#    print('male:gene')    
#    print(pcf_filter_by_mondo_word("GENDER:male",'gene'))
#    print('--------')
#    print(' ')    
#    print('female:gene')    
#    print(pcf_filter_by_mondo_word("GENDER:female",'gene'))
#    print('--------')
#    print(' ')
#    print('childhood:omim')
#    print(pcf_filter_by_mondo_word("AGE:congenital",'omim'))


if __name__ == '__main__':
    main()

