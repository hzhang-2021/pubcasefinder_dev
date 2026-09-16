# -*- coding: utf-8 -*-

from flask import Flask, session, render_template, request, redirect, url_for, jsonify, make_response, Response, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import re
import MySQLdb
import json
import sys
import datetime
import copy
import mojimoji
import requests
import base64
import traceback
from werkzeug.utils import secure_filename
from werkzeug.datastructures import  FileStorage
from io import StringIO, BytesIO
import csv
# https://blog.capilano-fw.com/?p=398
from flask_babel import Babel
from flask_cors import CORS
# timestamp
from datetime import datetime
from pytz import timezone

# for mysql PooledDB or not pooled db
from db.mysql import init_mysql

# for google authentication
import secrets
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import timedelta

from utils.api_google_auth import api_is_user_admin
from utils.api_google_auth import api_google_auth_create_new_account
from utils.api_google_auth import api_google_auth_get_account_auth_status
from utils.api_google_auth import api_google_auth_authenticate
from utils.api_google_auth import api_google_auth_check_account_auth_status
from utils.api_google_auth import api_google_auth_get_account_by_status
from utils.api_google_auth import api_google_auth_change_account_status
from utils.api_google_auth import api_google_auth_get_user_info_by_google_account
from utils.api_google_auth import api_google_user_modify
from utils.api_google_auth import api_google_auth_get_user_info_list
from utils.api_google_auth import api_google_auth_filter_psn_user_info_list
from utils.api_google_auth import api_google_auth_filter_common_user_info_list
from utils.api_google_auth import api_google_auth_get_user_status_list
from utils.api_google_auth import api_google_auth_get_authentication_code
from utils.api_google_auth import api_psn_admin_load_email
from utils.api_google_auth import api_psn_admin_load_email_detail
from utils.api_google_auth import api_psn_admin_resend_email
from utils.api_google_auth import get_all_email_template
from utils.api_google_auth import get_mail_settings
from utils.api_google_auth import api_psn_admin_modify_email_template
from utils.api_google_auth import AUTH_TYPE_COMMON,AUTH_TYPE_PSN
from utils.api_google_auth import USER_TYPE_DEFAULT
from utils.api_google_auth import STATUS_DELETED,STATUS_DELETED_TO_GO
from utils.api_google_auth import STATUS_BLOCKED,STATUS_BLOCKED_TO_GO
from utils.api_google_auth import STATUS_REJECTED,STATUS_REJECTED_TO_GO
from utils.api_google_auth import STATUS_CANCELLED,STATUS_CANCELLED_TO_GO
from utils.api_google_auth import STATUS_EXPIRED,STATUS_REGISTED,STATUS_EXPIRED_RESET
from utils.api_google_auth import STATUS_AUTHENTICATED,STATUS_PASSED,STATUS_PASSED_TO_GO
from utils.api_google_auth import sendmail
from utils.api_google_auth import sendmail_registry_fail
from utils.api_google_auth import MAIL_TEMPLATE_AUTH,MAIL_TEMPLATE_ACCEPT,MAIL_TEMPLATE_REJECT
from utils.api_google_auth import MAIL_TEMPLATE_BLOCK,MAIL_TEMPLATE_RESTORE,MAIL_TEMPLATE_CANCEL
from utils.api_google_auth import MAIL_TARGET_BY_ID,MAIL_TARGET_BY_UID
from utils.api_google_auth import api_google_auth_add_authlog
from utils.api_google_auth import AUTH_LOG_RESULT_SUCCESS,AUTH_LOG_RESULT_FAIL,AUTH_LOG_ACTION_LOGIN,AUTH_LOG_ACTION_LOGOUT
from utils.api_google_auth import api_google_auth_load_authlog
from utils.api_google_auth import api_psn_get_group_invite_email_template


sys.path.append(os.path.abspath(os.path.dirname(__file__)))


# check input
from utils.check_input import process_input_phenotype

# API for PhenoTouch
from utils.api_get_hpo_by_text import search_hpo_by_text
from utils.api_get_hpo_by_text import search_hpo_by_text_with_dict

# API: get rank OMIM
from utils.api_pcf_get_ranking_by_hpo_id import pcf_get_ranking_by_hpo_id

# API: pcf_get_case_report_by_mondo_id
from utils.api_pcf_get_case_report_by_mondo_id import pcf_get_case_report_by_mondo_id

# API: pcf_get_count_case_report_by_mondo_id
from utils.api_pcf_get_count_case_report_by_mondo_id import pcf_get_count_case_report_by_mondo_id

# API: pcf_filter_get_case_id_by_ncbi_gene_id
from utils.api_pcf_filter_get_case_id_by_ncbi_gene_id import pcf_filter_get_case_id_by_ncbi_gene_id

# API: pcf_filter_get_case_id_by_gene_id
from utils.api_pcf_filter_get_case_id_by_gene_id import pcf_filter_get_case_id_by_gene_id

# API: pcf_filter_get_case_id_by_mondo_id
from utils.api_pcf_filter_get_case_id_by_mondo_id import pcf_filter_get_case_id_by_mondo_id

# API: pcf_filter_get_case_id_by_nando_id
from utils.api_pcf_filter_get_case_id_by_nando_id import pcf_filter_get_case_id_by_nando_id

# API: pcf_filter_get_gene_id_by_pa_id
from utils.api_pcf_filter_get_gene_id_by_pa_id import pcf_filter_get_gene_id_by_pa_id

# API: pcf_filter_get_case_id_by_pa_id
from utils.api_pcf_filter_get_case_id_by_pa_id import pcf_filter_get_case_id_by_pa_id

# API: pcf_filter_get_gene_id_by_paa_id
from utils.api_pcf_filter_get_gene_id_by_paa_id import pcf_filter_get_gene_id_by_paa_id

# API: pcf_filter_get_case_id_by_paa_id
from utils.api_pcf_filter_get_case_id_by_paa_id import pcf_filter_get_case_id_by_paa_id

# API: pcf_filter_get_all_case_id
from utils.api_pcf_filter_get_all_case_id import pcf_filter_get_all_case_id

# API: pcf_filter_by_mondo_word
from utils.api_pcf_filter_by_mondo_text import pcf_filter_by_mondo_word

# API pcf_get_pa_data_by_pa_id
from utils.api_pcf_get_pa_data_by_pa_id import pcf_get_pa_data_by_pa_id

# API pcf_get_paa_data_by_paa_id
from utils.api_pcf_get_paa_data_by_paa_id import pcf_get_paa_data_by_paa_id

# API pcf_get_mondo_data_by_mondo_id
from utils.api_pcf_get_mondo_data_by_mondo_id import pcf_get_mondo_data_by_mondo_id

# API pcf_get_nando_data_by_nando_id
from utils.api_pcf_get_nando_data_by_nando_id import pcf_get_nando_data_by_nando_id

# API pcf_get_gene_data_by_gene_id
from utils.api_pcf_get_gene_data_by_gene_id import pcf_get_gene_data_by_gene_id

# API: pcf_download
from utils.api_pcf_download import pcf_download

# API for Casesharing mini
from utils.api_casemini_get_similar_by_text import casemini_search_similar_by_text_with_dict
from utils.api_casemini_tokeninput import casemini_tokeninput_hpo
from utils.api_casemini_tokeninput import casemini_popup_hierarchy_hpo
from utils.api_casemini_tokeninput import casemini_tokeninput_icd_10
from utils.api_casemini_tokeninput import casemini_tokeninput_omim_orpha
from utils.api_casemini_tokeninput import casemini_tokeninput_nando

# API for PanelSearch(nanbyo)
from utils.api_psn import api_psn_get_panel_by_name
from utils.api_psn import api_psn_group_get_group_panel
from utils.api_psn import api_psn_group_add_group_panel
from utils.api_psn import api_psn_group_delete_group_panel
from utils.api_psn import api_psn_get_multi_class
from utils.api_psn import api_psn_get_panel_upstream_trace
from utils.api_psn import api_psn_get_panel_ontology
from utils.api_psn import api_psn_get_treeview_descendant
from utils.api_psn import api_psn_get_all_panel
from utils.api_psn import api_psn_get_panel_id_match_panel_name_synonym
from utils.api_psn import api_psn_get_panel_id_match_gene_symbol_ncbiid
from utils.api_psn import api_psn_get_nando_id
from utils.api_psn import api_psn_get_panel_name
from utils.api_psn import api_psn_regist_review
from utils.api_psn import api_psn_get_panel_version_info
from utils.api_psn import api_psn_get_all_panel_version
from utils.api_psn import api_psn_get_panel_review
from utils.api_psn import api_psn_get_panel_entity_review
from utils.api_psn import api_psn_get_panel_entity_review_comment
from utils.api_psn import api_psn_delete_panel_entity_review
from utils.api_psn import api_psn_delete_panel_entity_review_comment
from utils.api_psn import api_psn_modify_panel_entity_review_comment
from utils.api_psn import api_psn_add_panel_entity_review_comment
from utils.api_psn import api_psn_get_user_review
from utils.api_psn import api_psn_get_user_review_comment
from utils.api_psn import api_psn_regist_panel_entity_definition
from utils.api_psn import api_psn_get_multi_panel_entity_definition
from utils.api_psn import api_psn_get_panel_entity_definition
from utils.api_psn import api_psn_group_add_group
from utils.api_psn import api_psn_group_update_group
from utils.api_psn import api_psn_group_delete_group
from utils.api_psn import api_psn_group_get_group
from utils.api_psn import api_psn_group_get_group_hash
from utils.api_psn import api_psn_group_add_group_user
from utils.api_psn import api_psn_group_delete_group_user
from utils.api_psn import api_psn_group_get_group_user_hash
from utils.api_psn import api_psn_group_get_user_group_hash
from utils.api_psn import api_psn_group_change_group_user_role
from utils.api_psn import api_psn_load_group_activity_log
from utils.api_psn import api_psn_load_user_activity_log
from utils.api_psn import api_psn_load_incharge_user_activity_log
from utils.api_psn import api_psn_load_user_activity_detail
from utils.api_psn import api_psn_load_user_activity_history
from utils.api_psn import api_psn_load_panel_version_and_entity
from utils.api_psn import api_psn_load_curator_check_history
from utils.api_psn import api_psn_check_user_activity
from utils.api_psn import api_psn_uncheck_user_activity
from utils.api_psn import api_psn_group_is_user_curator_of_some_group
from utils.api_psn import api_psn_group_is_user_curator_of_group
from utils.api_psn import api_psn_group_get_user_role_of_panel
from utils.api_psn import api_psn_group_is_user_role_curator
from utils.api_psn import api_psn_group_is_user_role_reviewer
from utils.api_psn import api_psn_get_panel_all_change_history
from utils.api_psn_ontology import api_psn_ontology_get_all_ontology
from utils.api_psn_ontology import api_psn_ontology_get_ontology_data
from utils.api_psn_ontology import api_psn_ontology_get_last_update_ontology
from utils.api_psn_ontology import api_psn_ontology_update_ontology

# API for PanelSearch
from utils.api_panelsearch import api_panelsearch_mondo_get_disease_and_panel_num
from utils.api_panelsearch import api_panelsearch_mondo_get_descendant
from utils.api_panelsearch import api_panelsearch_mondo_get_hierarchy
from utils.api_panelsearch import api_panelsearch_mondo_get_all_panel
from utils.api_panelsearch import api_panelsearch_mondo_get_panel_by_name
from utils.api_panelsearch import api_panelsearch_mondo_get_panel_by_gene

# API for nanbyodata
from utils.api_common_nanbyo import api_nanbyo_get_panel_hierarchy
from utils.api_common_nanbyo import api_nanbyo_get_panel_descendant


from casesharing.routes import new_bp
from casesharing.google_auth import auth_bp

app = Flask(__name__)

# プロキシの設定を信頼するように設定
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1, x_port=1)

# CookieにSecure属性を付与する設定
#app.config.update(
#    SESSION_COOKIE_SECURE=True,    # Secure 属性
#    SESSION_COOKIE_HTTPONLY=True,  # HttpOnly 属性
#    SESSION_COOKIE_SAMESITE='Lax', # SameSite 属性
#)

CORS(app)
app.config['JSON_AS_ASCII']=False

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,session_id')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,HEAD')
    # The add method cannot be used here, otherwise the problem of The 'Access-Control-Allow-Origin' header contains multiple values ​​will appear.
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


app.secret_key = 'pubcasefinder20260901'


def get_locale():
    if 'lang' not in session:
        session['lang'] = request.accept_languages.best_match(['ja', 'ja_JP', 'en'])
    if request.args.get('lang'):
        session['lang'] = request.args.get('lang')
    return session.get('lang', 'en')
app.jinja_env.globals.update(get_locale=get_locale)
app.jinja_env.globals.update(dbcls_root_url="https://dbcls.rois.ac.jp/")

# flask の　@babel.localeselector
# https://stackoverflow.com/questions/75229322/flask-babel-get-locale-seems-to-be-not-working
babel = Babel(app, locale_selector=get_locale)

# debug
app.debug = True

#####
# DB設定
app.config.from_pyfile('config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']

init_mysql(app)

sparqlist_url = app.config['SPARQLIST_BASE_URL']

####
# service 設定
SERVICE_DISEASESEARCH            = 'diseasesearch'
SERVICE_CASESHAREING             = 'casesharing'
SERVICE_PANELSEARCH              = 'panelsearch'
SERVICE_PANELSEARCH_NANBYO       = 'panelsearch_nanbyo'
SERVICE_PANELSEARCH_NANBYO_ADMIN = 'panelsearch_nanbyo_admin'


#####
# Routing
# http://qiita.com/Morinikki/items/c2af4ffa180856d1bf30
# http://flask.pocoo.org/docs/0.12/quickstart/
#####

#####
# display case
# /
@app.route('/casesharing')
@app.route('/case')
def record():
    session['service'] = SERVICE_CASESHAREING

    uid, google_id, user_info = get_user_info_from_session(SERVICE_CASESHAREING)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    return render_template(
        'record.html',
        r_mail=google_id,
        r_user_info=user_info,
        r_username=r_username,
        r_user_type_admin=r_user_type_admin
    )


#####
# display case
# /
@app.route('/case_re')
def record_re():
    return render_template('record_re.html')


#####
# display case mini
# /
@app.route('/casesharing/hposearch', methods=['GET'])
@app.route('/casesharing/mini', methods=['GET'])
@app.route('/case/hposearch', methods=['GET'])
def hposearch():
    r_lang = "ja"
    r_target = "hpo"
    if request.args.get('target') is not None:
        tmp = request.args.get('target')
        if tmp=='icd_10' or tmp=='omim_orpha' or tmp=='nanbyo':
            r_target = tmp
    return render_template('hposearch.html', r_lang=r_lang, r_target=r_target)


