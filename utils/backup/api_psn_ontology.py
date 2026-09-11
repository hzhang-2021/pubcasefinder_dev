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
        SELECT
            ontology_json
        FROM 
            panelsearch_nando_ontology 
        WHERE
            ontology_id = %s
        """,
        (ontology_id,),
        dict_cursor=True
    )


app = Flask(__name__)


def main():
    print('Test regist review:')
    print(api_psn_ontology_get_all_ontology())
    print(api_psn_ontology_get_ontology_data('1'))
if __name__ == '__main__':
    main()