#####
# display top page
# /
@app.route('/')
def index():
    session['service'] = SERVICE_DISEASESEARCH

    uid, google_id, user_info = get_user_info_from_session(SERVICE_DISEASESEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    return render_template(
        'index.html',
        r_service=SERVICE_DISEASESEARCH,
        r_mail=google_id,
        r_username=r_username,
        r_user_type_admin=r_user_type_admin
    )


#####
# display guides page
# /guides
@app.route('/guides')
def guides():
    return render_template('guides.html', r_guide_page='overview')


@app.route('/guides/diseasesearch')
def guides_diseasesearch():
    return render_template('guides.html', r_guide_page='diseasesearch')


@app.route('/guides/casesharing')
def guides_casesharing():
    return render_template('guides.html', r_guide_page='casesharing')


@app.route('/guides/panelsearch')
def guides_panelsearch():
    return render_template('guides.html', r_guide_page='panelsearch')


#####
# display sources page
# /sources
@app.route('/sources')
def sources():
    return render_template('sources.html')


#####
# display history page
# /history
@app.route('/history')
def history():
    return render_template('history.html')


#####
# display terms of service page
# /termsofservice
@app.route('/termsofservice')
def termsofservice():
    return render_template('termsofservice.html')


#####
# display terms of service page(panelsearch_nanbyo)
# /termsofservice_psn
@app.route('/termsofservice_psn')
def termsofservice_psn():
    r_lang = request.args.get('lang') if request.args.get('lang') else 'en'
    session['service'] = SERVICE_PANELSEARCH_NANBYO
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    return render_template(
        'termsofservice_psn.html',
        r_service=SERVICE_PANELSEARCH_NANBYO,
        r_mail=google_id,
        r_username=r_username,
        r_user_type_admin=r_user_type_admin,
        r_lang=r_lang
    )


#####
# display MME API page
# /mme
@app.route('/mme')
def mme():
    return render_template('api.html')


#####
# PubCaseFinder API page
# /api
@app.route('/api')
def api():
    return render_template('api.html')


#####
# display result page
@app.route('/result', methods=['GET'])
def result():
    r_target = ""
    r_phenotype = ""
    r_filter = ""
    r_filter_simple = ""
    r_vgp = ""
    r_size = ""
    r_display_format = ""
    r_lang = ""
    if request.args.get('target') is not None:
        r_target = request.args.get('target')
    if request.args.get('phenotype') is not None:
        r_phenotype = request.args.get('phenotype')
    if request.args.get('filter') is not None:
        r_filter = request.args.get('filter')
    if request.args.get('filter_simple') is not None:
        r_filter_simple = request.args.get('filter_simple')
    if request.args.get('vgp') is not None:
        r_vgp = request.args.get('vgp')
    if request.args.get('size') is not None:
        if request.args.get('size') in  ['10','20','50','100','200']:
            r_size = request.args.get('size')
        else:
            r_size = '10'
    else:
        r_size = '10'
    if request.args.get('display_format') is not None:
        r_display_format = request.args.get('display_format')
    if request.args.get('lang') is not None:
        r_lang = request.args.get('lang')

    if(len(r_phenotype) > 0):
        list_phenotypes = r_phenotype.split(',')
        list_phenotypes_uniq = []
        for phenotype in list_phenotypes:
            if phenotype not in list_phenotypes_uniq and phenotype.replace('_ja', '') not in list_phenotypes_uniq and phenotype + '_ja' not in list_phenotypes_uniq:
                list_phenotypes_uniq.append(phenotype)

        phenotypes = ','.join(list_phenotypes_uniq)
        phenotypes = re.sub(r'^,+', '', phenotypes)
        phenotypes = re.sub(r',+$', '', phenotypes)
        r_phenotype = phenotypes

    if(len(r_filter) > 0):
        list_filters = r_filter.split(',')
        list_filters_uniq = []
        for str_filter in list_filters:
            if str_filter not in list_filters_uniq:
                list_filters_uniq.append(str_filter)

        filters = ','.join(list_filters_uniq)
        filters = re.sub(r'^,+', '', filters)
        filters = re.sub(r',+$', '', filters)
        r_filter = filters

    if(len(r_filter_simple) > 0):
        list_filters = r_filter_simple.split(',')
        list_filters_uniq = []
        for str_filter in list_filters:
            if str_filter not in list_filters_uniq:
                list_filters_uniq.append(str_filter)

        filters = ','.join(list_filters_uniq)
        filters = re.sub(r'^,+', '', filters)
        filters = re.sub(r',+$', '', filters)
        r_filter_simple = filters

    if(len(r_vgp) > 0):
        list_filters = r_vgp.split(',')
        list_filters_uniq = []
        for str_filter in list_filters:
            if str_filter not in list_filters_uniq:
                list_filters_uniq.append(str_filter)

        filters = ','.join(list_filters_uniq)
        filters = re.sub(r'^,+', '', filters)
        filters = re.sub(r',+$', '', filters)
        r_vgp = filters

    uid, google_id, user_info = get_user_info_from_session(SERVICE_DISEASESEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    return render_template(
        'result.html',
        r_service=SERVICE_DISEASESEARCH,
        r_mail=google_id,
        r_username=r_username,
        r_user_type_admin=r_user_type_admin,
        r_target=r_target,
        r_phenotype=r_phenotype,
        r_filter=r_filter,
        r_filter_simple=r_filter_simple,
        r_vgp=r_vgp,
        r_size=r_size,
        r_display_format=r_display_format,
        r_lang=r_lang
    )


#####
# display text2hpo page
# /ehr
@app.route('/ehr')
def ehr():
   return render_template('text2hpo.html')


#####
# display pripority-i page
#
@app.route('/priority-i')
def priority():
    r_id = ""
    if request.args.get('id') is not None:
        r_id = request.args.get('id').strip()
    return render_template('priority-i.html', r_id=r_id)


#####
# API: provide candidate HPO IDs using text as query
# POST method
# /get_hpo_by_text
@app.route('/get_hpo_by_text', methods=['POST'])
def POST_API_GET_HPO_BY_TEXT():
    if request.method == 'POST':
        text = request.form['text']
        if text == "":
            return "none"
    else:
        return "none"
    str_list_hpo = search_hpo_by_text(text)
    return str_list_hpo


#####
# API: provide candidate HPO IDs using text as query
# GET method
# /pcf_get_hpo_by_text?text=[TEXT]
@app.route('/pcf_get_hpo_by_text', methods=['GET'])
def api_pcf_get_hpo_by_text():
    r_text = ""
    if request.args.get('text') is not None:
        r_text = request.args.get('text')
        if r_text == "":
            return "none"
    else:
        return "none"

    return jsonify(search_hpo_by_text_with_dict(r_text))


#####
# API: get ranking using HPO IDs as query
# GET method
# /pcf_get_ranking_by_hpo_id?target=[TARGET]&phenotype=[HPO_ID]
# /pcf_get_ranking_by_hpo_id?target=[TARGET]&phenotype=[HPO_ID]&weight=[WEIGHT]
@app.route('/pcf_get_ranking_by_hpo_id', methods=['GET'])
@app.route('/api/get_diseases', methods=['GET'])
def api_pcf_get_ranking_by_hpo_id():
    r_target    = ""
    r_phenotype = ""
    r_weight    = 1.0

    if request.args.get('target') is not None:
        r_target = request.args.get('target')

    if request.args.get('phenotype') is not None:
        r_phenotype = request.args.get('phenotype')

    if request.args.get('weight') is not None:
        r_weight = float(request.args.get('weight'))

    # check query : phenotypes
    list_dict_phenotype, phenotypes_remove_error, phenotypes_remove_error_ja = process_input_phenotype(r_phenotype)

    if request.method == 'GET':
        dict_result = pcf_get_ranking_by_hpo_id(r_target, phenotypes_remove_error_ja, r_weight)
        return jsonify(dict_result)


#####
# API: Get case reports by MONDO ID
# GET method
# /pcf_get_case_report_by_mondo_id?mondo_id=[MONDO_ID]&lang=[LANG]
# /api/get_case_report?id=[MONDO_ID]
# /api/pcf_get_case_report?id=[MONDO_ID]
@app.route('/pcf_get_case_report_by_mondo_id', methods=['GET'])
@app.route('/api/get_case_report', methods=['GET'])
@app.route('/api/pcf_get_case_report', methods=['GET'])
def api_pcf_get_case_report_by_mondo_id():
    r_mondo_id = ""
    r_lang = ""
    if request.args.get('mondo_id') is not None:
        r_mondo_id = request.args.get('mondo_id')
    if request.args.get('id') is not None:
        r_mondo_id = request.args.get('id')
    if request.args.get('lang') is not None:
        r_lang = request.args.get('lang')
    elif request.args.get('lang') is None:
        r_lang = 'en'

    if request.method == 'GET':
        result = pcf_get_case_report_by_mondo_id(r_mondo_id, r_lang)
        return jsonify(result)


#####
# API: Get count case reports by MONDO ID
# GET method
# /pcf_get_count_case_report_by_mondo_id?mondo_id=[MONDO_ID]&lang=[LANG]
@app.route('/pcf_get_count_case_report_by_mondo_id', methods=['GET'])
def api_pcf_get_count_case_report_by_mondo_id():
    r_mondo_id = ""
    r_lang = ""
    if request.args.get('mondo_id') is not None:
        r_mondo_id = request.args.get('mondo_id')
    if request.args.get('lang') is not None:
        r_lang = request.args.get('lang')

    if request.method == 'GET':
        result = pcf_get_count_case_report_by_mondo_id(r_mondo_id, r_lang)
        return jsonify(result)


#####
# API: Filter case ID list: pcf_filter_get_case_id_by_ncbi_gene_id
# GET method
# /pcf_filter_get_case_id_by_ncbi_gene_id?ncbi_gene_id=[NCBI_GENE_ID]
@app.route('/pcf_filter_get_case_id_by_ncbi_gene_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_ncbi_gene_id():
    r_ncbi_gene_id = ""
    if request.args.get('ncbi_gene_id') is not None:
        r_ncbi_gene_id = request.args.get('ncbi_gene_id')

    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_ncbi_gene_id(r_ncbi_gene_id)
        return jsonify(result)


###### API: Filter case ID list: pcf_filter_get_case_id_by_gene_id
# GET method
# /pcf_filter_get_case_id_by_gene_id?gene_id=[GENE_ID]
@app.route('/pcf_filter_get_case_id_by_gene_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_gene_id():
    r_gene_id = ""
    if request.args.get('gene_id') is not None:
        r_gene_id = request.args.get('gene_id')
    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_gene_id(r_gene_id)
        return jsonify(result)

#####
# API: Filter case ID list: pcf_filter_get_case_id_by_mondo_id
# GET method
# /pcf_filter_get_case_id_by_mondo_id?mondo_id=[MONDO_ID]
@app.route('/pcf_filter_get_case_id_by_mondo_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_mondo_id():

    r_mondo_id = ""

    if request.args.get('mondo_id') is not None:
        r_mondo_id = request.args.get('mondo_id')

    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_mondo_id(r_mondo_id)
        return jsonify(result)

#####
# API: Filter case ID list: pcf_filter_get_case_id_by_nando_id
# GET method
# /pcf_filter_get_case_id_by_nando_id?nando_id=[NANDO_ID]
@app.route('/pcf_filter_get_case_id_by_nando_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_nando_id():

    r_nando_id = ""

    if request.args.get('nando_id') is not None:
        r_nando_id = request.args.get('nando_id')

    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_nando_id(r_nando_id)
        return jsonify(result)


#####
# API: Filter case ID list: pcf_filter_get_case_id_by_pa_id
# GET method
# /pcf_filter_get_case_id_by_pa_id?pa_id=[PA_ID]
@app.route('/pcf_filter_get_case_id_by_pa_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_pa_id():

    r_pa_id = ""

    if request.args.get('pa_id') is not None:
        r_pa_id = request.args.get('pa_id')

    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_pa_id(r_pa_id)
        return jsonify(result)



#####
# API: Filter case ID list: pcf_filter_get_case_id_by_paa_id
# GET method                                                                                                                  
# /pcf_filter_get_case_id_by_paa_id?paa_id=[PAA_ID]
@app.route('/pcf_filter_get_case_id_by_paa_id', methods=['GET'])
def api_pcf_filter_get_case_id_by_paa_id():

    r_paa_id = ""

    if request.args.get('paa_id') is not None:
        r_paa_id = request.args.get('paa_id')

    if request.method == 'GET':
        result = pcf_filter_get_case_id_by_paa_id(r_paa_id)
        return jsonify(result)


#####
# API: Filter case ID list: pcf_filter_get_all_case_id
# GET method
# /pcf_filter_get_all_case_id
@app.route('/pcf_filter_get_all_case_id', methods=['GET'])
def api_pcf_filter_get_all_case_id():
    result = pcf_filter_get_all_case_id()
    return jsonify(result)

#####
# API: Filter gene ID list: pcf_filter_get_gene_id_by_pa_id
# GET method
# /pcf_filter_get_gene_id_by_pa_id
@app.route('/pcf_filter_get_gene_id_by_pa_id', methods=['GET'])
def api_pcf_filter_get_gene_id_by_pa_id():

    r_pa_id = ""

    if request.args.get('pa_id') is not None:
        r_pa_id = request.args.get('pa_id')

    if request.method == 'GET':
        result = pcf_filter_get_gene_id_by_pa_id(r_pa_id)
        return jsonify(result)


#####
# API: Filter gene ID list: pcf_filter_get_gene_id_by_paa_id
# GET method
# /pcf_filter_get_gene_id_by_paa_id
@app.route('/pcf_filter_get_gene_id_by_paa_id', methods=['GET'])
def api_pcf_filter_get_gene_id_by_paa_id():

    r_paa_id = ""

    if request.args.get('paa_id') is not None:
        r_paa_id = request.args.get('paa_id')

    if request.method == 'GET':
        result = pcf_filter_get_gene_id_by_paa_id(r_paa_id)
        return jsonify(result)


# API: Filter PA DATA: pcf_get_pa_data_by_pa_id
# GET method
# /pcf_get_pa_data_by_pa_id
@app.route('/pcf_get_pa_data_by_pa_id', methods=['GET'])
def api_pcf_get_pa_data_by_pa_id():

    r_pa_id = ""

    if request.args.get('pa_id') is not None:
        r_pa_id = request.args.get('pa_id')

    if request.method == 'GET':
        result = pcf_get_pa_data_by_pa_id(r_pa_id)
        return jsonify(result)

# API: Filter PAA DATA: pcf_get_paa_data_by_paa_id
# GET method
# /pcf_get_paa_data_by_paa_id
@app.route('/pcf_get_paa_data_by_paa_id', methods=['GET'])
def api_pcf_get_paa_data_by_paa_id():

    r_paa_id = ""

    if request.args.get('paa_id') is not None:
        r_paa_id = request.args.get('paa_id')

    if request.method == 'GET':
        result = pcf_get_paa_data_by_paa_id(r_paa_id)
        return jsonify(result)


# API: Filter MONDO DATA: pcf_get_mondo_data_by_mondo_id
# GET method
# /pcf_get_mondo_data_by_mondo_id
@app.route('/pcf_get_mondo_data_by_mondo_id', methods=['GET'])
def api_pcf_get_mondo_data_by_mondo_id():

    r_mondo_id = ""
    if request.args.get('mondo_id') is not None:
        r_mondo_id = request.args.get('mondo_id')

    if request.method == 'GET':
        result = pcf_get_mondo_data_by_mondo_id(r_mondo_id)
        return jsonify(result)


# API: Filter NANDO DATA: pcf_get_nando_data_by_nando_id
# GET method
# /pcf_get_nando_data_by_nando_id
@app.route('/pcf_get_nando_data_by_nando_id', methods=['GET'])
def api_pcf_get_nando_data_by_nando_id():

    r_nando_id = ""
    if request.args.get('nando_id') is not None:
        r_nando_id = request.args.get('nando_id')

    if request.method == 'GET':
        result = pcf_get_nando_data_by_nando_id(r_nando_id)
        return jsonify(result)


# API: Filter GENE DATA: pcf_get_gene_data_by_gene_id
# GET method
# /pcf_get_gene_data_by_gene_id
@app.route('/pcf_get_gene_data_by_gene_id', methods=['GET'])
def api_pcf_get_gene_data_by_gene_id():

    r_gene_id = ""
    if request.args.get('gene_id') is not None:
        r_gene_id = request.args.get('gene_id')
        result = pcf_get_gene_data_by_gene_id(r_gene_id)
        return jsonify(result)

    return jsonify({})

# API: Filter : pcf_filter_get_omim_id_by_gender
#               pcf_filter_get_omim_id_by_age
# GET method
#
@app.route('/pcf_filter_get_omim_id_by_gender', methods=['GET'])
@app.route('/pcf_filter_get_omim_id_by_age',   methods=['GET'])
def api_pcf_filter_get_omim_id_by_mondo_keyword():

    result = {}
    r_mondo_word = ""
    if request.args.get('gender') is not None:
        r_mondo_word = request.args.get('gender')
    if request.args.get('age') is not None:
        r_mondo_word = request.args.get('age')

    if len(r_mondo_word) > 0:
        result = pcf_filter_by_mondo_word(r_mondo_word,'omim')

    return jsonify(result)


# API: Filter : pcf_filter_get_orpha_id_by_gender
#               pcf_filter_get_orpha_id_by_age
# GET method
#
@app.route('/pcf_filter_get_orpha_id_by_gender', methods=['GET'])
@app.route('/pcf_filter_get_orpha_id_by_age',   methods=['GET'])
def api_pcf_filter_get_orpha_id_by_mondo_keyword():

    result = {}
    r_mondo_word = ""
    if request.args.get('gender') is not None:
        r_mondo_word = request.args.get('gender')
    if request.args.get('age') is not None:
        r_mondo_word = request.args.get('age')

    if len(r_mondo_word) > 0:
        result = pcf_filter_by_mondo_word(r_mondo_word,'orpha')

    return jsonify(result)


# API: Filter : pcf_filter_get_gene_id_by_gender
#               pcf_filter_get_gene_id_by_age
# GET method
#
@app.route('/pcf_filter_get_gene_id_by_gender', methods=['GET'])
@app.route('/pcf_filter_get_gene_id_by_age',   methods=['GET'])
def api_pcf_filter_get_gene_id_by_mondo_keyword():
    result = {}
    r_mondo_word = ""
    if request.args.get('gender') is not None:
        r_mondo_word = request.args.get('gender')
    if request.args.get('age') is not None:
        r_mondo_word = request.args.get('age')

    if len(r_mondo_word) > 0:
        result = pcf_filter_by_mondo_word(r_mondo_word,'gene')

    return jsonify(result)


#####
# API: 
# GET method
# /api/pcf_expand_get_mondo_id_by_mondo_id
@app.route('/api/pcf_expand_get_mondo_id_by_mondo_id', methods=['GET'])
def pcf_expand_get_mondo_id_by_mondo_id():
    r_mondo_id = ""
    if request.args.get('mondo_id') is not None:
        r_mondo_id = request.args.get('mondo_id')

    url_api_pcf_expand_get_mondo_id_by_mondo_id  = sparqlist_url + "/sparqlist/api/pcf_expand_get_mondo_id_by_mondo_id_min200_onlyone"
    dict_param = {"mondo_id":r_mondo_id}
    r_post = requests.post(url_api_pcf_expand_get_mondo_id_by_mondo_id, data=dict_param)
    json_post = r_post.json()
    return jsonify(json_post)

    #list_mondo_id = ["MONDO:0002118"]
    #return jsonify(list_mondo_id)



#####
# API: 
# GET method
# /api/pcf_expand_get_nando_id_by_nando_id
@app.route('/api/pcf_expand_get_nando_id_by_nando_id', methods=['GET'])
def pcf_expand_get_nando_id_by_nando_id():
    r_nando_id = ""
    if request.args.get('nando_id') is not None:
        r_nando_id = request.args.get('nando_id')

    list_nando_id = ["NANDO:1200473","NANDO:2200865"]
    #return jsonify(result)
    return jsonify(list_nando_id)



#####
# API: Share URL
# GET method
# /pcf_share?share=[SHARE]&url=[URL]
@app.route('/pcf_share', methods=['GET','POST'])
def api_pcf_get_share():
    r_share = ""
    r_url = ""
    if request.args.get('share') is not None:
        r_share = request.args.get('share')

    if request.args.get('url') is not None:
        r_url = request.args.get('url')

    if r_share == "url":
        app.logger.error(r_url)

    return ('OK'), 200


#####
# API: Get Data Record
# GET method
# /api/get_data_record?target=[RECORD_TARGET]&id=[RECORD_ID]
# /api/pcf_get_data_record?target=[RECORD_TARGET]&id=[RECORD_ID]
@app.route('/api/get_data_record', methods=['GET'])
@app.route('/api/pcf_get_data_record', methods=['GET'])
def api_pcf_get_data_record():
    r_target = ""
    r_id     = ""
    if request.args.get('target') is not None:
        r_target = request.args.get('target')
    if request.args.get('id') is not None:
        r_id = request.args.get('id')

    # get data record
    url = ""
    dict_param = {}
    if r_target == "omim":
        url = sparqlist_url + "/sparqlist/api/pcf_get_omim_data_by_omim_id"
        dict_param = {"omim_id":r_id}
    if r_target == "orphanet":
        url = sparqlist_url + "/sparqlist/api/pcf_get_orpha_data_by_orpha_id"
        dict_param = {"orpha_id":r_id}
    if r_target == "gene":
        url = sparqlist_url + "/sparqlist/api/pcf_get_gene_data_by_ncbi_gene_id"
        dict_param = {"ncbi_gene_id":r_id}

    if request.method == 'GET':
        if url != "":
            r_data = requests.get(url, params=dict_param)
            json_data = r_data.json()
            return jsonify(json_data)
        else:
            return


#####
# API: Get DPAs
# GET method
# /api/pcf_get_disease_phenotype_associations_by_disease_id
@app.route('/api/pcf_get_disease_phenotype_associations_by_disease_id', methods=['GET'])
def api_pcf_get_disease_phenotype_associations_by_disease_id():
    r_target = ""
    r_id     = ""
    if request.args.get('target') is not None:
        r_target = request.args.get('target')
    if request.args.get('id') is not None:
        r_id = request.args.get('id')

    # get data record
    url = ""
    dict_param = {}
    if r_target == "omim":
        url = sparqlist_url + "/sparqlist/api/pcf_get_hpo_data_by_omim_id"
        dict_param = {"omim_id":r_id}
    if r_target == "orphanet":
        url = sparqlist_url + "/sparqlist/api/pcf_get_hpo_data_by_orpha_id"
        dict_param = {"orpha_id":r_id}

    if request.method == 'GET':
        if url != "":
            r_data = requests.get(url, params=dict_param)
            json_data = r_data.json()
            return jsonify(json_data)
        else:
            return


#####
# API: Get GPAs
# GET method
# /api/pcf_get_gene_phenotype_associations_by_gene_id
@app.route('/api/pcf_get_gene_phenotype_associations_by_gene_id', methods=['GET'])
def api_pcf_get_gene_phenotype_associations_by_gene_id():
    r_id     = ""
    if request.args.get('id') is not None:
        r_id = request.args.get('id')

    # get data record
    url = sparqlist_url + "/sparqlist/api/pcf_get_hpo_data_by_gene_id"
    dict_param = {"ncbi_gene_id":r_id}

    if request.method == 'GET':
        if url != "":
            r_data = requests.get(url, params=dict_param)
            json_data = r_data.json()
            return jsonify(json_data)
        else:
            return


#####
# API: Download
# GET method
# /pcf_download?target=[TARGET]&phenotype=[HPO_ID]&target_id=[TARGET_ID]&format=[FORMAT]&range=[RANGE]
# /pcf_download?target=[TARGET]&phenotype=[HPO_ID]&target_id=[TARGET_ID]&format=[FORMAT]&range=[RANGE]&weight=[WEIGHT]
# /pcf_download?target=[TARGET]&phenotype=[HPO_ID]&target_id=[TARGET_ID]&format=[FORMAT]&range=[RANGE]&filter=[FILTER]
# /api/get_ranked_list?target=[TARGET]&format=[FORMAT]&hpo_id=[HPO_ID]
# /api/pcf_get_ranked_list?target=[TARGET]&format=[FORMAT]&hpo_id=[HPO_ID]
@app.route('/pcf_download', methods=['GET', 'POST'])
@app.route('/api/get_ranked_list', methods=['GET', 'POST'])
# Temporarily disabled due to abusive traffic on the legacy endpoint.
@app.route('/api/pcf_get_ranked_list', methods=['GET', 'POST'])
def api_pcf_download():
    r_target    = ""
    r_phenotype = ""
    r_target_id = ""
    r_format    = ""
    r_range     = ""
    r_weight    = 1.0
    r_filter    = ""

    if request.method == 'GET':
        if request.args.get('target') is not None:
            r_target = request.args.get('target')
        if request.args.get('phenotype') is not None:
            r_phenotype = request.args.get('phenotype')
        if request.args.get('hpo_id') is not None:
            r_phenotype = request.args.get('hpo_id')
        if request.args.get('target_id') is not None:
            r_target_id = request.args.get('target_id')
        if request.args.get('format') is not None:
            r_format = request.args.get('format')
        if request.args.get('range') is not None:
            r_range = request.args.get('range')
        if request.args.get('weight') is not None:
            r_weight = request.args.get('weight')
        if request.args.get('filter') is not None:
            r_filter = request.args.get('filter')
    else:
        if request.form is not None:
            if 'target' in request.form:
                r_target = request.form['target']
            if 'phenotype' in request.form:
                r_phenotype = request.form['phenotype']
            if 'hpo_id' in request.form:
                r_phenotype = request.form['hpo_id']
            if 'target_id' in request.form:
                r_target_id = request.form['target_id']
            if 'format' in request.form:
                r_format = request.form['format']
            if 'range' in request.form:
                r_range = request.form['range']
            if 'weight' in request.form:
                r_weight = request.form['weight']
            if 'filter' in request.form:
                r_filter = request.form['filter']
#       request.json で415エラーになる。使用しているか不明でコメントアウト。サービスに影響がなければ削除して良い.20241122
#        if request.json is not None:
#            print("json")
#            if 'target' in request.json:
#                r_target = request.json['target']
#            if 'phenotype' in request.json:
#                r_phenotype = request.json['phenotype']
#            if 'hpo_id' in request.json:
#                r_phenotype = request.json['hpo_id']
#            if 'target_id' in request.json:
#                r_target_id = request.json['target_id']
#            if 'format' in request.json:
#                r_jsonat = request.json['format']
#            if 'range' in request.json:
#                r_range = request.json['range']
#            if 'weight' in request.json:
#                r_weight = request.json['weight']
#            if 'filter' in request.json:
#                r_filter = request.json['filter']

    utc_now = datetime.now(timezone('UTC'))
    jst_now = utc_now.astimezone(timezone('Asia/Tokyo'))
    ts = jst_now.strftime("%Y%m%d-%H%M%S")
    
    if r_format == "json":
        json_data = pcf_download(r_target, r_phenotype, r_target_id, r_format, r_range, r_weight, r_filter)
        res = make_response(json.dumps(json_data, indent=4))
        res.headers["Content-Type"] = "application/json"
        res.headers["Content-disposition"] = "attachment; filename=" + "pubcasefinder_" + ts + ".json"
        #res.headers["Content-Encoding"] = "gzip"
        return res
    elif r_format == "tsv":
        tsv_data = pcf_download(r_target, r_phenotype, r_target_id, r_format, r_range, r_weight, r_filter)
        res = make_response("\n".join(tsv_data))
        res.headers["Content-Type"] = "text/tab-separated-values"
        res.headers["Content-disposition"] = "attachment; filename=" + "pubcasefinder_" + ts + ".tsv"
        #res.headers["Content-Encoding"] = "gzip"
        return res


#####
# tokeninput_hpo()
# complement input for phenotypes
#####
@app.route('/tokeninput_hpo', methods=['GET', 'POST'])
def tokeninput_hpo():

    list_json = []

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        #tokeninput = request.args.get("q")
        tokeninputs = request.args.get("q").replace(u'　', u' ').split()
        lang = request.args.get("lang")
        sql_params = []
        in_tokeninputs = []
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
            in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
        for v in tokeninputs:
            sql_params.append("%"+v+"%")

        # OntoTermテーブルからHPのtermを検索
        ## SQLのLIKEを使うときのTips
        ### http://d.hatena.ne.jp/heavenshell/20111027/1319712031
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
        # ICテーブルに存在する各termの頻度で、表示するtermをソート
        #sql_OntoTerm = u"select distinct a.uid, a.uid_value, b.FreqSelf from IndexFormHP as a left join IC as b on replace(a.uid, '_ja', '')=b.OntoID where a.uid_value like %s order by b.FreqSelf desc, value"
        #sql_OntoTerm = u"select distinct a.uid, a.value, c.OntoSynonym, b.FreqSelf from IndexFormHP as a left join IC as b on replace(a.uid, '_ja', '')=b.OntoID LEFT JOIN OntoTermHPInformation AS c ON a.uid=c.OntoID where {0} OR (LENGTH(a.value)=CHARACTER_LENGTH(a.value) AND a.uid IN (SELECT OntoID FROM OntoTermHPSynonym WHERE {1})) order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
        sql_OntoTerm = ""
        if lang.startswith('ja') :
            sql_OntoTerm = u"select  distinct a.uid, a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on replace(a.uid, '_ja', '')=b.OntoID LEFT JOIN OntoTermHPInformation AS c ON replace(a.uid, '_ja', '')=c.OntoID where ( {0}  AND LENGTH(a.value)!=CHARACTER_LENGTH(a.value) )  OR ( a.uid IN (SELECT OntoID FROM OntoTermHPSynonymJa WHERE {1})) order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
        elif lang.startswith('en,ja'):
            for v in tokeninputs:
                sql_params.append("%"+v+"%")
            sql_OntoTerm = u"select  distinct  a.uid,  a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on replace(a.uid, '_ja', '')=b.OntoID LEFT JOIN OntoTermHPInformation AS c ON replace(a.uid, '_ja', '')=c.OntoID where {0} OR (a.uid IN (SELECT OntoID FROM OntoTermHPSynonym WHERE {1}) ) OR (a.uid IN (SELECT OntoID FROM OntoTermHPSynonymJa WHERE {2}) )  order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
        elif lang.startswith('en') :
            sql_OntoTerm = u"select  distinct a.uid, a.value, c.OntoSynonym, b.FreqSelf, c.OntoSynonymJa from IndexFormHP as a LEFT JOIN IC as b on a.uid=b.OntoID LEFT JOIN OntoTermHPInformation AS c ON a.uid=c.OntoID where ( {0}  AND LENGTH(a.value)=CHARACTER_LENGTH(a.value) )  OR ( a.uid IN (SELECT OntoID FROM OntoTermHPSynonym WHERE {1})) order by b.FreqSelf desc, value".format(' AND '.join(map(lambda x: "a.uid_value collate utf8_unicode_ci like %s", tokeninputs)),' AND '.join(map(lambda x: "OntoSynonym collate utf8_unicode_ci like %s", tokeninputs)))
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

    return jsonify(list_json)


#####
# popup_hierarchy_hpo()
# オントロジーのバージョンをSQL内で"20170630"に固定しているので、要修正
#####
@app.route('/popup_hierarchy_hpo', methods=['GET', 'POST'])
def popup_hierarchy_hpo():

    list_json = []

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        #onto_id = request.args.get("q")
        onto_id_pre = request.args.get("q")
        onto_id = onto_id_pre.replace('_ja', '')

        # MySQLへ接続
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")

        # JSONデータ
        dict_json = {}

        # OntoTermHPInformationテーブルから情報取得
        sql_information = u"select OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoParentNum, OntoChildNum, OntoNameJa from OntoTermHPInformation where OntoID=%s"
        sql_informations_fmt = u"select OntoID, OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoChildNum, OntoNameJa from OntoTermHPInformation where OntoID in (%s)"

        sql_hierarchy_parent = u"select OntoParentID from OntoTermHPHierarchy where OntoID=%s"
        sql_hierarchy_child  = u"select OntoID from OntoTermHPHierarchy where OntoParentID=%s"

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

    return jsonify(dict_json)




#####
# tokeninput_filter()
# complement input for genes/variants
#####
@app.route('/tokeninput_filter', methods=['GET', 'POST'])
def tokeninput_filter():

    list_json = []

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        #tokeninput = request.args.get("q")
        #tokeninputs = request.args.get("q").replace(u'　', u' ').replace('HP','hp').split()
        #tokeninputs = request.args.get("q").replace(u'　', u' ').lower().split()
        input_text = request.args.get("q").replace(u'　', u' ').lower()
        japanese_pattern = re.compile(r'[\u3040-\u30FF\u4E00-\u9FFF]')
        isJA = bool(japanese_pattern.search(input_text))
        tokeninputs = input_text.split()
        sql_params = []
        in_tokeninputs = []
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
            in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
        for v in tokeninputs:
            sql_params.append("%"+v+"%")

        # DiseaseGeneテーブルからSymbol及びSynonymを検索
        ## SQLのLIKEを使うときのTips
        ### http://d.hatena.ne.jp/heavenshell/20111027/1319712031
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
        # IndexFormSearchOrphanetOMIMテーブルからクエリにマッチするレコードを取得
        sql_IndexFormSearch = \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  OntoID AS uid " \
                              u" ,OntoName AS Symbol " \
                              u" ,OntoSynonym AS Synonyms " \
                              u" ,OntoNameJa AS name_ja " \
                              u" ,NULL AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(OntoID,' | ',OntoName,' | ',IFNULL(OntoNameJa,''),' | ',IFNULL(OntoSynonym,'')))) AS uid_value " \
                              u" ,'HP' AS source " \
                              u"FROM " \
                              u"  OntoTermHPInformation " \
                              u"WHERE " \
                              u"  OntoID IN (SELECT OntoDescendantID FROM OntoTermHPDescendant WHERE OntoID='HP:0000005') " \
                              u") AS A WHERE " \
                              u"{0}" \
                              u" UNION " \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  OntoTermMONDOInformation.OntoID AS uid " \
                              u" ,OntoName AS Symbol " \
                              u" ,OntoSynonym AS Synonyms " \
                              u" ,OntoNameJa AS name_ja " \
                              u" ,OntoDbxrefName AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(OntoTermMONDOInformation.OntoID,' | ',OntoName,' | ',IFNULL(OntoNameJa,''),' | ',IFNULL(OntoSynonym,''),' | ',IFNULL(OntoDbxrefName,'')))) AS uid_value " \
                              u" ,'MONDO' AS source " \
                              u"FROM " \
                              u"  OntoTermMONDOInformation " \
                              u"LEFT JOIN ( " \
                              u"  SELECT " \
                              u"    OntoVersion " \
                              u"   ,OntoID " \
                              u"   ,GROUP_CONCAT(DISTINCT OntoDbxrefName SEPARATOR ' | ') AS OntoDbxrefName " \
                              u"  FROM " \
                              u"    OntoTermMONDODbxref " \
                              u"  WHERE " \
                              u"    OntoDbxrefDb='ENT' " \
                              u"  GROUP BY " \
                              u"    OntoID " \
                              u") AS OntoTermMONDODbxref ON OntoTermMONDODbxref.OntoVersion=OntoTermMONDOInformation.OntoVersion AND OntoTermMONDODbxref.OntoID=OntoTermMONDOInformation.OntoID " \
                              u") AS A WHERE " \
                              u"{0}" \
                              u" UNION " \
                              u"select distinct uid, " \
                              u" COALESCE(DiseaseGeneOMIM.Symbol,DiseaseGene.Symbol) AS Symbol" \
                              u",COALESCE(DiseaseGeneOMIM.Synonym,DiseaseGene.Synonym) AS Synonyms " \
                              u",null AS name_ja " \
                              u",null AS EntrezID " \
                              u"from IndexFormSearchOrphanetOMIM " \
                              u"LEFT JOIN (SELECT distinct SymbolSynonym,Symbol,Synonym,Source,EntrezID FROM DiseaseGene) AS DiseaseGene ON DiseaseGene.EntrezID=IndexFormSearchOrphanetOMIM.uid AND LEFT(DiseaseGene.SymbolSynonym,300)=IndexFormSearchOrphanetOMIM.value " \
                              u"LEFT JOIN (SELECT distinct SymbolSynonym,Symbol,Synonym,Source,EntrezID FROM DiseaseGeneOMIM) AS DiseaseGeneOMIM ON DiseaseGeneOMIM.EntrezID=IndexFormSearchOrphanetOMIM.uid AND LEFT(DiseaseGeneOMIM.SymbolSynonym,300)=IndexFormSearchOrphanetOMIM.value " \
                              u" WHERE {0}"

        #sql_IndexFormSearch = sql_IndexFormSearch.format(' AND '.join(map(lambda x: "uid_value collate utf8_str_ci like %s", tokeninputs)))
        sql_IndexFormSearch = sql_IndexFormSearch.format(' AND '.join(map(lambda x: "uid_value like %s", tokeninputs)))
        #app.logger.info(sql_IndexFormSearch)
        #app.logger.info(tuple(sql_params))

        cursor_IndexFormSearch = OBJ_MYSQL.cursor()
        #cursor_IndexFormSearch.execute(sql_IndexFormSearch, ("%" + tokeninput.lower() +"%","%" + tokeninput.lower() +"%","%" + tokeninput.lower() +"%"))
        cursor_IndexFormSearch.execute(sql_IndexFormSearch, tuple(sql_params))
        values = cursor_IndexFormSearch.fetchall()
        cursor_IndexFormSearch.close()

        #in_tokeninput = mojimoji.zen_to_han(tokeninput, kana=False).lower()

        #app.logger.info(in_tokeninputs)

        for value in values:
            #app.logger.info(value)
            #app.logger.info(type(value[3]))
            dict_json = {}
            uid         = mojimoji.zen_to_han(value[0], kana=False).lower()
            uid_value   = mojimoji.zen_to_han(value[1], kana=False).lower()
            synonym_arr = []
            source_arr = []

            name_ja = None
            if isinstance(value[3],str) and len(value[3]):
                name_ja = mojimoji.zen_to_han(value[3], kana=False).lower()

            #app.logger.info(uid)
            #app.logger.info(uid_value)
            #app.logger.info(name_ja)

            uid_flag = True
            uid_value_flag = True
            for in_tokeninput in in_tokeninputs:
                if not isinstance(uid,str) or not len(uid) or not in_tokeninput in uid:
                    uid_flag = False
                if not isinstance(uid_value,str) or not len(uid_value) or not in_tokeninput in uid_value:
                    #app.logger.info(type(uid_value))
                    #app.logger.info(len(uid_value))
                    #app.logger.info(in_tokeninput in uid_value)
                    uid_value_flag = False
                if not uid_flag and not uid_value_flag:
                    #app.logger.info(in_tokeninput)
                    break

            if not uid_flag:
                uid = None

            if not uid_value_flag:
                uid_value = None

            #app.logger.info(uid)
            #app.logger.info(uid_value)

            if uid is None and uid_value is None and isinstance(value[2],str) and len(value[2]):
                list_synonym = value[2].split(' | ')
                for synonym in list_synonym:
                    temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                    temp_synonym_flag = True
                    for in_tokeninput in in_tokeninputs:
                        if not isinstance(temp_synonym,str) or not len(temp_synonym) or not in_tokeninput in temp_synonym:
                            temp_synonym_flag = False
                            break
                    if temp_synonym_flag:
                        synonym_arr.append(synonym)

            #if not name_ja is None:
            #    app.logger.info(name_ja)
            #    app.logger.info(type(name_ja))
            #    app.logger.info(len(name_ja))

            if isinstance(name_ja,str) and len(name_ja):
                name_ja_flag = True
                for in_tokeninput in in_tokeninputs:
                    if not in_tokeninput in name_ja:
                        #app.logger.info(in_tokeninput)
                        #app.logger.info(isinstance(in_tokeninput,str))
                        name_ja_flag = False
                        break
                if not name_ja_flag:
                    name_ja = None
            #app.logger.info(name_ja)

            #app.logger.info(uid)
            #app.logger.info(uid_value)
            #app.logger.info(synonym_arr)
            #app.logger.info(name_ja)

            if uid is None and uid_value is None and not len(synonym_arr) and name_ja is None:
                continue


            #if type(value[3]) is str and len(value[3]):
            #    list_source = value[3].split(';')
            #    for source in list_source:
            #        source = source.strip()
            #        if type(source) is str and len(source):
            #            source_arr.append(source)

            if isinstance(name_ja,str) and len(name_ja):
                dict_json['id']   = value[0].replace('ENT:','GENEID:') + "_ja"
                dict_json['name'] = value[3]
            else:
                dict_json['id']   = value[0].replace('ENT:','GENEID:')
                dict_json['name'] = value[1]

            if isJA and len(value[3])>0:
                dict_json['id']   = value[0].replace('ENT:','GENEID:') + "_ja"
                dict_json['name'] = value[3]

            if len(synonym_arr)>0:
                dict_json['synonym'] = synonym_arr
            else:
                dict_json['synonym'] = None

            if len(source_arr)>0:
                dict_json['source'] = source_arr
            else:
                dict_json['source'] = None

            if isinstance(value[4],str) and len(value[4]):
                dict_json['EntrezID'] = value[4]
            else:
                dict_json['EntrezID'] = None

            list_json.append(dict_json)
            #app.logger.info(dict_json)
            #app.logger.info('')

        OBJ_MYSQL.close()

    return jsonify(list_json)

#####
# tokeninput_vgp()
# complement input for genes/variants
#####
@app.route('/tokeninput_vgp', methods=['GET', 'POST'])
def tokeninput_vgp():

    list_json = []

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        #tokeninputs = request.args.get("q").replace(u'　', u' ').lower().split()
        input_text = request.args.get("q").replace(u'　', u' ').lower()
        japanese_pattern = re.compile(r'[\u3040-\u30FF\u4E00-\u9FFF]')
        isJA = bool(japanese_pattern.search(input_text))
        tokeninputs = input_text.split()
        sql_params = []
        in_tokeninputs = []
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
            in_tokeninputs.append(mojimoji.zen_to_han(v, kana=False).lower())
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
        # add for NANDO
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
        # add for PA
        for v in tokeninputs:
            sql_params.append("%"+v+"%")
        # add for PAA
        for v in tokeninputs:
            sql_params.append("%"+v+"%")

        # DiseaseGeneテーブルからSymbol及びSynonymを検索
        ## SQLのLIKEを使うときのTips
        ### http://d.hatena.ne.jp/heavenshell/20111027/1319712031
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")
        # IndexFormSearchOrphanetOMIMテーブルからクエリにマッチするレコードを取得
        sql_IndexFormSearch = \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  OntoTermMONDOInformation.OntoID AS uid " \
                              u" ,OntoName AS Symbol " \
                              u" ,OntoSynonym AS Synonyms " \
                              u" ,OntoNameJa AS name_ja " \
                              u" ,OntoDbxrefName AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(OntoTermMONDOInformation.OntoID,' | ',OntoName,' | ',IFNULL(OntoNameJa,''),' | ',IFNULL(OntoSynonym,''),' | ',IFNULL(OntoDbxrefName,'')))) AS uid_value " \
                              u" ,'MONDO' AS source " \
                              u"FROM " \
                              u"  OntoTermMONDOInformation " \
                              u"LEFT JOIN ( " \
                              u"  SELECT " \
                              u"    OntoVersion " \
                              u"   ,OntoID " \
                              u"   ,GROUP_CONCAT(DISTINCT OntoDbxrefName SEPARATOR ' | ') AS OntoDbxrefName " \
                              u"  FROM " \
                              u"    OntoTermMONDODbxref " \
                              u"  WHERE " \
                              u"    OntoDbxrefDb='ENT' " \
                              u"  GROUP BY " \
                              u"    OntoID " \
                              u") AS OntoTermMONDODbxref ON OntoTermMONDODbxref.OntoVersion=OntoTermMONDOInformation.OntoVersion AND OntoTermMONDODbxref.OntoID=OntoTermMONDOInformation.OntoID " \
                              u") AS A WHERE " \
                              u"{0}" \
                              u" UNION " \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  OntoID AS uid " \
                              u" ,OntoName AS Symbol " \
                              u" ,OntoSynonymJa AS Synonyms " \
                              u" ,OntoNameJa AS name_ja " \
                              u" ,null AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(OntoID,' | ',OntoName,' | ',IFNULL(OntoNameJa,''),' | ',IFNULL(OntoSynonym,''),' | ',IFNULL(OntoSynonymJa,'')))) AS uid_value " \
                              u" ,'NANDO' AS source " \
                              u"FROM " \
                              u"  OntoTermNANDOInformation " \
                              u") as A WHERE " \
                              u"{0}" \
                              u" UNION " \
                              u"select distinct uid, " \
                              u" COALESCE(DiseaseGeneOMIM.Symbol,DiseaseGene.Symbol) AS Symbol" \
                              u",COALESCE(DiseaseGeneOMIM.Synonym,DiseaseGene.Synonym) AS Synonyms " \
                              u",null AS name_ja " \
                              u",null AS EntrezID " \
                              u"from IndexFormSearchOrphanetOMIM " \
                              u"LEFT JOIN (SELECT distinct SymbolSynonym,Symbol,Synonym,Source,EntrezID FROM DiseaseGene) AS DiseaseGene ON DiseaseGene.EntrezID=IndexFormSearchOrphanetOMIM.uid AND LEFT(DiseaseGene.SymbolSynonym,300)=IndexFormSearchOrphanetOMIM.value " \
                              u"LEFT JOIN (SELECT distinct SymbolSynonym,Symbol,Synonym,Source,EntrezID FROM DiseaseGeneOMIM) AS DiseaseGeneOMIM ON DiseaseGeneOMIM.EntrezID=IndexFormSearchOrphanetOMIM.uid AND LEFT(DiseaseGeneOMIM.SymbolSynonym,300)=IndexFormSearchOrphanetOMIM.value " \
                              u" WHERE {0}" \
                              u" UNION " \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  panel_id AS uid " \
                              u" ,panel_name AS Symbol " \
                              u" ,NULL AS Synonyms " \
                              u" ,NULL AS name_ja " \
                              u" ,NULL AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(panel_id,' | ',panel_name))) AS uid_value " \
                              u" ,'PA' AS source " \
                              u"FROM " \
                              u"  vgp " \
                              u") AS A WHERE " \
                              u"{0}" \
                              u" UNION " \
                              u"SELECT uid,Symbol,Synonyms,name_ja,EntrezID FROM (SELECT " \
                              u"  panel_id AS uid " \
                              u" ,panel_name AS Symbol " \
                              u" ,NULL AS Synonyms " \
                              u" ,NULL AS name_ja " \
                              u" ,NULL AS EntrezID " \
                              u" ,LOWER(TRIM(CONCAT(panel_id,' | ',panel_name))) AS uid_value " \
                              u" ,'PAA' AS source " \
                              u"FROM " \
                              u"  vgpau " \
                              u") AS A WHERE " \
                              u"{0}" 
        #sql_IndexFormSearch = sql_IndexFormSearch.format(' AND '.join(map(lambda x: "uid_value collate utf8_str_ci like %s", tokeninputs)))
        sql_IndexFormSearch = sql_IndexFormSearch.format(' AND '.join(map(lambda x: "uid_value like %s", tokeninputs)))
        #app.logger.info(sql_IndexFormSearch)
        #app.logger.info(tuple(sql_params))

        cursor_IndexFormSearch = OBJ_MYSQL.cursor()
        #cursor_IndexFormSearch.execute(sql_IndexFormSearch, ("%" + tokeninput.lower() +"%","%" + tokeninput.lower() +"%","%" + tokeninput.lower() +"%"))
        cursor_IndexFormSearch.execute(sql_IndexFormSearch, tuple(sql_params))
        values = cursor_IndexFormSearch.fetchall()
        cursor_IndexFormSearch.close()

        #in_tokeninput = mojimoji.zen_to_han(tokeninput, kana=False).lower()

        #app.logger.info(in_tokeninputs)

        for value in values:
            #app.logger.info(value)
            #app.logger.info(type(value[3]))
            dict_json = {}
            uid         = mojimoji.zen_to_han(value[0], kana=False).lower()
            uid_value   = mojimoji.zen_to_han(value[1], kana=False).lower()
            synonym_arr = []
            source_arr = []

            name_ja = None
            if isinstance(value[3],str) and len(value[3]):
                name_ja = mojimoji.zen_to_han(value[3], kana=False).lower()

            #app.logger.info(uid)
            #app.logger.info(uid_value)
            #app.logger.info(name_ja)

            uid_flag = True
            uid_value_flag = True
            for in_tokeninput in in_tokeninputs:
                if not isinstance(uid,str) or not len(uid) or not in_tokeninput in uid:
                    uid_flag = False
                if not isinstance(uid_value,str) or not len(uid_value) or not in_tokeninput in uid_value:
                    #app.logger.info(type(uid_value))
                    #app.logger.info(len(uid_value))
                    #app.logger.info(in_tokeninput in uid_value)
                    uid_value_flag = False
                if not uid_flag and not uid_value_flag:
                    #app.logger.info(in_tokeninput)
                    break

            if not uid_flag:
                uid = None

            if not uid_value_flag:
                uid_value = None

            #app.logger.info(uid)
            #app.logger.info(uid_value)

            if uid is None and uid_value is None and isinstance(value[2],str) and len(value[2]):
                list_synonym = value[2].split(' | ')
                for synonym in list_synonym:
                    temp_synonym = mojimoji.zen_to_han(synonym, kana=False).lower()
                    temp_synonym_flag = True
                    for in_tokeninput in in_tokeninputs:
                        if not isinstance(temp_synonym,str) or not len(temp_synonym) or not in_tokeninput in temp_synonym:
                            temp_synonym_flag = False
                            break
                    if temp_synonym_flag:
                        synonym_arr.append(synonym)

            #if not name_ja is None:
            #    app.logger.info(name_ja)
            #    app.logger.info(type(name_ja))
            #    app.logger.info(len(name_ja))

            if isinstance(name_ja,str) and len(name_ja):
                name_ja_flag = True
                for in_tokeninput in in_tokeninputs:
                    if not in_tokeninput in name_ja:
                        #app.logger.info(in_tokeninput)
                        #app.logger.info(isinstance(in_tokeninput,str))
                        name_ja_flag = False
                        break
                if not name_ja_flag:
                    name_ja = None
            #app.logger.info(name_ja)

            #app.logger.info(uid)
            #app.logger.info(uid_value)
            #app.logger.info(synonym_arr)
            #app.logger.info(name_ja)

            if uid is None and uid_value is None and not len(synonym_arr) and name_ja is None:
                continue


            #if type(value[3]) is str and len(value[3]):
            #    list_source = value[3].split(';')
            #    for source in list_source:
            #        source = source.strip()
            #        if type(source) is str and len(source):
            #            source_arr.append(source)

            if isinstance(name_ja,str) and len(name_ja):
                dict_json['id']   = value[0].replace('ENT:','GENEID:') + "_ja"
                dict_json['name'] = value[3]
            else:
                dict_json['id']   = value[0].replace('ENT:','GENEID:')
                dict_json['name'] = value[1]

            if isJA and len(value[3])>0:
                dict_json['id']   = value[0].replace('ENT:','GENEID:') + "_ja"
                dict_json['name'] = value[3]

            if len(synonym_arr)>0:
                dict_json['synonym'] = synonym_arr
            else:
                dict_json['synonym'] = None

            if len(source_arr)>0:
                dict_json['source'] = source_arr
            else:
                dict_json['source'] = None

            if isinstance(value[4],str) and len(value[4]):
                dict_json['EntrezID'] = value[4]
            else:
                dict_json['EntrezID'] = None

            list_json.append(dict_json)
            #app.logger.info(dict_json)
            #app.logger.info('')

        OBJ_MYSQL.close()

    return jsonify(list_json)

#####
# popup_hierarchy_mondo()
# オントロジーのバージョンをSQL内で"20200405"に固定しているので、要修正
#####
@app.route('/popup_hierarchy_genes', methods=['GET', 'POST'])
def popup_hierarchy_genes():

    list_json = []

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        #onto_id = request.args.get("q")
        onto_id_pre = request.args.get("q")
        onto_id = onto_id_pre.replace('_ja', '')
        onto_id_prefix = re.search(r'^(HP|MONDO|NANDO)', onto_id)
        onto_name = "MONDO"
        if onto_id_prefix and onto_id_prefix.group() == "HP":
            onto_name = "HP"
        elif onto_id_prefix and onto_id_prefix.group() == "NANDO":
            onto_name = "NANDO"

        # MySQLへ接続
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")

        # JSONデータ
        dict_json = {}
        dict_json['selfclass']  = []
        dict_json['superclass'] = []
        dict_json['subclass']   = []

        # OntoTermMONDOInformationテーブルから情報取得
        sql_information = u"select OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoParentNum, OntoChildNum, OntoNameJa from OntoTerm{0}Information where OntoID=%s".format(onto_name)
        if onto_id_prefix and onto_id_prefix.group() == "NANDO":
            sql_information = u"select OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoParentNum, OntoChildNum, OntoNameJa, OntoSynonymJa, OntoDefinitionJa, OntoCommentJa from OntoTerm{0}Information where OntoID=%s".format(onto_name)

        sql_informations_fmt = u"select OntoID, OntoName, OntoChildNum, OntoNameJa from OntoTerm{0}Information where OntoID in (%s)".format(onto_name)

        sql_hierarchy_parent = u"select OntoParentID from OntoTerm{0}Hierarchy where OntoID=%s".format(onto_name)
        sql_hierarchy_child  = u"select OntoID from OntoTerm{0}Hierarchy where OntoParentID=%s".format(onto_name)

        # OntoTermMONDOInformationテーブルからクエリにマッチするレコードを取得
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
            dict_self_class['synonym_ja']    = ""
            dict_self_class['definition_ja'] = ""
            dict_self_class['comment_ja']    = ""
            if onto_id_prefix and onto_id_prefix.group() == "NANDO":
                dict_self_class['synonym_ja']    = value_information[7]
                dict_self_class['definition_ja'] = value_information[8]
                dict_self_class['comment_ja']    = value_information[9]



            list_parent_child_onto_id = []
            # OntoTermMONDOHierarchyから親クラスの情報取得
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

            # OntoTermMONDOHierarchyから子クラスの情報取得
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

            # OntoTermMONDOInformations_fmtテーブルからクエリにマッチするレコードを取得
            dict_all_class = {}

            if list_parent_child_onto_id:
                in_onto_id=', '.join(map(lambda x: '%s', list_parent_child_onto_id))
                sql_informations_fmt = sql_informations_fmt % in_onto_id

                cursor_informations_fmt = OBJ_MYSQL.cursor()
                cursor_informations_fmt.execute(sql_informations_fmt, list_parent_child_onto_id)
                values_informations_fmt = cursor_informations_fmt.fetchall()
                cursor_informations_fmt.close()

                for value_informations_fmt in values_informations_fmt:
                    onto_id         = value_informations_fmt[0]
                    onto_name       = value_informations_fmt[1]
                    onto_child_num  = value_informations_fmt[2]
                    onto_name_ja    = value_informations_fmt[3]
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
                    if parent_onto_id in dict_all_class.keys():
                        list_super_class.append(dict_all_class[parent_onto_id])

            ## child class リスト
            list_sub_class = []
            if len(list_child_onto_id) > 0:
                for child_onto_id in list_child_onto_id:
                    if child_onto_id in dict_all_class.keys():
                        list_sub_class.append(dict_all_class[child_onto_id])
            
            ## dict_json に収納
            dict_json['selfclass']  = list_self_class
            dict_json['superclass'] = list_super_class
            dict_json['subclass']   = list_sub_class

        OBJ_MYSQL.close()

    return jsonify(dict_json)


#####
# casemini_tokeninput_hpo()
# complement input for phenotypes
#####
@app.route('/casemini_tokeninput_hpo', methods=['GET'])
def api_casemini_tokeninput_hpo():
    list_json = []
    query_text = request.args.get("q")
    lang = request.args.get("lang")
    list_json = casemini_tokeninput_hpo(query_text,lang)
    return jsonify(list_json)


#####
# casemini_popup_hierarchy_hpo()
#####
@app.route('/casemini_popup_hierarchy_hpo', methods=['GET'])
def api_casemini_popup_hierarchy_hpo():
    dict_json = {}
    onto_id_pre = request.args.get("q")
    onto_id = onto_id_pre.replace('_ja', '')
    dict_json = casemini_popup_hierarchy_hpo(onto_id)
    return jsonify(dict_json)


#####
# tokeninput_icd_10()
# complement input for disease(icd_10)
#####
@app.route('/casemini_tokeninput_icd_10', methods=['GET'])
def api_casemini_tokeninput_icd_10():
    list_json = []
    query_text = request.args.get("q")
    list_json = casemini_tokeninput_icd_10(query_text)
    return jsonify(list_json)


#####
# casemini tokeninput_omim_orpha()
# complement input for disease(omim_orpha)
#####
@app.route('/casemini_tokeninput_omim_orpha', methods=['GET'])
def api_casemini_tokeninput_omim_orpha():
    list_json = []
    query_text = request.args.get("q")
    list_json = casemini_tokeninput_omim_orpha(query_text)
    return jsonify(list_json)


###### casemini tokeninput_nando()
# complement input for disease(nando)
#####
@app.route('/casemini_tokeninput_nando', methods=['GET'])
def api_casemini_tokeninput_nando():
    list_json = []
    query_text = request.args.get("q")
    list_json = casemini_tokeninput_nando(query_text)
    return jsonify(list_json)


###### API: provide candidate HPOs using text as query
# GET method
# /casemini_get_similar_hpo_by_text?text=[TEXT]
@app.route('/casemini_get_similar_hpo_by_text', methods=['GET'])
def casemini_get_similar_hpo_by_text():
    r_text = ""
    if request.args.get('text') is not None:
        r_text = request.args.get('text')
        if r_text == "":
            return "none"
    else:
        return "none"

    dict_result = casemini_search_similar_by_text_with_dict(r_text, 'hpo')

    return jsonify(dict_result)


###### API: provide candidate ICD_10s using text as query
# GET method
# /casemini_get_similar_icd_10_by_text?text=[TEXT]
@app.route('/casemini_get_similar_icd_10_by_text', methods=['GET'])
def casemini_get_similar_icd_10_by_text():
    r_text = ""
    if request.args.get('text') is not None:
        r_text = request.args.get('text')
        if r_text == "":
            return "none"
    else:
        return "none"

    dict_result = casemini_search_similar_by_text_with_dict(r_text, 'icd-10')

    return jsonify(dict_result)


###### API: provide candidate omim_orphas using text as query
# GET method
# /casemini_get_similar_omim_orpha_by_text?text=[TEXT]
@app.route('/casemini_get_similar_omim_orpha_by_text', methods=['GET'])
def casemini_get_similar_omim_orpha_by_text():
    r_text = ""
    if request.args.get('text') is not None:
        r_text = request.args.get('text')
        if r_text == "":
            return "none"
    else:
        return "none"
    dict_result = casemini_search_similar_by_text_with_dict(r_text, 'omim_orpha')
    return jsonify(dict_result)


###### API: provide candidate nando using text as query
# GET method
# /casemini_get_similar_nando_by_text?text=[TEXT]
@app.route('/casemini_get_similar_nando_by_text', methods=['GET'])
def casemini_get_similar_nando_by_text():
    r_text = ""
    if request.args.get('text') is not None:
        r_text = request.args.get('text')
        if r_text == "":
            return "none"
    else:
        return "none"
    dict_result = casemini_search_similar_by_text_with_dict(r_text, 'nando')

    return jsonify(dict_result)


@app.route('/get_hpo_data_by_hpo_id', methods=['GET', 'POST'])
def get_hpo_data_by_hpo_id():
    dic_json = {}

    # GETメソッドの値を取得
    if request.method == 'GET':

        # requestから値を取得
        onto_id_pre = request.args.get("hpo_id")
        onto_id = onto_id_pre.replace('_ja', '')
        list_onto_id = onto_id.split(',')

        # MySQLへ接続
        OBJ_MYSQL = MySQLdb.connect(host=db_host, port=db_port, db=db_name, user=db_user, passwd=db_pw, charset="utf8")

        sql_informations_fmt = u"select OntoID, OntoName, OntoNameJa from OntoTermHPInformation where OntoID NOT in (SELECT OntoDescendantID FROM OntoTermHPDescendant WHERE OntoID='HP:0000005') AND OntoID in (%s)"

        in_onto_id=', '.join(map(lambda x: '%s', list_onto_id))

        sql_informations_fmt = sql_informations_fmt % in_onto_id

        #app.logger.info(sql_informations_fmt)

        cursor_informations_fmt = OBJ_MYSQL.cursor()
        cursor_informations_fmt.execute(sql_informations_fmt, list_onto_id)
        values_informations_fmt = cursor_informations_fmt.fetchall()
        cursor_informations_fmt.close()

        for value_informations_fmt in values_informations_fmt:
            onto_id         = value_informations_fmt[0]
            onto_name       = value_informations_fmt[1]
            onto_name_ja    = value_informations_fmt[2]

            dic_json[onto_id] = {}
            dic_json[onto_id]['name_en'] = onto_name
            dic_json[onto_id]['name_ja'] = onto_name_ja if onto_name_ja != "" else onto_name

        OBJ_MYSQL.close()

    return jsonify(dic_json)



#####
# display PanelSearch page
# /panelsearch
@app.route('/panelsearch')
@app.route('/panellist')
def panelsearch_panel_list():

    r_lang = request.args.get('lang') if request.args.get('lang') else 'en'

    r_lang_data = 'ja' if r_lang == 'ja' else 'en'

    root_mondo_id = 'MONDO:0700096'
    root_mondo_name, root_disease_num, root_panel_num = api_panelsearch_mondo_get_disease_and_panel_num(root_mondo_id,r_lang_data)

    session['service'] = SERVICE_PANELSEARCH

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    return render_template(
        'panelsearch_panel_list.html',
        r_service=SERVICE_PANELSEARCH,
        r_mail=google_id,
        r_user_type_admin=r_user_type_admin,
        r_username=r_username,
        r_lang=r_lang,
        r_root_id=root_mondo_id,
        r_root_name=root_mondo_name,
        r_root_disease_num=root_disease_num,
        r_root_panel_num=root_panel_num
    )


@app.route('/panelsearch_panel_detail')
@app.route('/panel_detail')
def panelsearch_panel_detail():
    if request.args.get('panel_id') is None:
        return redirect(url_for('panelsearch_panel_list'))
    r_panel_id = request.args.get('panel_id')

    r_lang = request.args.get('lang') if request.args.get('lang') else 'en'

    session['service'] = SERVICE_PANELSEARCH
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    root_mondo_id = 'MONDO:0700096'
    root_mondo_name, root_disease_num, root_panel_num = api_panelsearch_mondo_get_disease_and_panel_num(root_mondo_id,r_lang)

    return render_template(
        'panelsearch_panel_detail.html',
        r_service=SERVICE_PANELSEARCH,
        r_mail=google_id,
        r_user_type_admin=r_user_type_admin,
        r_username=r_username,
        r_lang=r_lang,
        r_panel_id=r_panel_id,
        r_root_panel_num=root_panel_num
    )


@app.route('/panelsearch_common_panel')
@app.route('/common_panel')
def panelsearch_common_panel_detail():

    r_lang = request.args.get('lang') if request.args.get('lang') else 'en'

    r_panel_id_list_str = request.args.get('panel_id_list_str')
    if r_panel_id_list_str is None:
        return redirect(url_for('panelsearch_panel_list'))

    r_custom_panel_name=''
    if request.args.get('custom_panel_name') is not None:
        r_custom_panel_name = request.args.get('custom_panel_name')

    session['service'] = SERVICE_PANELSEARCH
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    root_mondo_id = 'MONDO:0700096'
    root_mondo_name, root_disease_num, root_panel_num = api_panelsearch_mondo_get_disease_and_panel_num(root_mondo_id,r_lang)

    return render_template(
        'panelsearch_custom_panel.html',
        r_service=SERVICE_PANELSEARCH,
        r_mail=google_id,
        r_user_type_admin=r_user_type_admin,
        r_username=r_username,
        r_lang=r_lang,
        r_panel_id_list_str=r_panel_id_list_str,
        r_custom_panel_name=r_custom_panel_name,
        r_root_panel_num=root_panel_num
    )


@app.route('/panelsearch_panel_gene_detail')
@app.route('/panel_gene_detail')
def panelsearch_panel_gene_detail():

    r_lang = request.args.get('lang') if request.args.get('lang') else 'en'

    required_params = ['panel_id', 'panel_title', 'gene_id', 'gene_title']
    if any(request.args.get(param) is None for param in required_params):
        return redirect(url_for('panelsearch_panel_list'))

    r_panel_gene_id    = request.args.get('gene_id')
    r_panel_gene_title = request.args.get('gene_title')
    r_panel_id         = request.args.get('panel_id')
    r_panel_title      = request.args.get('panel_title')

    session['service'] = SERVICE_PANELSEARCH
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH)
    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None

    root_mondo_id = 'MONDO:0700096'
    root_mondo_name, root_disease_num, root_panel_num = api_panelsearch_mondo_get_disease_and_panel_num(root_mondo_id,r_lang)

    return render_template(
        'panelsearch_panel_gene_detail.html',
        r_service=SERVICE_PANELSEARCH,
        r_mail=google_id,
        r_user_type_admin=r_user_type_admin,
        r_username=r_username,
        r_lang=r_lang,
        r_panel_gene_id=r_panel_gene_id,
        r_panel_gene_title=r_panel_gene_title,
        r_panel_id=r_panel_id,
        r_panel_title=r_panel_title,
        r_root_panel_num=root_panel_num
    )


#####
# Treeview
#
@app.route('/panelsearch_get_mondo_descendant', methods=['GET'])
def panelsearch_get_mondo_descendant():

    r_lang = request.args.get('lang')
    if r_lang != 'ja':
        r_lang = 'en'

    r_mondo_id = request.args.get('mondo_id')

    if not r_mondo_id:
        return json.dumps([], ensure_ascii=False)

    rows = api_panelsearch_mondo_get_descendant(r_mondo_id, r_lang)

    response_data = [
        {
            'mondo_id': row[0],
            'name': row[1],
            'num_child': row[2],
            'displayName': f'{row[1]} <font class="vgp-treeview-decendant-num">({row[2]})</font>' if row[2] > 0 else row[1],
            'isFirstTimeLoad': True,
            'lang': r_lang,
            'isParent': row[2] > 0
        }
        for row in rows
    ]

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_get_mondo_hierarchy', methods=['GET'])
def panelsearch_get_mondo_hierarchy():

    response_data = {}

    r_lang = request.args.get('lang')
    if r_lang != 'ja':
        r_lang = 'en'

    r_mondo_id = request.args.get('mondo_id')

    if r_mondo_id:
        response_data = api_panelsearch_mondo_get_hierarchy(r_mondo_id,r_lang)

    return response_data


@app.route('/panelsearch_get_all_mondo_panel', methods=['GET', 'POST'])
def panelsearch_get_all_mondo_panel():

    r_sort = "sortfield"
    if request.args.get('sort') is not None:
        if request.args.get('sort') == 'gene':
            r_sort = "GeneCount"

    r_dir = "asc"
    if request.args.get('dir') is not None:
        r_dir = request.args.get('dir')

    r_root_mondo_id = "MONDO:0700096"
    if request.args.get('root_mondo_id') is not None:
        r_root_mondo_id = request.args.get('root_mondo_id')

    response_data = {}
    results = api_panelsearch_mondo_get_all_panel(r_root_mondo_id,r_sort,r_dir)
    response_data['input:'] = [list[0] for list in results]

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_get_panel_mondo_id_by_name', methods=['GET'])
def panelsearch_get_panel_mondo_id_by_name():

    r_sort = "sortfield"
    if request.args.get('sort') is not None:
        if request.args.get('sort') == 'gene':
            r_sort = "GeneCount"

    r_dir = "asc"
    if request.args.get('dir') is not None:
        r_dir = request.args.get('dir')

    r_lang = "en"
    if request.args.get('lang') is not None:
        r_lang = request.args.get('lang')

    r_root_mondo_id = "MONDO:0700096"
    if request.args.get('root_mondo_id') is not None:
        r_root_mondo_id = request.args.get('root_mondo_id')

    input_text = request.args.get('input_text')

    response_data = {}
    results = api_panelsearch_mondo_get_panel_by_name(r_root_mondo_id,r_sort,r_dir,input_text, r_lang)
    response_data['input:'] = [list[0] for list in results]

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_get_panel_mondo_id_by_gene', methods=['GET'])
def panelsearch_get_panel_mondo_id_by_gene():

    r_sort = "sortfield"
    if request.args.get('sort') is not None:
        if request.args.get('sort') == 'gene':
            r_sort = "GeneCount"

    r_dir = "asc"
    if request.args.get('dir') is not None:
        r_dir = request.args.get('dir')

    r_root_mondo_id = "MONDO:0700096"
    if request.args.get('root_mondo_id') is not None:
        r_root_mondo_id = request.args.get('root_mondo_id')

    input_text = request.args.get('input_text')

    response_data = {}
    results = api_panelsearch_mondo_get_panel_by_gene(r_root_mondo_id,r_sort,r_dir,input_text)
    response_data['input:'] = [list[0] for list in results]

    return json.dumps(response_data, ensure_ascii=False)



@app.route('/pubcasefinder_tools/smart_box/<path:filename>')
def serve_submodule_file(filename):
    submodule_dir = 'pubcasefinder_tools/smart_box'
    return send_from_directory(submodule_dir, filename)


@app.route('/moshikashite_test_api')
def moshikashite_test_api():
    text = request.args.get('text')
    mock_data = [
        {
            'ID': 'D1',
            'label_en': 'Disease A',
            'synonym_en': 'Alternative name for Disease A',
            'label_ja': '病気A',
            'synonym_ja': '病気Aの別名',
        },
        {
            'ID': 'D2',
            'label_en': 'Disease B',
            'synonym_en': 'Alternative name for Disease B',
            'label_ja': '病気B',
            'synonym_ja': '病気Bの別名',
        },
        {
            'ID': 'D3',
            'label_en': 'Disease C',
            'synonym_en': 'Alternative name for Disease C',
            'label_ja': '病気C',
            'synonym_ja': '病気Cの別名',
        },
    ]
    return jsonify(mock_data)


app.register_blueprint(new_bp)
app.register_blueprint(auth_bp)
@app.route('/get_handsontable_key', methods=['GET'])
def get_handsontable_key():
    handsontable_license_key = app.config['HANDSONTABLE_LICENSE_KEY']
    json_data = jsonify(handsontable_license_key).data
    encoded_data = base64.b64encode(json_data).decode('utf-8')
    return encoded_data


###                        ### 
###   PanelSearch(NANDO)   ###
###                        ###

def get_username_from_session(user_info):
    if not user_info:
        return ''

    name_nl = f"{user_info.get('last_name_nl', '')} {user_info.get('first_name_nl', '')}".strip()
    if name_nl:
        return name_nl

    name_en = f"{user_info.get('last_name_en', '')} {user_info.get('first_name_en', '')}".strip()
    if name_en:
        return name_en

    return user_info.get('google_id', '')


def check_user_curator_or_not(user_info, is_user_type_admin):
    is_user_type_curator = False
    if user_info and not is_user_type_admin:
        is_user_type_curator = api_psn_group_is_user_curator_of_some_group(user_info["id"])
    return is_user_type_curator


def check_user_panel_role(user_id, panel_id, is_user_type_admin):
    is_user_panel_role_curator = False

    #modified start 2026/09/01
    #ユーザー登録後、Adminから最終承認を受けると、デフォルトでReviewerとなる。 
    #Reviewerは担当グループや担当疾患に関係なく、すべての疾患に対してReviewを作成できる。 
    #is_user_panel_role_reviewer = False
    is_user_panel_role_reviewer = True if user_id else False
    #modified end 2026/09/01

    if user_id and panel_id and not is_user_type_admin:
        response = api_psn_group_get_user_role_of_panel(user_id, panel_id)
        check_api_response_error(response, 'api_psn_group_get_user_role_of_panel')
        if isinstance(response, dict) and 'user_role' in response:
            is_user_panel_role_curator = api_psn_group_is_user_role_curator(response['user_role'])
            #modified start 2026/09/01
            #ユーザー登録後、Adminから最終承認を受けると、デフォルトでReviewerとなる。
            #Reviewerは担当グループや担当疾患に関係なく、すべての疾患に対してReviewを作成できる。
            #is_user_panel_role_reviewer = api_psn_group_is_user_role_reviewer(response['user_role'])
            #modified end 2026/09/01

    return is_user_panel_role_curator, is_user_panel_role_reviewer


def check_api_response_error(response, api_name):
    if isinstance(response, dict) and 'error' in response:
        app.logger.error(f'error on {api_name}({response["error"]})')
        return response
    return None



###### display PanelSearch(NANDO) page
# /panelsearch_nanbyo
@app.route('/panelsearch_nanbyo')
@app.route('/panellist_nanbyo')
def panelsearch_nanbyo_panel_list():

    r_lang = request.args.get('lang', "ja")
    r_lang = r_lang if r_lang in {'ja', 'en'} else 'ja'

    session['service'] = SERVICE_PANELSEARCH_NANBYO
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    r_username = get_username_from_session(user_info) 
    is_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    last_ontology = api_psn_ontology_get_last_update_ontology()

    return render_template(
        'panelsearch_nanbyo_panel_list.html',
        r_service=SERVICE_PANELSEARCH_NANBYO,
        r_mail=google_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_lang=r_lang,
        r_username=r_username,
        last_ontology=last_ontology
    )


@app.route('/panelsearch_nanbyo_get_treeview', methods=['GET'])
def panelsearch_nanbyo_get_treeview():
    response_data = api_psn_get_panel_ontology()
    check_api_response_error(response_data, 'api_psn_get_ontology')
    return response_data


@app.route('/panelsearch_nanbyo_get_treeview_descendant', methods=['GET'])
def panelsearch_nanbyo_get_treeview_descendant():

    r_lang = request.args.get('lang', "ja")
    r_lang = r_lang if r_lang in {'ja', 'en'} else 'ja'

    r_panel_id = request.args.get('panel_id')
    if not r_panel_id:
        return jsonify({})
    
    response_data = api_psn_get_treeview_descendant(r_panel_id, r_lang)
    check_api_response_error(response_data, 'api_psn_get_treeview_descendant')

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_get_panel_upstream_trace', methods=['GET'])
def panelsearch_nanbyo_get_panel_upstream_trace():

    r_panel_id = request.args.get('panel_id')
    if not r_panel_id:
        return jsonify({})

    response_data = api_psn_get_panel_upstream_trace(r_panel_id)
    check_api_response_error(response_data, 'api_psn_get_panel_upstream_trace')
    if not response_data:
        return jsonify({})

    return response_data


@app.route('/panelsearch_nanbyo_get_all_panel', methods=['GET'])
def panelsearch_nanbyo_get_all_panel():

    lang = request.args.get('lang')
    lang = lang if lang in ('en', 'ja') else 'ja'

    sort = request.args.get('sort')
    sort = sort if sort in {'panel', 'gene'} else 'gene'

    dir_ = request.args.get('dir')
    dir_ = dir_ if dir_ in {'asc', 'desc'} else 'asc'

    root_panel_id = request.args.get('root_panel_id')

    response_data = api_psn_get_all_panel(lang,sort,dir_,root_panel_id)
    check_api_response_error(response_data, 'api_psn_get_all_panel')

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_get_panel_id_match_panel_name_synonym', methods=['GET'])
def panelsearch_nanbyo_get_panel_id_match_panel_name_synonym():

    r_sort = request.args.get('sort')
    r_sort = r_sort if r_sort in {'panel', 'gene'} else 'gene'

    dir = request.args.get('dir')
    r_dir = dir if dir in {'asc','desc'} else 'asc'

    lang = request.args.get('lang')
    r_lang = lang if lang in {'en', 'ja'} else 'ja'

    r_root_panel_id = request.args.get('root_panel_id')

    input_text = request.args.get('input_text', '').strip()

    if not input_text:
        return json.dumps({}, ensure_ascii=False)

    response_data = api_psn_get_panel_id_match_panel_name_synonym(
        r_sort, r_dir, r_lang, r_root_panel_id, input_text
    )
    check_api_response_error(response_data, 'api_psn_get_panel_id_match_panel_name_synonym')

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_get_panel_id_match_gene_symbol_ncbiid', methods=['GET'])
def panelsearch_nanbyo_get_panel_id_match_gene_symbol_ncbiid():

    r_lang = request.args.get('lang')
    r_lang = r_lang if r_lang in {'en', 'ja'} else 'ja'

    r_sort = request.args.get('sort')
    r_sort = r_sort if r_sort in {'panel', 'gene'} else 'gene'

    r_dir = request.args.get('dir')
    r_dir = r_dir if r_dir in {'asc','desc'} else 'asc'

    r_root_panel_id = request.args.get('root_panel_id') 

    input_text = request.args.get('input_text', '').strip()
    if not input_text:
        return json.dumps({}, ensure_ascii=False)

    response_data = api_psn_get_panel_id_match_gene_symbol_ncbiid(
       r_lang, r_sort,r_dir,r_root_panel_id,input_text
    )
    check_api_response_error(response_data, 'api_psn_get_panel_id_match_gene_symbol_ncbiid')

    return json.dumps(response_data, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_load_multi_class', methods=['GET'])
def panelsearch_nanbyo_load_multi_class():

    r_lang = request.args.get('lang')
    r_lang = r_lang if r_lang in {'en', 'ja'} else 'ja'

    mult_class = api_psn_get_multi_class(r_lang)
    if check_api_response_error(mult_class, 'api_psn_get_multi_class'):
        return jsonify({
            'mode_of_inheritance_arr': [],
            'mode_of_inheritance_hash': {},
            'entity_type_arr': [],
            'rating_type_arr': []
        })

    response = {
        'mode_of_inheritance_hash': mult_class["mode_of_inheritance_hash"],
        'mode_of_inheritance_arr': mult_class["mode_of_inheritance"],
        'entity_type_arr': mult_class["entity_type"],
        'rating_type_arr': mult_class["rating_type"]
    }

    return jsonify(response)


@app.route('/panelsearch_nanbyo_panel_detail')
def panelsearch_nanbyo_panel_detail():

    r_lang = request.args.get('lang')
    r_lang = r_lang if r_lang in {'en', 'ja'} else 'ja'

    r_panel_id = request.args.get('panel_id')
    if not r_panel_id:
        return redirect(url_for('panelsearch_nanbyo_panel_list'))

    r_panel_name = request.args.get('panel_name')
    if not r_panel_name:
        r_panel_name = api_psn_get_panel_name(r_panel_id, r_lang)
        if not r_panel_name:
            return f"cannot find indicated panel({r_panel_id})"

    # the newest 
    r_panel_version_info = api_psn_get_panel_version_info(r_panel_id,r_lang)
    if check_api_response_error(r_panel_version_info, 'api_psn_get_panel_version_info'):
        return f"can not find version information for this panel({r_panel_id})"

    r_nando_id = request.args.get('nando_id')
    if not r_nando_id:
        r_nando_id = api_psn_get_nando_id(r_panel_id) 
        if not r_nando_id:
            return f"cannot find indicated panel({r_panel_id})"
   
    all_panel_list_hash = api_psn_get_all_panel(r_lang, 'panel', "asc", r_panel_id)
    if check_api_response_error(all_panel_list_hash, 'api_psn_get_all_panel'):
        return f"can not all sub panel information for this panel({r_panel_id})"

    all_panel_list = all_panel_list_hash.get('input:', [])

    session['service'] = SERVICE_PANELSEARCH_NANBYO
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    user_id = None if user_info is None else user_info["id"]

    r_username = get_username_from_session(user_info)
 
    is_user_type_admin = None if user_info is None else api_is_user_admin(user_info["user_type"])
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)
    is_user_panel_role_curator, is_user_panel_role_reviewer = check_user_panel_role(user_id,r_panel_id,is_user_type_admin)

    return render_template(
        'panelsearch_nanbyo_panel_detail.html',
        r_service=SERVICE_PANELSEARCH_NANBYO,
        r_lang=r_lang,
        r_mail=google_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_user_panel_role_curator=is_user_panel_role_curator,
        r_user_panel_role_reviewer=is_user_panel_role_reviewer,
        r_user_id=user_id,
        r_panel_id=r_panel_id,
        r_panel_name=r_panel_name,
        r_panel_version_info=r_panel_version_info,
        r_nando_id=r_nando_id,
        r_all_panel_list=all_panel_list,
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_panel_entity_detail')
def panelsearch_nanbyo_panel_entity_detail():

    for item in ['panel_id', 'entity_type_id', 'entity_name']:
        if request.args.get(item) is None:
            app.logger.info(f"no {item} found when loading panelsearch_nanbyo_panel_entity_detail!")
            return redirect(url_for('panelsearch_nanbyo_panel_list'))

    r_lang = request.args.get('lang')
    r_lang = r_lang if r_lang in {'en', 'ja'} else 'ja'

    r_panel_entity_review_id = request.args.get('review_id', '')
    r_is_edit_definition     = request.args.get('is_edit_definition', '')
    r_panel_entity_name      = request.args.get('entity_name')
    r_panel_entity_type_id   = request.args.get('entity_type_id')
    r_panel_entity_rating    = request.args.get('rating')
    r_panel_id               = request.args.get('panel_id')
    r_panel_name             = request.args.get('panel_name')
    r_nando_id               = request.args.get('nando_id')
    r_panel_gene_id          = request.args.get('gene_id')
    r_panel_gene_symbol      = request.args.get('gene_symbol')
    r_selected_user_id       = request.args.get('user_id', '')
    r_selected_review_id     = request.args.get('review_id', '')
    r_selected_original_review_id = request.args.get('original_review_id', '')

    if not r_nando_id:
        r_nando_id = api_psn_get_nando_id(r_panel_id)
        if not r_nando_id:
            return f"cannot find indicated panel({r_panel_id})"

    if not r_panel_name:
        r_panel_name = api_psn_get_panel_name(r_panel_id, r_lang)
        if not r_panel_name:
            return f"cannot find indicated panel({r_panel_id})"

    session['service'] = SERVICE_PANELSEARCH_NANBYO

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)

    user_id = '' if user_info is None else user_info["id"]

    user_type = USER_TYPE_DEFAULT if user_info is None else user_info["user_type"]
    r_username = get_username_from_session(user_info)

    is_user_type_admin = api_is_user_admin(user_type)
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)
    is_curator, is_reviewer = check_user_panel_role(user_id,r_panel_id,is_user_type_admin)

    return render_template(
        'panelsearch_nanbyo_panel_entity_detail.html',
        r_service=SERVICE_PANELSEARCH_NANBYO,r_lang=r_lang,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_user_panel_role_curator=is_curator,
        r_user_panel_role_reviewer=is_reviewer,
        r_panel_gene_id=r_panel_gene_id,
        r_panel_gene_symbol=r_panel_gene_symbol,
        r_panel_entity_type_id=r_panel_entity_type_id,
        r_panel_entity_name=r_panel_entity_name,
        r_panel_entity_rating=r_panel_entity_rating,
        r_panel_id=r_panel_id,
        r_panel_name=r_panel_name,
        r_nando_id=r_nando_id,
        r_panel_entity_review_id=r_panel_entity_review_id,
        r_is_edit_definition=r_is_edit_definition,
        r_username=r_username,
        r_selected_user_id=r_selected_user_id,
        r_selected_review_id=r_selected_review_id,
        r_selected_original_review_id=r_selected_original_review_id
    )


@app.route('/panelsearch_nanbyo_regist_review', methods=['POST'])
def panelsearch_nanbyo_RegistReview():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if not uid:
        return jsonify({'error': "Error: not logged in yet."})

    user_id = user_info["id"]
    user_type = USER_TYPE_DEFAULT if user_info is None else user_info["user_type"]

    data = request.get_json()
    r_panel_id = data.get("input_review_panel_id")

    is_user_type_admin = api_is_user_admin(user_type)
    is_user_panel_role_curator, is_user_panel_role_reviewer = check_user_panel_role(
        user_id, r_panel_id, is_user_type_admin
    )

    if not any([
        is_user_type_admin,
        is_user_panel_role_curator,
        is_user_panel_role_reviewer
    ]):
        return jsonify({
            'error': f"insufficient privilege of user({user_id}) for this panel({r_panel_id})"
        })

    #app.logger.warning(data)
    response = api_psn_regist_review(user_id, data)
    check_api_response_error(response, 'api_psn_regist_review')

    return jsonify(response) 


@app.route('/panelsearch_nanbyo_regist_entity_definition', methods=['POST'])
def panelsearch_nanbyo_regist_entity_definition():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': "Error: not logged in."})

    user_id = user_info["id"]

    data = request.get_json()
    panel_id = data.get('input_definition_panel_id')
    if not panel_id:
        return jsonify({'error': "Error: no panel id found."})

    if not api_is_user_admin(user_info["user_type"]):
        response_role = api_psn_group_get_user_role_of_panel(user_id, panel_id)
        if not response_role or not api_psn_group_is_user_role_curator(response_role['user_role']):
            return jsonify({"error": f"insufficient privilege!"})
 
    response = api_psn_regist_panel_entity_definition(user_id, data)
    check_api_response_error(response, 'api_psn_regist_panel_entity_definition')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_get_all_panel_version')
def panelsearch_nanbyo_get_all_panel_version():

    response = api_psn_get_all_panel_version()
    check_api_response_error(response, 'api_psn_get_all_panel_version')
    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_get_panel_all_change_history')
def panelsearch_nanbyo_get_panel_all_change_history():
    panel_id = request.args.get('panel_id')
    if not panel_id:
        return{'error': 'parameter panel_id not found'}
    response = api_psn_get_panel_all_change_history(panel_id)
    check_api_response_error(response, 'api_psn_get_panel_all_change_history')
    return jsonify(response)


@app.route('/panelsearch_nanbyo_get_panel_review')
def panelsearch_nanbyo_get_panel_review():

    panel_id = request.args.get('panel_id')
    if not panel_id:
        return jsonify([])

    response = api_psn_get_panel_review(panel_id)
    if check_api_response_error(response, 'api_psn_get_panel_review'):
        return jsonify([])

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_get_user_review_and_comment')
def panelsearch_nanbyo_get_user_review_and_comment():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': 'cannot find user_id in session.please login first'})

    user_id = user_info["id"]
  
    review = api_psn_get_user_review(user_id)
    if check_api_response_error(review, 'api_psn_get_user_review'):
        return jsonify(review)

    comment = api_psn_get_user_review_comment(user_id)
    if check_api_response_error(comment, 'api_psn_get_user_review_comment'):
        return jsonify(comment)

    response = {'review': review, 'comment': comment}
    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_get_panel_entity_review')
def panelsearch_nanbyo_get_panel_entity_review():

    required_params = ['panel_id','entity_type_id','entity_name']
    for param in required_params:
        if not request.args.get(param):
            return jsonify([])
        
    response = api_psn_get_panel_entity_review(
        request.args.get('panel_id'),
        request.args.get('entity_type_id'),
        request.args.get('entity_name')
    )
    check_api_response_error(response, 'api_psn_get_panel_entity_review')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_get_panel_entity_definition')
def panelsearch_nanbyo_get_panel_entity_definition():

    entity_type_id = request.args.get('entity_type_id', type=int)
    entity_name = request.args.get('entity_name')

    nando_id_list = request.args.get('nando_id_list')
    if nando_id_list:
        if not entity_type_id or not entity_name:
            return {'error': 'insufferent parameters'}
        response = api_psn_get_multi_panel_entity_definition(nando_id_list,entity_type_id,entity_name)
        check_api_response_error(response, 'api_psn_get_multi_panel_entity_definition')
        return json.dumps(response, ensure_ascii=False, default=str)

    # entity type id and entity name can be None due to called at different place.

    # panel_id must be not None
    panel_id = request.args.get('panel_id')
    if not panel_id:
        return jsonify([])

    response = api_psn_get_panel_entity_definition(panel_id,entity_type_id,entity_name)
    check_api_response_error(response, 'api_psn_get_panel_entity_definition')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_delete_panel_entity_review', methods=['POST'])
def panelsearch_nanbyo_delete_panel_entity_review():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': 'please login first'}), 401

    user_id = user_info["id"]

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data.get('review_id'):
        return jsonify({"error": "review_id is required"}), 400

    response = api_psn_delete_panel_entity_review(user_id, data)
    check_api_response_error(response, 'api_psn_delete_panel_entity_review')

    return jsonify(response), response.get('status_code', 200)


@app.route('/panelsearch_nanbyo_get_panel_entity_review_comment', methods=['GET'])
def panelsearch_nanbyo_get_panel_entity_review_comment():

    required_params = ['panel_id', 'entity_type_id', 'entity_name']
    missing_params = [param for param in required_params if param not in request.args or not request.args.get(param)]
    if missing_params: 
        return jsonify({"error": f"Missing required JSON parameters: {', '.join(missing_params)}"}), 400

    response = api_psn_get_panel_entity_review_comment(
        request.args.get('panel_id'),
        request.args.get('entity_type_id'),
        request.args.get('entity_name')
    )
    check_api_response_error(response, 'api_psn_get_panel_entity_review_comment')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_add_panel_entity_review_comment', methods=['POST'])
def panelsearch_nanbyo_add_panel_entity_review_comment():
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': 'cannot find user_id in session. please login first'})

    user_id = user_info["id"]

    data = request.get_json()

    required_params = ['review_id', 'original_review_id', 'comment']
    missing_params = [param for param in required_params if param not in data or not data.get(param)]
    if missing_params:
        return jsonify({"error": f"Missing required JSON parameters: {', '.join(missing_params)}"}), 400

    review_id = data.get('review_id')
    original_review_id = data.get('original_review_id')
    comment   = data.get('comment')

    response = api_psn_add_panel_entity_review_comment(user_id, review_id, original_review_id, comment)
    check_api_response_error(response, 'api_psn_add_panel_entity_review_comment')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_modify_panel_entity_review_comment', methods=['POST'])
def panelsearch_nanbyo_modify_panel_entity_review_comment():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': 'cannot find user_id in session. please login first'})

    user_id = user_info["id"]

    data = request.get_json()

    required_params = ['review_comment_id', 'comment', 'review_id', 'original_review_id']
    missing_params = [param for param in required_params if param not in data or not data.get(param)]
    if missing_params:
        return jsonify({"error": f"Missing required JSON parameters: {', '.join(missing_params)}"}), 400

    review_comment_id  = data.get('review_comment_id')
    comment            = data.get('comment')
    review_id          = data.get('review_id')
    original_review_id = data.get('original_review_id')

    response = api_psn_modify_panel_entity_review_comment(user_id, review_id, original_review_id, review_comment_id, comment)
    check_api_response_error(response, 'api_psn_modify_panel_entity_review_comment')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_delete_panel_entity_review_comment', methods=['POST'])
def panelsearch_nanbyo_delete_panel_entity_review_comment():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)
    if uid is None:
        return jsonify({'error': 'cannot find user_id in session. please login first'})

    user_id = user_info["id"]
 
    data = request.get_json()
    review_id          = data.get('review_id')
    original_review_id = data.get('original_review_id')
    review_comment_id  = data.get('review_comment_id')
    
    if user_id != data.get('user_id') and not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": f"you can't delete other people's review comment"}), 400
 
    response = api_psn_delete_panel_entity_review_comment(user_id, review_id, original_review_id, review_comment_id)
    check_api_response_error(response, 'api_psn_delete_panel_entity_review_comment')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_ontology', methods=['GET'])
def panelsearch_nanbyo_ontology():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)

    #if user_info is None:
    #    return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO))

    is_user_type_admin = api_is_user_admin(user_info["user_type"]) if user_info else None
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    session['service'] = SERVICE_PANELSEARCH_NANBYO

    ontology_list= api_psn_ontology_get_all_ontology()

    return render_template(
        'panelsearch_nanbyo_ontology.html',
        r_service=SERVICE_PANELSEARCH_NANBYO,
        r_mail=google_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        ontology_list=ontology_list
    )


@app.route('/panelsearch_nanbyo_get_ontology_data', methods=['GET'])
def panelsearch_nanbyo_get_ontology_data():

    r_ontology_id = request.args.get('ontology_id')
    if not r_ontology_id:
        return jsonify({})

    response_data = api_psn_ontology_get_ontology_data(r_ontology_id)
    check_api_response_error(response_data, 'panelsearch_nanbyo_get_ontology_data')
    if not response_data:
        return jsonify({})

    return response_data


@app.route('/panelsearch_nanbyo_upload_ontology_data', methods=['POST'])
def panelsearch_nanbyo_upload_ontology_data():
    try:
        uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO)

        try:
            data = request.get_json()
        except Exception as e:
            app.logger.error(f"JSON analyze failed: {e}")
            return jsonify({"error": "Invalid JSON format"}), 200

        # the validation of login must be done after the former reading data.
        # otherwise, the return for unloggin or not enough privilege will cause bad gateway error
        if user_info is None:
            return jsonify({"error": "not logging in "}), 200
        if not api_is_user_admin(user_info["user_type"]):
            return jsonify({"error": "not enough privilege"}), 200
        if not data:
            return jsonify({"error": "Missing request body"}), 200

        user_id = user_info["id"]

        new_ontology_file = data.get('new_ontology_file')
        new_ontology_file_md5 = data.get('new_ontology_file_md5')
        new_description = data.get('new_description')
        new_ontology_classmap = data.get('new_ontology_classmap')

        if not new_ontology_classmap:
            return jsonify({"error": "Missing classmap"})

        app.logger.warning(f"""
            Uploading new ontology data: {new_ontology_file}, 
            MD5: {new_ontology_file_md5}, 
            Description: {new_description},
        """)

        response = api_psn_ontology_update_ontology(
            new_ontology_file, new_ontology_file_md5, new_description, new_ontology_classmap,user_id
        )
        check_api_response_error(response, 'panelsearch_nanbyo_upload_ontology_data')

        return jsonify(response), 200

    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500



####
#  Panelsearch nanbyo admin
####

@app.route('/panellist_nanbyo_admin', methods=['GET'])
@app.route('/panelsearch_nanbyo_admin', methods=['GET'])
@app.route('/panelsearch_nanbyo_admin_user', methods=['GET'])
def panelsearch_nanbyo_admin_user():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    
    if user_info is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))
  
    r_username = get_username_from_session(user_info)

    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    user_id = user_info["id"]

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    group_list      = api_psn_group_get_group(user_info["user_type"], user_id)
    user_group_hash = api_psn_group_get_user_group_hash(user_info["user_type"], user_id)
    group_hash      = api_psn_group_get_group_hash()
    user_status_list= api_google_auth_get_user_status_list()

    return render_template(
        'panelsearch_nanbyo_admin_user.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_admin=True,
        r_group_list=group_list,
        r_group_hash=group_hash,
        r_user_group_hash=user_group_hash,
        r_active_page='user',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_load_user', methods=['POST'])
def panelsearch_nanbyo_admin_load_user():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if user_info is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]): 
        return jsonify({"error": "not enough privilege"})
    user_id = user_info["id"]

    data = request.get_json()
    filter_name   = data.get("filter_name",   "")
    filter_email  = data.get("filter_email",  "")
    filter_group  = data.get("filter_group",  "")
    filter_status = data.get("filter_status", "")

    response = api_google_auth_filter_psn_user_info_list(filter_name, filter_email, filter_group, filter_status)
    check_api_response_error(response, 'api_google_auth_filter_psn_user_info_list')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_change_user_status', methods=['POST'])
def panelsearch_nanbyo_admin_change_user_status():

    uid_session, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid_session is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": "not enough privilege"})

    data   = request.get_json()
    uid    = data.get('uid')
    action = data.get('action')

    mail_template = ""
    target_status = ""
    if action == 'delete':
        target_status = STATUS_DELETED_TO_GO
    elif action == 'reset_expired':
        target_status = STATUS_EXPIRED_RESET
        mail_template = MAIL_TEMPLATE_AUTH
    elif action == 'accept':
        target_status = STATUS_PASSED_TO_GO
        mail_template = MAIL_TEMPLATE_ACCEPT
    elif action == 'reject':
        target_status = STATUS_REJECTED_TO_GO
        mail_template = MAIL_TEMPLATE_REJECT
    elif action == 'block':
        target_status = STATUS_BLOCKED_TO_GO
        mail_template = MAIL_TEMPLATE_BLOCK
    elif action == 're_accept':
        target_status = STATUS_PASSED_TO_GO
        mail_template = MAIL_TEMPLATE_RESTORE
    else:
        return jsonify({"error": "unknown action"}) 

    ret = api_google_auth_change_account_status(AUTH_TYPE_PSN, uid, target_status)

    if ret is not None:
        return jsonify({"error": ret}), 500

    url_base_auth   = url_for("googleSignupAuthenticate", _external=True)
    url_base_server = url_for("index", _external=True)
    auth_type       = AUTH_TYPE_PSN

    response = {'suceed': 'done'}

    if mail_template:
        url_base = url_base_auth if action == 'reset_expired' else url_base_server
        mail_resp = sendmail(url_base, auth_type, mail_template, None, uid, MAIL_TARGET_BY_UID);
        if mail_resp["status"] == "error":
            response["email"] = mail_resp["error"]
            app.logger.warning(
                "Error occured when sending mail(%s) to UID:[%s] MSG[%s]", 
                mail_template, uid , mail_resp["error"]
            )

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_modify_user', methods=['POST'])
def panelsearch_nanbyo_admin_modify_user():

    uid_session, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid_session is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": "not enough privilege"})

    data = request.get_json()
    #app.logger.warning(f"modify user post: {json.dumps(data, ensure_ascii=False)}")

    response = api_google_user_modify(AUTH_TYPE_PSN, data)
    check_api_response_error(response, 'api_google_user_modify')

    return response


@app.route('/panelsearch_nanbyo_admin_group', methods=['GET'])
def panelsearch_nanbyo_admin_group():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    user_id = user_info["id"]

    is_user_type_admin = api_is_user_admin(user_info["user_type"])
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    if not is_user_type_admin and not is_user_type_curator:
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    r_username = get_username_from_session(user_info)

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    group_list = api_psn_group_get_group(user_info["user_type"], user_id)
   
    invite_email_template = api_psn_get_group_invite_email_template()
    check_api_response_error(invite_email_template, 'api_psn_get_group_invite_email_template')

    return render_template(
        'panelsearch_nanbyo_admin_group.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_group_list=group_list,
        r_google_form_url=google_form_url_psn,
        r_active_page='group',
        r_is_sidebar_collapsed=True,
        r_username=r_username,
        r_template_subject=invite_email_template['subject_template'],
        r_template_body=invite_email_template['body_template']
    )


@app.route('/panelsearch_nanbyo_admin_group_load_data', methods=['GET'])
def panelsearch_nanbyo_admin_group_load_data():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return jsonify({'error': "session not opened"})

    user_id = user_info["id"]

    selected_user_status_list = [STATUS_PASSED, STATUS_PASSED_TO_GO]
    user_list_arr   = api_google_auth_get_user_info_list(AUTH_TYPE_PSN, selected_user_status_list)

    user_type = user_info["user_type"]
    group_list_arr  = api_psn_group_get_group(user_type, user_id)
    group_user_hash = api_psn_group_get_group_user_hash(user_type, user_id)
    user_group_hash = api_psn_group_get_user_group_hash(user_type, user_id)

    return jsonify({
        'group_list_arr':  group_list_arr,
        'user_list_arr':   user_list_arr,
        'group_user_hash': group_user_hash,
        'user_group_hash': user_group_hash
    })


@app.route('/panelsearch_nanbyo_admin_group_add_group', methods=['POST'])
def panelsearch_nanbyo_admin_group_add_group():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400
    user_id = user_info["id"]

    data = request.get_json()
    group_title = data.get('group_title')
    if group_title is None:
        return jsonify({"error": "Missing required JSON parameter(group_title)"}), 400

    response = api_psn_group_add_group(group_title, user_id)
    check_api_response_error(response, 'api_psn_group_add_group')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_group_update_group', methods=['POST'])
def panelsearch_nanbyo_admin_group_update_group():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    data = request.get_json()
    group_title = data.get('group_title')
    if group_title is None:
        return jsonify({"error": "Missing required JSON parameter(group_title)"}), 400

    group_id = data.get('group_id')
    if group_id is None:
        return jsonify({"error": "Missing required JSON parameter(group_id)"}), 400

    response = api_psn_group_update_group(group_id, group_title)
    check_api_response_error(response, 'api_psn_group_update_group')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_group_delete_group', methods=['POST'])
def panelsearch_nanbyo_admin_group_delete_group():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)    
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    data = request.get_json()
    group_id = data.get('group_id')
    if group_id is None:
        return jsonify({"error": "Missing required JSON parameter(group_id)"}), 400

    response = api_psn_group_delete_group(group_id)
    check_api_response_error(response, 'api_psn_group_delete_group')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_group_add_group_user', methods=['POST'])
def panelsearch_nanbyo_admin_group_add_group_user():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    admin_user_id = user_info["id"]

    data = request.get_json()
    group_id = data.get('group_id')
    group_user_ids_str = data.get('user_ids')

    if not group_id or not group_user_ids_str:
        return jsonify({"error": "Missing required JSON parameter(group_id or user_ids)"}), 400

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_group(admin_user_id, group_id):
            return jsonify({'error': "user donot have enough privilidge"})

    try:
        group_user_ids = [int(uid.strip()) for uid in group_user_ids_str.split(',') if uid.strip().isdigit()]
    except ValueError:
        return jsonify({'error': 'user_ids contain invalid number'}), 400

    if not group_user_ids:
        return jsonify({'error': 'No valid user_ids'}), 400

    response = api_psn_group_add_group_user(admin_user_id, group_id, group_user_ids)
    check_api_response_error(response, 'api_psn_group_add_group_user')

    return jsonify(response)

    
@app.route('/panelsearch_nanbyo_admin_group_delete_group_user', methods=['POST'])
def panelsearch_nanbyo_admin_group_delete_group_user():

    uid_session, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid_session is None:
        return  jsonify({'error': "session not opened"}), 400

    admin_user_id = user_info["id"]

    data = request.get_json()
    group_id = data.get('group_id')
    group_user_ids_str = data.get('user_ids')
    if not group_id or not group_user_ids_str:
        return jsonify({"error": "Missing required JSON parameter(group_id or user_ids)"}), 400

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_group(admin_user_id, group_id):
            return jsonify({'error': "user donot have enough privilidge"})

    try:
        group_user_ids = [int(uid.strip()) for uid in group_user_ids_str.split(',') if uid.strip().isdigit()]
    except ValueError:
        return jsonify({'error': 'user_ids contain invalid number'}), 400

    if not group_user_ids:
        return jsonify({'error': 'No valid user_ids'}), 400

    response = api_psn_group_delete_group_user(admin_user_id, group_id, group_user_ids)
    check_api_response_error(response, 'api_psn_group_delete_group_user')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_group_change_group_user_role', methods=['POST'])
def panelsearch_nanbyo_admin_group_change_group_user_role():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    admin_user_id = user_info["id"]

    data = request.get_json()
    group_id = data.get('group_id')
    group_user_id  = data.get('user_id')
    group_user_role  = data.get('user_role')
    if not group_id or not group_user_id or not group_user_role:
        return jsonify({"error": "Missing required JSON parameter(group_id or user_id or user_role)"}), 400

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_group(admin_user_id, group_id):
            return jsonify({'error': "user donot have enough privilidge"})

    response = api_psn_group_change_group_user_role(admin_user_id, group_id, group_user_id, group_user_role)
    check_api_response_error(response, 'api_psn_group_change_group_user_role')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_get_panel_by_name', methods=['GET'])
def panelsearch_nanbyo_get_panel_by_name():

    input_text = request.args.get('q', '').strip()
    if not input_text:
        return json.dumps({'items':[]}, ensure_ascii=False)

    response_data = api_psn_get_panel_by_name(input_text)
    if check_api_response_error(response_data, 'api_psn_get_panel_by_name'):
        return jsonify(response_data)

    return json.dumps({'items': response_data}, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_get_group_panel', methods=['GET'])
def panelsearch_nanbyo_get_group_panel():

    group_id = request.args.get('group_id', type=int)
    if not group_id:
        return jsonify({'error': 'parameter group_id not found'})

    response_data = api_psn_group_get_group_panel(group_id)
    if check_api_response_error(response_data, 'api_psn_group_get_group_panel'):
        return jsonify(response_data)

    return json.dumps({'items': response_data}, ensure_ascii=False)


@app.route('/panelsearch_nanbyo_add_group_panel', methods=['POST'])
def panelsearch_nanbyo_add_group_panel():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"})

    data = request.get_json(silent=True) or {}
    try:
        group_id = int(data.get('group_id'))
    except (TypeError, ValueError):
        group_id = None
    panel_ids_str = data.get('panel_id')

    if not group_id or not panel_ids_str:
        return jsonify({'error': 'parameter group_id or panel_id not found'})

    try:
        panel_ids = panel_ids_str.split(',')
    except ValueError:
        return jsonify({'error': 'panel_ids contain invalid number'})

    response_data = api_psn_group_add_group_panel(group_id,panel_ids)
    check_api_response_error(response_data, 'api_psn_group_add_group_panel')

    return jsonify(response_data)


@app.route('/panelsearch_nanbyo_delete_group_panel', methods=['POST'])
def panelsearch_nanbyo_delete_group_panel():

    data = request.get_json(silent=True) or {}
    try:
        group_id = int(data.get('group_id'))
    except (TypeError, ValueError):
        group_id = None
    panel_id = data.get('panel_id')

    if not group_id or not panel_id:
        return jsonify({'error': 'parameter group_id or panel_id not found'})

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)    
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400    

    user_id = user_info["id"]

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_group(user_id, group_id):
            return jsonify({'error': "user donot have enough privilidge"})

    response_data = api_psn_group_delete_group_panel(group_id,panel_id)
    check_api_response_error(response_data, 'api_psn_group_delete_group_panel')

    return jsonify(response_data)


@app.route('/panelsearch_nanbyo_admin_group_activity', methods=['GET'])
def panelsearch_nanbyo_admin_group_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    r_username = get_username_from_session(user_info)

    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN
    return render_template(
        'panelsearch_nanbyo_admin_group_activity.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_type_admin=True,
        r_lang='ja',
        r_active_page='group_activity',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_load_group_activity', methods=['GET'])
def panelsearch_nanbyo_admin_load_group_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    filter_text = ''  if request.args.get('filter_text') is None else request.args.get('filter_text')

    response = api_psn_load_group_activity_log(filter_text)
    check_api_response_error(response, 'api_psn_load_group_activity_log')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_activity', methods=['GET'])
def panelsearch_nanbyo_admin_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    user_id=user_info["id"]

    r_username = get_username_from_session(user_info)

    is_user_type_admin=api_is_user_admin(user_info["user_type"])
    is_user_type_curator=check_user_curator_or_not(user_info, is_user_type_admin)

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    return render_template(
        'panelsearch_nanbyo_admin_activity.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_lang='ja',
        r_active_page='activity',
        r_username=r_username
    )


#@app.route('/panelsearch_nanbyo_admin_load_activity', methods=['GET', 'POST'])
@app.route('/panelsearch_nanbyo_admin_load_activity', methods=['POST'])
def panelsearch_nanbyo_admin_load_activity():
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    data = request.get_json()
    filter_panel   = data.get('filter_panel')
    filter_version = data.get('filter_version')
    filter_entity  = data.get('filter_entity')
    filter_from    = data.get('filter_from')
    filter_to      = data.get('filter_to')

    response = api_psn_load_user_activity_log(filter_panel, filter_version, filter_entity, filter_from, filter_to)
    check_api_response_error(response, 'api_psn_load_user_activity_log')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_load_activity_detail', methods=['POST'])
def panelsearch_nanbyo_admin_load_activity_detail():
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    activity = request.get_json()

    response = api_psn_load_user_activity_detail(activity)
    check_api_response_error(response, 'api_psn_load_user_activity_detail')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_load_activity_history', methods=['POST'])
def panelsearch_nanbyo_admin_load_activity_history():
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400

    data = request.get_json()

    response = api_psn_load_user_activity_history(data)
    check_api_response_error(response, 'api_psn_load_user_activity_history')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_load_panel_version_and_entity', methods=['GET'])
def panelsearch_nanbyo_admin_load_panel_version_and_entity():
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"})

    panel_id = request.args.get('panel_id')
    if not panel_id:
        return jsonify({'error': "input parameter insufficient(panel_id)"})

    response = api_psn_load_panel_version_and_entity(panel_id)
    check_api_response_error(response, 'api_psn_load_panel_version_and_entity')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_authentication', methods=['GET'])
def panelsearch_nanbyo_admin_authentication():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)

    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page', 
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    r_username = get_username_from_session(user_info)

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    return render_template(
        'panelsearch_nanbyo_admin_authentication.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_type_admin=True,
        r_active_page='authentication',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_load_authentication_log', methods=['GET','POST'])
def panelsearch_nanbyo_admin_load_authentication_log():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    data = request.get_json()
    name     = data.get('filter_name')
    fromdate = data.get('filter_fromdate')
    todate   = data.get('filter_todate')
    results  = data.get('filter_results')

    response = api_google_auth_load_authlog(AUTH_TYPE_PSN,name,fromdate,todate,results )
    check_api_response_error(response, 'api_google_auth_load_authlog')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_admin_incharge', methods=['GET'])
def panelsearch_nanbyo_admin_incharge():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    user_id = user_info["id"]
    is_user_type_admin = api_is_user_admin(user_info["user_type"])
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    if not is_user_type_admin and not is_user_type_curator:
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page', 
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    r_username = get_username_from_session(user_info)

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    return render_template(
        'panelsearch_nanbyo_admin_incharge.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_lang='ja',
        r_active_page='incharge',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_load_incharge_activity', methods=['GET'])
def panelsearch_nanbyo_admin_load_incharge_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"})

    user_id = user_info["id"]

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_some_group(user_id):
            return jsonify({'error': "user donot have enough privilidge"})

    curator_user_id = None if api_is_user_admin(user_info["user_type"]) else user_id

    response = api_psn_load_incharge_user_activity_log(curator_user_id)
    check_api_response_error(response, 'api_psn_load_incharge_user_activity_log')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/panelsearch_nanbyo_admin_load_incharge_check_history', methods=['GET'])
def panelsearch_nanbyo_admin_load_incharge_check_history():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"})

    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_some_group(user_info["id"]):
            return jsonify({'error': "user donot have enough privilidge"})

    curator_user_id=user_info["id"]

    response = api_psn_load_curator_check_history(curator_user_id)
    check_api_response_error(response, 'api_psn_load_curator_check_history')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_check_user_activity', methods=['GET','POST'])
def panelsearch_nanbyo_admin_check_user_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"})
    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_some_group(user_info["id"]):
            return jsonify({'error': "user donot have enough privilidge"})

    curator_user_id=user_info["id"]

    activity_id = request.args.get('activity_id')

    response = api_psn_check_user_activity(curator_user_id, activity_id)
    check_api_response_error(response, 'api_psn_check_user_activity')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_uncheck_user_activity', methods=['GET','POST'])
def panelsearch_nanbyo_admin_uncheck_user_activity():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"})
    if not api_is_user_admin(user_info["user_type"]):
        if not api_psn_group_is_user_curator_of_some_group(user_info["id"]):
            return jsonify({'error': "user donot have enough privilidge"})

    curator_user_id = user_info["id"]
    activity_id = request.args.get('activity_id')

    response = api_psn_uncheck_user_activity(curator_user_id, activity_id)
    check_api_response_error(response, 'api_psn_uncheck_user_activity')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_profile', methods=['GET'])
def panelsearch_nanbyo_admin_profile():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    r_username = get_username_from_session(user_info)

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    is_user_type_admin = api_is_user_admin(user_info["user_type"])
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    return render_template(
        'panelsearch_nanbyo_admin_profile.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_user_info=user_info,
        r_active_page='profile',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_review', methods=['GET'])
def panelsearch_nanbyo_admin_review():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    r_username = get_username_from_session(user_info)

    r_lang = "ja"
    if request.args.get('lang') and request.args.get('lang') == "en":
        r_lang = "en"

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    is_user_type_admin = api_is_user_admin(user_info["user_type"])
    is_user_type_curator = check_user_curator_or_not(user_info, is_user_type_admin)

    return render_template(
        'panelsearch_nanbyo_admin_review.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_lang=r_lang,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_type_curator=is_user_type_curator,
        r_user_type_admin=is_user_type_admin,
        r_active_page='review',
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_mail', methods=['GET'])
def panelsearch_nanbyo_admin_mail():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return redirect(url_for('googleLogin', service=SERVICE_PANELSEARCH_NANBYO_ADMIN))

    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('panelsearch_nanbyo_panel_list')
        )

    session['service'] = SERVICE_PANELSEARCH_NANBYO_ADMIN

    email_templates = get_all_email_template()
    email_settings  = get_mail_settings()

    r_username = get_username_from_session(user_info)

    return render_template(
        'panelsearch_nanbyo_admin_mail.html',
        r_service=SERVICE_PANELSEARCH_NANBYO_ADMIN,
        r_mail=google_id,
        r_email_templates=email_templates,
        r_email_settings=email_settings,
        r_user_id=user_info["id"],
        r_user_type_admin=True,
        r_active_page='mail',
        r_is_sidebar_collapsed=True,
        r_username=r_username
    )


@app.route('/panelsearch_nanbyo_admin_load_email', methods=['GET'])
def panelsearch_nanbyo_admin_load_email():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    filter_to       = request.args.get('filter_to')
    filter_fromdate = request.args.get('filter_fromdate')
    filter_todate   = request.args.get('filter_todate')
    filter_auth_type= request.args.get('filter_auth_type')
    filter_status   = request.args.get('filter_status')
    filter_template_name = request.args.get('filter_type')

    response = api_psn_admin_load_email(filter_to,filter_fromdate,filter_todate,filter_auth_type,filter_status,filter_template_name)
    check_api_response_error(response, 'api_psn_admin_load_email')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_load_email_detail/<int:email_id>', methods=['GET'])
def panelsearch_nanbyo_admin_load_email_detail(email_id):

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    response = api_psn_admin_load_email_detail(email_id)
    check_api_response_error(response, 'api_psn_admin_load_email_detail')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_resend_email/<int:email_id>', methods=['POST'])
def panelsearch_nanbyo_admin_resend_email(email_id):
    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 500
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 500

    response = api_psn_admin_resend_email(email_id)
    check_api_response_error(response, 'api_psn_admin_resend_email')

    return jsonify(response)


@app.route('/panelsearch_nanbyo_admin_modify_email_template', methods=['POST'])
def panelsearch_nanbyo_admin_modify_email_template():

    uid, google_id, user_info = get_user_info_from_session(SERVICE_PANELSEARCH_NANBYO_ADMIN)
    if uid is None:
        return jsonify({'status':'error', 'message': "session not opened"}), 500
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'status':'error', 'message': "user donot have enough privilidge"}), 500

    data = request.get_json()
    response = api_psn_admin_modify_email_template(data)
    check_api_response_error(response, 'api_psn_admin_modify_email_template')

    return jsonify(response)



# For google authentication

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_FORM_SECRET_KEY = app.config['GOOGLE_FORM_SECRET_KEY']

google_form_url_pcf = app.config['GOOGLE_FORM_URL_PCF']
google_form_url_psn = app.config['GOOGLE_FORM_URL_PSN']

CLIENT_ID     = app.config['GOOGLE_CLIENT_ID']
CLIENT_SECRET = app.config['GOOGLE_CLIENT_SECRET']
SCOPES        = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]


def get_auth_type_by_service(service):
    if service == SERVICE_PANELSEARCH_NANBYO or service == SERVICE_PANELSEARCH_NANBYO_ADMIN:
        return AUTH_TYPE_PSN
    return AUTH_TYPE_COMMON



def is_googleform_request():
    """
    Check if POST data contains 'service' key with value 'pubcasefinder' or 'panelsearch_nanbyo'.
    Check if POST data contains 'secret_key' key with value the same as from config.cfg.
    Works for both form data and JSON payload.
    """
    # If JSON request
    if request.is_json:
        data = request.get_json(silent=True) or {}
    else:
        # If form data (like HTML forms)
        data = request.form.to_dict()

    valid = ((data.get("auth_type") in {AUTH_TYPE_COMMON, AUTH_TYPE_PSN}) and (data.get("secret_key") == GOOGLE_FORM_SECRET_KEY))

    return valid, data


@app.route('/google-signup-regist-user', methods=['POST'])
def googleSignupRegistUser():

    valid, data = is_googleform_request()

    if not valid:
        app.logger.warning(f"Invalid google form post: {json.dumps(data, ensure_ascii=False)}")
        return jsonify({"status": "error", "message": "Invalid google form regist user post"})

    uid       = data.get("uid")
    google_id = data.get("google_id")
    auth_type = data.get("auth_type")
    app.logger.info("new user regist UID:[%s] GOOGLE:[%s]", uid , google_id)
    random_string = secrets.token_urlsafe(30)

    response = api_google_auth_create_new_account(auth_type,random_string,data)

    if "authentication_code" not in response:
        msg = response["message"]
        app.logger.warning(f"Error occured when regist new user: {msg}")
 
        m = re.search(r"Duplicate entry '([^']+)' for key 'email'", msg)
        if m:
            affiliation_email = m.group(1)
            msg = f"The affiliation email({affiliation_email}) was already registed!"

        mail_to = data.get("email")
        user_name = data.get('last_name_en') + ' ' + data.get('first_name_en')
        if auth_type == AUTH_TYPE_PSN:
            user_name = data.get('last_name_nl') + ' ' + data.get('first_name_nl')
        mail_resp = sendmail_registry_fail(auth_type, user_name, mail_to, msg)
        app.logger.warning(mail_resp)

        return jsonify(response)

    # send verification request mail.
    url_base = url_for("googleSignupAuthenticate", _external=True)
    
    mail_resp = sendmail(url_base, auth_type, MAIL_TEMPLATE_AUTH, None, uid, MAIL_TARGET_BY_UID)
    if mail_resp["status"] == "error":
        message = "Error occured when sending verification request mail to UID:[%s] GOOGLE:[%s] MSG[%s]", uid , google_id,  mail_resp["error"]
        app.logger.warning(message)
        return jsonify({"status": "error", "message": message})

    return jsonify(response), 500


@app.route('/google-signup-authenticate', methods=['GET'])
def googleSignupAuthenticate():

    auth_type = request.args.get('auth_type')
    uid       = request.args.get('uid')
    code      = request.args.get('code')

    if auth_type not in {AUTH_TYPE_COMMON,AUTH_TYPE_PSN} or uid is None or code is None:
        r_error_message = 'Error: insuficent input parameters!'
        return render_template('panelsearch_error.html',r_error_type='error', r_error_message=r_error_message, r_next_page='')

    account_status = api_google_auth_get_account_auth_status(auth_type,uid,code)

    r_error_type    = None
    r_error_message = None
    r_next_page     = None

    if account_status == "NONE":
        r_error_type = 'error'
        r_error_message = f"Found none(auth_type={auth_type},uid={uid},code={code}). Please go back to signup first."
       
    elif account_status == STATUS_AUTHENTICATED:
        r_error_type = 'info'
        r_error_message = "You have already sucessfully finished authentication."

    elif account_status in {STATUS_PASSED,STATUS_PASSED_TO_GO,STATUS_BLOCKED,STATUS_BLOCKED_TO_GO}:
        r_error_type = 'info'
        r_error_message = "You have already sucessfully finished registration."

    elif account_status == STATUS_EXPIRED:
        r_error_type = 'error'
        r_error_message = "Your registration was expired due to no authentication within 3 days..."

    elif account_status in {STATUS_CANCELLED,STATUS_CANCELLED_TO_GO}:
        r_error_type = 'error'
        r_error_message = "You have already cancelled your account."

    elif account_status in {STATUS_DELETED, STATUS_DELETED_TO_GO, STATUS_REJECTED, STATUS_REJECTED_TO_GO}:
        r_error_type = 'error'
        r_error_message = "Your registration was rejected."

    if r_error_message is not None:
        r_next_page=url_for('panelsearch_nanbyo_panel_list', _external=True)
        if auth_type == AUTH_TYPE_COMMON:
            r_next_page=url_for('index')

        return render_template('panelsearch_error.html',r_error_type=r_error_type, r_error_message=r_error_message, r_next_page=r_next_page)

    # for status: STATUS_REGISTED, STATUS_EXPIRED_RESET

    response = api_google_auth_authenticate(auth_type, uid, code)

    if response is None :
        # for diseasesearch,casesharing,panelsearch modules,
        # after user finished email authentication, accept the user registration instantly.
        if auth_type == AUTH_TYPE_COMMON:

            api_google_auth_change_account_status(AUTH_TYPE_COMMON, uid, STATUS_PASSED)

            url_base = url_for("index", _external=True)
            mail_resp = sendmail(url_base, AUTH_TYPE_COMMON, MAIL_TEMPLATE_ACCEPT, None, uid, MAIL_TARGET_BY_UID);
            if mail_resp["status"] == "error":
                app.logger.warning("Error occured when sending registration passed info mail to UID:[%s] MSG:(%s)", uid, mail_resp["error"])

            r_error_message = "Thanks for your authentication, we will contact you by Affiliation Email as soon as possible."
            r_next_page = url_for('index', _external=True)
            return render_template('panelsearch_error.html',r_error_type='info', r_error_message=r_error_message, r_next_page=r_next_page)

        else:
            r_error_message = "Thanks for your authentication, we will contact you by Affiliation Email as soon as possible."
            r_next_page = url_for('panelsearch_nanbyo_panel_list', _external=True)
            return render_template('panelsearch_error.html',r_error_type='info', r_error_message=r_error_message, r_next_page=r_next_page)

    else:
        return render_template('panelsearch_error.html',r_error_type='error', r_error_message=response, r_next_page='')


@app.route('/google-signup-check-status', methods=['POST'])
def googleSignupCheckStatus():

    valid, data = is_googleform_request()
    if not valid:
        app.logger.warning(f"Invalid google form post: {json.dumps(data, ensure_ascii=False)}")
        return jsonify({"status": "error", "message": "Invalid google form request"}), 500

    auth_type = data.get("auth_type")

    authentication_uid_list_str  = data.get("uid_list")
    authenticated_uid_list_str   = api_google_auth_check_account_auth_status(auth_type, authentication_uid_list_str)

    reset_expire_uid_list_str    = api_google_auth_get_account_by_status(auth_type, STATUS_EXPIRED_RESET)

    cancelled_to_go_uid_list_str = api_google_auth_get_account_by_status(auth_type, STATUS_CANCELLED_TO_GO)

    passed_to_go_uid_list_str    = api_google_auth_get_account_by_status(auth_type, STATUS_PASSED_TO_GO)

    rejected_to_go_uid_list_str  = api_google_auth_get_account_by_status(auth_type, STATUS_REJECTED_TO_GO)

    deleted_to_go_uid_list_str   = api_google_auth_get_account_by_status(auth_type, STATUS_DELETED_TO_GO)

    blocked_to_go_uid_list_str   = api_google_auth_get_account_by_status(auth_type, STATUS_BLOCKED_TO_GO)

    return jsonify({"status": "success", 
                    "authenticated_uid_list_str":   authenticated_uid_list_str, 
                    "reset_expire_uid_list_str":    reset_expire_uid_list_str, 
                    "passed_to_go_uid_list_str":    passed_to_go_uid_list_str, 
                    "rejected_to_go_uid_list_str":  rejected_to_go_uid_list_str, 
                    "cancelled_to_go_uid_list_str": cancelled_to_go_uid_list_str,
                    "deleted_to_go_uid_list_str":   deleted_to_go_uid_list_str,
                    "blocked_to_go_uid_list_str":   blocked_to_go_uid_list_str})


@app.route('/google-signup-change-status', methods=['POST'])
def googleSignupChangeStatus():

    valid, data = is_googleform_request()
    if not valid:
        app.logger.warning(f"Invalid google form post: {json.dumps(data, ensure_ascii=False)}")
        return jsonify({"status": "error", "message": "Invalid google form regist user post"}), 500

    auth_type                 = data.get("auth_type")
    passed_uid_list_str       = data.get("passed_uid_list_str",       '')
    rejected_uid_list_str     = data.get("rejected_uid_list_str",     '')
    reset_expire_uid_list_str = data.get("reset_expire_uid_list_str", '')
    expired_uid_list_str      = data.get("expired_uid_list_str",      '')
    deleted_uid_list_str      = data.get("deleted_uid_list_str",      '')
    cancelled_uid_list_str    = data.get("cancelled_uid_list_str",    '')
    blocked_uid_list_str      = data.get("blocked_uid_list_str",      '')

    url_base = url_for("index", _external=True)

    if passed_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, passed_uid_list_str, STATUS_PASSED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if rejected_uid_list_str:
        app.logger.info(f"reject user:{rejected_uid_list_str}")
        ret = api_google_auth_change_account_status(auth_type, rejected_uid_list_str, STATUS_REJECTED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if reset_expire_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, reset_expire_uid_list_str, STATUS_REGISTED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if expired_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, expired_uid_list_str, STATUS_EXPIRED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if deleted_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, deleted_uid_list_str, STATUS_DELETED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if cancelled_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, cancelled_uid_list_str, STATUS_CANCELLED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    if blocked_uid_list_str:
        ret = api_google_auth_change_account_status(auth_type, blocked_uid_list_str, STATUS_BLOCKED)
        if ret is not None:
            return jsonify({"status": "error", "message": ret}), 500

    return jsonify({"status": "success", "message": "finished"}), 500


@app.route("/google-goto-signup", methods=['GET'])
def googleGotoSignup():

    target = SERVICE_PANELSEARCH_NANBYO
    if request.args.get('target') is not None:
        target = request.args.get('target')

    if target == SERVICE_PANELSEARCH_NANBYO:
        return redirect(google_form_url_psn)
    else:
        return redirect(google_form_url_pcf)


@app.route("/google-login", methods=['GET'])
def googleLogin():

    # 1. Client IP
    xff = request.headers.get('X-Forwarded-For', request.remote_addr)
    if xff:
        ip = xff.split(',')[0].strip()
    else:
        ip = request.remote_addr

    # 2. User-Agent
    ua_string = request.headers.get("User-Agent", "")
    ua = parse(ua_string)

    client_info = {
        "ip": ip,
        "browser": {
            "family": ua.browser.family,
            "version": ua.browser.version_string,
        },
        "os": {
            "family": ua.os.family,
            "version": ua.os.version_string,
        },
        "device": {
            "family": ua.device.family
        }
    }

    session["client_info"] = client_info

    r_service = SERVICE_PANELSEARCH
    if request.args.get('service') is not None:
        r_service = request.args.get('service')
    else:
        if session['service'] is not None:
            r_service = session['service']

    if request.referrer:
        session['redirect_url'] = request.referrer

    session['service'] = r_service

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=url_for("googleCallback", _external=True)
    )
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account consent"
    )

    session["code_verifier"] = flow.code_verifier
    session["state"] = state

    return redirect(authorization_url)


def get_user_info_from_session(service):
    uid = None
    google_id = None
    user_info = None

    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH,
        SERVICE_PANELSEARCH_NANBYO,
        SERVICE_PANELSEARCH_NANBYO_ADMIN
    }:
        return None, None, None

    if service in {SERVICE_PANELSEARCH_NANBYO,SERVICE_PANELSEARCH_NANBYO_ADMIN}:
        if "user-info-psn" in session:
            user_info = session["user-info-psn"]
    else:
        if "user-info-pcf" in session:
            user_info = session["user-info-pcf"]

    if user_info is not None:
        uid = user_info['uid']
        google_id = user_info['google_id']

    return uid, google_id, user_info


@app.route("/google-login-callback")
def googleCallback():

    error = request.args.get('error')
    if error:
        # Handle the case where user denied access
        return render_template(
            'panelsearch_error.html',
            r_error_type='error',
            r_error_message="Access Denied by User",
            r_next_page=url_for('googleLogin')
        )

    code_verifier = session.get('code_verifier')
    state_session = session.get("state")
    if not state_session:
        return render_template(
            'panelsearch_error.html',
            r_error_type='error',
            r_error_message="Session state missing. Please try login again.",
            r_next_page=url_for('googleLogin')
        )

    state_callback = request.args.get("state")
    if state_callback != state_session:
        return render_template(
            'panelsearch_error.html',
            r_error_type='error',
            r_error_message="Invalid state. Try Again",
            r_next_page=url_for('googleLogin')
        )

    service = session.get('service', SERVICE_DISEASESEARCH)

    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            state=state_callback,
            redirect_uri=url_for("googleCallback", _external=True)
        )
        if code_verifier:
            flow.code_verifier = code_verifier
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        session["credentials"] = {
            "token":         credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri":     credentials.token_uri,
            "client_id":     credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes":        credentials.scopes
        }

        # get client google account email
        creds = Credentials(**session["credentials"])
        user_info_google = build("oauth2", "v2", credentials=creds).userinfo().get().execute()
        google_id = user_info_google.get("email")

        # load user info from db
        auth_type = get_auth_type_by_service(service)

        user_info = api_google_auth_get_user_info_by_google_account(auth_type, google_id)
        if user_info is None:
            return redirect(url_for('googleGotoSignup', target=service))

        account_status = user_info["status"]
        uid = user_info["uid"]
        user_id = user_info["id"]

        r_error_message = None
        reason = None

        if account_status in {STATUS_REGISTED, STATUS_EXPIRED_RESET}:
            reason = "Mail auth not yet"
            r_error_message = "Your registration was not completed due to the email authentication was not finished yet, Please check your Affiliation Email Account and finish authentication."

        elif account_status == STATUS_AUTHENTICATED:
            reason = "Waiting for admin to pass"
            r_error_message = "Your have already finished the email authentication. Please wait for further process."

        elif account_status == STATUS_EXPIRED:
            expired_at = user_info["changed_at"]
            reason = "Expired"
            r_error_message =  f"Your registration was expired at {expired_at} due to no authentication within 3 days."

        elif account_status in {STATUS_REJECTED, STATUS_REJECTED_TO_GO}:
            r_error_message = "Your registration was rejected."
            reason = "Rejected"

        elif account_status in {STATUS_BLOCKED, STATUS_BLOCKED_TO_GO}:
            r_error_message = "Your registration was blocked."
            reason = "Blocked"

        elif account_status in {STATUS_DELETED, STATUS_DELETED_TO_GO}:
            r_error_message =  "Your registration was deleted."
            reason = "Deleted"

        elif account_status in {STATUS_CANCELLED, STATUS_CANCELLED_TO_GO}:
            r_error_message =  "You have already cancelled your account."
            reason = "Cancelled"

        elif account_status in {STATUS_PASSED, STATUS_PASSED_TO_GO}:
            app.logger.info(f"user({uid}) logined in")

        else:
            r_error_message = f"unknown status:{account_status}"
            reason = f"unknown status:{account_status}"

        client_info = session["client_info"]
        user_agent = " ".join([
            client_info['ip'],
            f"{client_info['browser']['family']}/{client_info['browser']['version']}",
            f"{client_info['os']['family']}/{client_info['os']['version']}"
        ])

        if reason is not None:
            api_google_auth_add_authlog(auth_type, user_id, user_agent, AUTH_LOG_RESULT_FAIL, AUTH_LOG_ACTION_LOGIN, reason)
        else:
            api_google_auth_add_authlog(auth_type, user_id, user_agent, AUTH_LOG_RESULT_SUCCESS, AUTH_LOG_ACTION_LOGIN, reason)

        if r_error_message is not None:
            next_page = url_for('panelsearch_nanbyo_panel_list', _external=True) if service == SERVICE_PANELSEARCH_NANBYO else '/'
            return render_template('panelsearch_error.html',r_error_type='info', r_error_message=r_error_message, r_next_page=next_page)

        redirect_url = session.get('redirect_url', '/')

        if service == SERVICE_PANELSEARCH_NANBYO:
            session["user-info-psn"] = user_info
        elif service == SERVICE_PANELSEARCH_NANBYO_ADMIN:
            session["user-info-psn"] = user_info
            if not session.get('redirect_url') or "admin" not in redirect_url:
                redirect_url = url_for("panelsearch_nanbyo_admin_user")
        else:
            session["user-info-pcf"] = user_info

        return redirect(redirect_url)

    except Exception as e:
        msg = f"OAuth2 callback failed: {str(e)}"
        app.logger.exception(msg)

        return render_template(
            'panelsearch_error.html', 
            r_error_type='error', 
            r_error_message='Login failed. Please try again later.', 
            r_next_page=url_for('googleLogin', _external=True)
        )


@app.route('/google_user_logout')
def google_user_logout():

    service = request.args.get('service')

    uid, google_id, user_info = get_user_info_from_session(service)
    if user_info:
        user_id = user_info["id"]
        client_info = session["client_info"]
        user_agent = " ".join([
            client_info['ip'],
            f"{client_info['browser']['family']}/{client_info['browser']['version']}",
            f"{client_info['os']['family']}/{client_info['os']['version']}"
        ])
        auth_type = get_auth_type_by_service(service)
        api_google_auth_add_authlog(auth_type, user_id, user_agent, AUTH_LOG_RESULT_SUCCESS, AUTH_LOG_ACTION_LOGOUT, None)

    redirect_url = '/'

    if service == SERVICE_CASESHAREING:
        redirect_url = url_for('record', _external=True)
        if "user-info-pcf" in session:
            session.pop('user-info-pcf')

    elif service == SERVICE_PANELSEARCH:
        redirect_url = request.referrer
        if redirect_url:
            if 'google_user_profile' in redirect_url or 'common_admin' in redirect_url:
                redirect_url = url_for('panelsearch_panel_list', _external=True)
        if "user-info-pcf" in session:
            session.pop('user-info-pcf')

    elif service == SERVICE_PANELSEARCH_NANBYO:
        redirect_url = request.referrer
        if redirect_url:
            if 'google_user_profile' in redirect_url or 'admin' in redirect_url:
                redirect_url = url_for('panelsearch_nanbyo_panel_list', _external=True)
        if 'user-info-psn' in session:
            session.pop('user-info-psn')

    elif service == SERVICE_PANELSEARCH_NANBYO_ADMIN:
        redirect_url = url_for('panelsearch_nanbyo_panel_list', _external=True)
        if 'user-info-psn' in session:
            session.pop('user-info-psn')

    else:
        redirect_url = request.referrer
        if redirect_url:
            if 'google_user_profile' in redirect_url or 'common_admin' in redirect_url:
                redirect_url = '/'
        if 'user-info-pcf' in session:
            session.pop('user-info-pcf')
        if 'user-info-psn' in session:
            session.pop('user-info-psn')

    if 'redirect_url' in session:
        session.pop('redirect_url')

    return redirect(redirect_url)


@app.route('/google_user_profile')
def google_user_profile():

    r_lang = "ja"
    if request.args.get('lang') is not None and request.args.get('lang') == "en":
        r_lang = "en"
   
    service = request.args.get('service')

    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        msg = f"unknown service({service})"
        return render_template(
            'panelsearch_error.html',
            r_error_type='error',
            r_error_message=msg,
            r_next_page=''
        )

    uid, google_id, user_info = get_user_info_from_session(service)

    session['service'] = service

    if uid is None:
        if service == SERVICE_CASESHAREING:
            return redirect(url_for('record', _external=True))
        elif service == SERVICE_PANELSEARCH:
            return redirect(url_for('panelsearch_panel_list', _external=True))
        else:
            return redirect('/')

    r_username = get_username_from_session(user_info)
    r_user_type_admin = api_is_user_admin(user_info["user_type"])

    return render_template(
        'google_user.html',
        r_service=service,
        r_lang=r_lang,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_info=user_info,
        r_username=r_username,
        r_user_type_admin=r_user_type_admin
    )


@app.route('/google_user_save', methods=['POST'])
def google_user_modify():

    service_in_session = ''
    if 'service' in session:
        service_in_session = session['service']
    else:
        return jsonify({'error': 'no service in session'})

    uid_in_session, google_id_in_session, user_info_in_session = get_user_info_from_session(service_in_session)

    if user_info_in_session is None:
        return jsonify({'error': 'no user info in session'})

    data = request.get_json()

    service = data.get('service')
    google_id = data.get('google_id')

    if google_id != google_id_in_session or service != service_in_session:
        return jsonify({'error': f"different user in session"})

    auth_type = get_auth_type_by_service(service)

    response = api_google_user_modify(auth_type, data)

    if not check_api_response_error(response, 'api_google_user_modify'):
        changed_user_info = api_google_auth_get_user_info_by_google_account(auth_type, google_id)
        if not check_api_response_error(changed_user_info, 'api_google_auth_get_user_info_by_google_account'):
            if service == SERVICE_PANELSEARCH_NANBYO or service == SERVICE_PANELSEARCH_NANBYO_ADMIN:
                session["user-info-psn"] = changed_user_info
            else:
                session["user-info-pcf"] = changed_user_info
        else:
            return jsonify(changed_user_info)

    return jsonify(response)


@app.route('/google_user_delete', methods=['POST'])
def google_user_delete():

    service_in_session = ''
    if 'service' in session:
        service_in_session = session['service']
    else:
        return jsonify({'error': 'no service in session'})

    uid_in_session, email_in_session, user_info_in_session = get_user_info_from_session(service_in_session)

    if user_info_in_session is None:
        return jsonify({'error': 'no user info in session'})

    data = request.get_json()
    uid     = data.get('uid')
    email   = data.get('account')
    service = data.get('service')

    if uid is None:
        return jsonify({'error': 'insufficent parameters'})

    if email != email_in_session or service != service_in_session:
        return jsonify({'error': f"email({email}) or service({service}) are not identical to info in session"})

    auth_type = get_auth_type_by_service(service)

    response = api_google_auth_change_account_status(auth_type, uid, STATUS_CANCELLED_TO_GO)
    if response:
        return jsonify({'error': response})

    url_base_server = url_for("index", _external=True)
    mail_resp = sendmail(url_base_server, auth_type, MAIL_TEMPLATE_CANCEL, None, uid, MAIL_TARGET_BY_UID);
    if mail_resp["status"] == "error":
        response["email"] = mail_resp["error"]
        app.logger.warning(
            "Error occured when sending mail(%s) to UID:[%s] MSG[%s]",
            MAIL_TEMPLATE_CANCEL, uid , mail_resp["error"]
        )

    return jsonify({"succeed": "user was successfully cancelled"})




######
#
# for nanbyodata
#
######


@app.route('/common_nanbyo_treeview_sample', methods=['GET'])
def common_nanbyo_treeview_sample():

    r_nando_id = ""
    if request.args.get('nando_id') is not None:
        r_nando_id = request.args.get('nando_id')

    r_lang = "en"
    if request.args.get('lang') is not None:
        r_lang = request.args.get('lang')

    return render_template('common_nanbyo_treeview_sample.html', r_nando_id=r_nando_id, r_lang=r_lang)


@app.route('/common_nanbyo_get_panel_hierarchy', methods=['GET'])
def common_nanbyo_GetPanelHierarchy():
    r_nando_id = "NANDO:1200477"
    if request.args.get('nando_id') is not None:
        r_nando_id = request.args.get('nando_id')

    r_lang = "ja"
    if request.args.get('lang') is not None and request.args.get('lang') == "en":
        r_lang = request.args.get('lang')

    response_data = api_nanbyo_get_panel_hierarchy(r_nando_id,r_lang)

    return response_data


@app.route('/common_nanbyo_get_panel_descendant', methods=['GET'])
def common_nanbyo_get_panel_descendant():
    r_lang = "ja"
    if request.args.get('lang'):
        if request.args.get('lang') == "en":
            r_lang = request.args.get('lang')
    r_nando_id = request.args.get('nando_id')

    response_data = api_nanbyo_get_panel_descendant(r_nando_id, r_lang)

    return json.dumps(response_data, ensure_ascii=False)


from flask import render_template_string
from user_agents import parse

@app.route("/client_info", methods=["GET", "POST"])
def client_info():
    ua_string = request.headers.get("User-Agent", "Unknown")
    ua = parse(ua_string)
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    # Each entry: key → (value, description)
    info = {
        "Client IP": (client_ip, "The detected IP address of the client"),
        "Request Method": (request.method, "HTTP method used (GET, POST, etc.)"),
        "Access URL": (request.url, "The full URL the client accessed"),
        "Protocol": (request.scheme, "Indicates whether the connection is HTTP or HTTPS"),
        "Host": (request.host, "Host name and port from the request header"),
        "Remote Port": (request.environ.get("REMOTE_PORT"), "The source port number used by the client"),
        "Referer": (request.headers.get("Referer", "None"), "The page that linked to this one (if any)"),
        "Browser": (ua.browser.family, "The browser software name"),
        "Browser Version": (ua.browser.version_string, "Browser version number"),
        "Operating System": (ua.os.family, "Operating system name"),
        "OS Version": (ua.os.version_string, "Operating system version"),
        "Device Type": (ua.device.family, "Device category (e.g., PC, iPhone, Android)"),
        "Is Mobile": (ua.is_mobile, "True if a mobile device was detected"),
        "Is Tablet": (ua.is_tablet, "True if a tablet was detected"),
        "Is PC": (ua.is_pc, "True if a desktop/laptop device was detected"),
        "Language": (request.headers.get("Accept-Language", "Unknown"), "Preferred language(s) sent by the browser"),
        "Cookies": (dict(request.cookies), "Cookies sent with this request"),
        "Headers": (dict(request.headers), "All HTTP headers included in this request"),
    }

    html = """
    <html>
    <head>
        <meta charset="utf-8">
        <title>Client Information</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f7f7f7; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; background: white; }
            td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
            th { background: #eee; text-align: left; }
            tr:nth-child(even) { background: #f9f9f9; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
    </head>
    <body>
        <h1>Client Information</h1>
        <table>
            <tr>
                <th style="white-space: nowrap;">Field</th>
                <th>Value</th>
                <th style="white-space: nowrap;">Description</th>
            </tr>
            {% for key, (value, desc) in info.items() %}
            <tr>
                <td style="white-space: nowrap;"><b>{{ key }}</b></td>
                <td><pre>{{ value }}</pre></td>
                <td style="white-space: nowrap;">{{ desc }}</td>
            </tr>
            {% endfor %}
        </table>
    </body>
    </html>
    """

    return render_template_string(html, info=info)


#############
#
# common admin 
#
@app.route('/common_admin', methods=['GET'])
@app.route('/common_admin_user', methods=['GET'])
def common_admin_user():

    service = request.args.get('service')
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return "service not found"

    uid, google_id, user_info = get_user_info_from_session(service)
    if user_info is None:
        return redirect(url_for('googleLogin', service=service))

    r_username = get_username_from_session(user_info)

    if not api_is_user_admin(user_info["user_type"]):
        return "No enough privilege"

    user_id = user_info["id"]

    session['service'] = service

    return render_template(
        'common_admin_user.html',
        r_service=service,
        r_mail=google_id,
        r_user_id=user_id,
        r_user_type_admin=True,
        r_active_page='user',
        r_username=r_username
    )


@app.route('/common_admin_load_user', methods=['POST'])
def common_admin_load_user():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if user_info is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": "not enough privilege"})

    user_id = user_info["id"]

    data = request.get_json()
    filter_name   = data.get("filter_name",   "")
    filter_email  = data.get("filter_email",  "")
    filter_status = data.get("filter_status", "")

    response = api_google_auth_filter_common_user_info_list(filter_name, filter_email, filter_status)
    check_api_response_error(response, 'api_google_auth_filter_common_user_info_list')

    return jsonify(response)


@app.route('/common_admin_modify_user', methods=['POST'])
def common_admin_modify_user():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid_session, google_id, user_info = get_user_info_from_session(service)
    if uid_session is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": "not enough privilege"})

    data = request.get_json()
    #app.logger.warning(f"modify user post: {json.dumps(data, ensure_ascii=False)}")

    response = api_google_user_modify(AUTH_TYPE_COMMON, data)
    check_api_response_error(response, 'api_google_user_modify')

    return response


@app.route('/common_admin_change_user_status', methods=['POST'])
def common_admin_change_user_status():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid_session, google_id, user_info = get_user_info_from_session(service)
    if uid_session is None:
        return jsonify({"error": "not logging in "})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({"error": "not enough privilege"})

    data   = request.get_json()
    uid    = data.get('uid')
    action = data.get('action')

    target_status = ""
    mail_template = ""
    if action == 'delete':
        target_status = STATUS_DELETED_TO_GO
    elif action == 'reset_expired':
        target_status = STATUS_EXPIRED_RESET
        mail_template = MAIL_TEMPLATE_AUTH
    elif action == 'accept':
        target_status = STATUS_PASSED
        mail_template = MAIL_TEMPLATE_ACCEPT
    elif action == 'reject':
        target_status = STATUS_REJECTED
        mail_template = MAIL_TEMPLATE_REJECT
    elif action == 'block':
        target_status = STATUS_BLOCKED
        mail_template = MAIL_TEMPLATE_BLOCK
    elif action == 're_accept':
        target_status = STATUS_PASSED
        mail_template = MAIL_TEMPLATE_RESTORE
    else:
        return jsonify({"error": "unknown action"})

    ret = api_google_auth_change_account_status(AUTH_TYPE_COMMON, uid, target_status)

    if ret is not None:
        return jsonify({"error": ret}), 500

    url_base_auth   = url_for("googleSignupAuthenticate", _external=True)
    url_base_server = url_for("index", _external=True)
    auth_type       = AUTH_TYPE_COMMON

    response = {'suceed': 'done'}

    if mail_template:
        url_base = url_base_auth if action == 'reset_expired' else url_base_server
        mail_resp = sendmail( url_base, auth_type, mail_template, None, uid, MAIL_TARGET_BY_UID );
        if mail_resp["status"] == "error":
            response["email"] = mail_resp["error"]
            app.logger.warning(
                "Error occured when sending mail(%s) to UID:[%s] MSG[%s]", 
                mail_template, uid , mail_resp["error"]
            )

    return jsonify(response)


@app.route('/common_admin_authentication', methods=['GET'])
def common_admin_authentication():

    service = request.args.get('service')
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return "service not found"

    uid, google_id, user_info = get_user_info_from_session(service)

    if uid is None:
        return redirect(url_for('googleLogin', service=service))
    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('index', _external=True))

    r_username = get_username_from_session(user_info)

    session['service'] = service

    return render_template(
        'common_admin_authentication.html',
        r_service=service,
        r_mail=google_id,
        r_user_id=user_info["id"],
        r_user_type_admin=True,
        r_active_page='authentication',
        r_username=r_username
    )


@app.route('/common_admin_load_authentication_log', methods=['GET','POST'])
def common_admin_load_authentication_log():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    data = request.get_json()
    name     = data.get('filter_name')
    fromdate = data.get('filter_fromdate')
    todate   = data.get('filter_todate')
    results  = data.get('filter_results')

    response = api_google_auth_load_authlog(AUTH_TYPE_COMMON,name,fromdate,todate,results )
    check_api_response_error(response, 'api_google_auth_load_authlog')

    return json.dumps(response, ensure_ascii=False, default=str)


@app.route('/common_admin_mail', methods=['GET'])
def common_admin_mail():

    service = request.args.get('service')
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return "service not found"

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return redirect(url_for('googleLogin', service=service))
    if not api_is_user_admin(user_info["user_type"]):
        return render_template(
            'panelsearch_error.html',
            r_error_type="error",
            r_error_message='not enough privilege to access this page',
            r_next_page=url_for('index', _external=True)
        )

    session['service'] = service

    email_templates = get_all_email_template()
    email_settings  = get_mail_settings()

    r_username = get_username_from_session(user_info)

    return render_template(
        'common_admin_mail.html',
        r_service=service,
        r_mail=google_id,
        r_email_templates=email_templates,
        r_email_settings=email_settings,
        r_user_id=user_info["id"],
        r_user_type_admin=True,
        r_active_page='mail',
        r_is_sidebar_collapsed=False,
        r_username=r_username
    )


@app.route('/common_admin_load_email', methods=['GET'])
def common_admin_load_email():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return  jsonify({'error': "session not opened"})
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"})

    filter_to       = request.args.get('filter_to')
    filter_fromdate = request.args.get('filter_fromdate')
    filter_todate   = request.args.get('filter_todate')
    filter_auth_type= request.args.get('filter_auth_type')
    filter_status   = request.args.get('filter_status')
    filter_template_name = request.args.get('filter_type')

    response = api_psn_admin_load_email(
        filter_to,
        filter_fromdate,
        filter_todate,
        filter_auth_type,
        filter_status,
        filter_template_name
    )
    check_api_response_error(response, 'api_psn_admin_load_email')

    return jsonify(response)


@app.route('/common_admin_load_email_detail/<int:email_id>', methods=['GET'])
def common_admin_load_email_detail(email_id):

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 400
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 400

    response = api_psn_admin_load_email_detail(email_id)
    check_api_response_error(response, 'api_psn_admin_load_email_detail')

    return jsonify(response)


@app.route('/common_admin_resend_email/<int:email_id>', methods=['POST'])
def common_admin_resend_email(email_id):

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return  jsonify({'error': "session not opened"}), 500
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'error': "user donot have enough privilidge"}), 500

    response = api_psn_admin_resend_email(email_id)
    check_api_response_error(response, 'api_psn_admin_resend_email')

    return jsonify(response)


@app.route('/common_admin_modify_email_template', methods=['POST'])
def common_admin_modify_email_template():

    service = session['service']
    if service not in {
        SERVICE_DISEASESEARCH,
        SERVICE_CASESHAREING,
        SERVICE_PANELSEARCH
    }:
        return jsonify({"error": "service not found"})

    uid, google_id, user_info = get_user_info_from_session(service)
    if uid is None:
        return jsonify({'status':'error', 'message': "session not opened"}), 500
    if not api_is_user_admin(user_info["user_type"]):
        return jsonify({'status':'error', 'message': "user donot have enough privilidge"}), 500

    data = request.get_json()
    response = api_psn_admin_modify_email_template(data)
    check_api_response_error(response, 'api_psn_admin_modify_email_template')

    return jsonify(response)



@app.route('/psn_treeview', methods=['GET'])
def psn_treeview():

    return render_template('treeview.html')
