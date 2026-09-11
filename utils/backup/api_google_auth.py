# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import MySQLdb
import MySQLdb.cursors
from db.mysql import get_mysql_connection
from db.mysql import fetch_all
from db.mysql import fetch_one
from db.mysql import execute_sql
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from urllib.parse import quote


app = Flask(__name__)
app.config.from_pyfile('../config.cfg')


MAIL_SMTP_SERVER = app.config['MAIL_SMTP_SERVER']
MAIL_SMTP_PORT   = app.config['MAIL_SMTP_PORT']
MAIL_FROM_NAME   = app.config['MAIL_FROM_NAME']
MAIL_FROM_EMAIL  = app.config['MAIL_FROM_EMAIL']
MAIL_USERNAME    = app.config['MAIL_USERNAME']
MAIL_PASSWORD    = app.config['MAIL_PASSWORD']

MAIL_PORT_TLS = 587
MAIL_PORT_SSL = 465

STATUS_DELETED         = 5
STATUS_DELETED_TO_GO   = 10
STATUS_BLOCKED         = 12
STATUS_BLOCKED_TO_GO   = 14
STATUS_REJECTED        = 15
STATUS_REJECTED_TO_GO  = 20
STATUS_CANCELLED       = 25
STATUS_CANCELLED_TO_GO = 30
STATUS_EXPIRED         = 35
STATUS_REGISTED        = 40
STATUS_EXPIRED_RESET   = 45
STATUS_AUTHENTICATED   = 50
STATUS_PASSED          = 55
STATUS_PASSED_TO_GO    = 60

USER_INFO_NOT_CHANGED = '0'
USER_INFO_CHANGED     = '1'

USER_TYPE_PROVIDER    = 5
USER_TYPE_RESEARCHER  = 4
USER_TYPE_ADMIN       = 3
USER_TYPE_CURATOR     = 2
USER_TYPE_REVIEWER    = 1
USER_TYPE_PUBLIC      = 0

USER_TYPE_DEFAULT     = USER_TYPE_PUBLIC

MAIL_TEMPLATE_AUTH   = "auth_request"
MAIL_TEMPLATE_ACCEPT = "accept"
MAIL_TEMPLATE_REJECT = "reject"
MAIL_TEMPLATE_FAIL   = "fail"
MAIL_TEMPLATE_GROUP_INVITE = "invite_to_group"
MAIL_TEMPLATE_BLOCK  = "block"
MAIL_TEMPLATE_RESTORE= "restore"
MAIL_TEMPLATE_CANCEL = "cancel"

MAIL_TARGET_BY_ID    = "id"
MAIL_TARGET_BY_UID   = "uid"

AUTH_TYPE_COMMON = "pubcasefinder"
AUTH_TYPE_PSN    = "panelsearch_nanbyo"

AUTH_LOG_RESULT_SUCCESS = "success"
AUTH_LOG_RESULT_FAIL    = "fail"
AUTH_LOG_ACTION_LOGIN   = "login"
AUTH_LOG_ACTION_LOGOUT  = "logout"


COLUMNS = {
    AUTH_TYPE_COMMON:[
        'uid',
        'google_id',
        'first_name_en',
        'first_name_nl',
        'last_name_en',
        'last_name_nl',
        'affiliation_en',
        'affiliation_nl',
        'email',
        'job_title_en',
        'job_title_nl',
        'user_type'
    ],
    AUTH_TYPE_PSN:   [
        'uid',
        'google_id',
        'first_name_en',
        'first_name_nl',
        'last_name_en',
        'last_name_nl',
        'affiliation',
        'job_title',
        'email',
        'user_type'
    ]
} 


def api_is_user_admin(user_type):
    return str(user_type) == str(USER_TYPE_ADMIN)


def api_google_auth_create_new_account(auth_type, random_string, dic_data):

    columns_all = COLUMNS[auth_type]
    columns = []
    values  = []
    for col in columns_all:
        if col in dic_data:
            columns.append(col)
            val = dic_data.get(col)
            values.append(val)

    columns.append("authentication_code")
    values.append(random_string)

    uid = dic_data.get("uid")
    google_id = dic_data.get("google_id")

    columns.extend(['user_type','status','created_at','changed_at','is_updated'])
    values.extend([USER_TYPE_DEFAULT,STATUS_REGISTED,datetime.now(),None,0])

    colnames = ", ".join(columns)

    placeholders = ", ".join(["%s"] * len(values))

    d_key = "google_id"

    update_clause = ", ".join([f"{col}=VALUES({col})" for col in columns if col != d_key])
    
    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    sql = f"""
        INSERT INTO {target_table} ({colnames}) 
        VALUES ({placeholders})
        ON DUPLICATE KEY UPDATE {update_clause}
    """

    with get_mysql_connection() as OBJ_MYSQL:
        try:
            with OBJ_MYSQL.cursor() as cur:
                cur.execute(sql, values)
                OBJ_MYSQL.commit()
                return {
                    "status": "success", 
                    "authentication_code": random_string, 
                    "uid": uid, 
                    "auth_type": auth_type
                }
        except MySQLdb.IntegrityError as e:
            OBJ_MYSQL.rollback()
            return {"status": "error", "message": f'Error: {str(e)}'}
        except Exception as e:
            OBJ_MYSQL.rollback()
            return {"status": "error", "message": f'Error: {str(e)}'}


def api_google_auth_get_account_auth_status(auth_type, uid, authentication_code):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    account_status = "NONE"

    with get_mysql_connection() as OBJ_MYSQL:
        with OBJ_MYSQL.cursor() as cursor_user_auth:

            sql_user_auth = f"SELECT status FROM {target_table} WHERE uid = %s AND authentication_code= %s"

            cursor_user_auth.execute(sql_user_auth, (uid, authentication_code))

            values_user_auth = cursor_user_auth.fetchall()

            if cursor_user_auth.rowcount > 0:
                account_status = values_user_auth[0][0]

    return account_status


def api_google_auth_get_authentication_code(auth_type, uid):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    authentication_code = None

    with get_mysql_connection() as OBJ_MYSQL:
        with OBJ_MYSQL.cursor() as cursor_user_auth:
            sql_user_auth = f"SELECT authentication_code FROM {target_table} WHERE uid = %s"
            cursor_user_auth.execute(sql_user_auth, (uid,))
            values_user_auth = cursor_user_auth.fetchall()
            if cursor_user_auth.rowcount > 0:
                authentication_code = values_user_auth[0][0]

    return authentication_code


def api_google_auth_authenticate(auth_type, uid, authentication_code):
  
    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account" 

    with get_mysql_connection() as OBJ_MYSQL:
        try:
            with OBJ_MYSQL.cursor() as cur: 
                sql = f"""
                    UPDATE {target_table} 
                    SET status=%s,changed_at=NOW() 
                    WHERE uid=%s AND authentication_code=%s
                """
                cur.execute(sql, (STATUS_AUTHENTICATED, uid, authentication_code))
                OBJ_MYSQL.commit()
            return None
        except MySQLdb.IntegrityError as e:
            OBJ_MYSQL.rollback()
            return f'Error: {str(e)}'
        
        except Exception as e:
            OBJ_MYSQL.rollback()
            return f'Error: {str(e)}'


def api_google_auth_check_account_auth_status(auth_type, authentication_uid_list_str):

    if authentication_uid_list_str is None or len(authentication_uid_list_str) == 0:
        return ''
    
    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    uid_arr = [item.strip() for item in authentication_uid_list_str.split(',')]

    uid_placeholders = ','.join(['%s'] * len(uid_arr))

    if auth_type == AUTH_TYPE_COMMON:
        status_sql = "status IN (%s, %s, %s)"
        status_params = [STATUS_AUTHENTICATED, STATUS_PASSED, STATUS_PASSED_TO_GO]
    else:
        status_sql = "status = %s"
        status_params = [STATUS_AUTHENTICATED]

    sql = f"""
    SELECT uid
    FROM {target_table}
    WHERE uid IN ({uid_placeholders})
    AND {status_sql}
    """

    params = uid_arr + status_params

    with get_mysql_connection() as OBJ_MYSQL:
        with OBJ_MYSQL.cursor() as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()

    return ','.join(row[0] for row in rows)


def api_google_auth_get_account_by_status(auth_type, status):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    sql = f"SELECT uid FROM {target_table} WHERE status = %s"

    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, (status,))
            return ','.join(row[0] for row in cursor)


def api_google_auth_change_account_status(auth_type, uid_list_str, status):

    if not uid_list_str:
        return None
    
    uid_arr = [item.strip() for item in uid_list_str.split(',') if item.strip()]
    if not uid_arr:
        return None

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    uid_placeholders = ','.join(['%s'] * len(uid_arr))

    sql = f"""
        UPDATE {target_table}
        SET status = %s,
            changed_at = NOW()
        WHERE uid IN ({uid_placeholders})
    """

    params = [status] + uid_arr

    # if EXPIRED，only update those are not AUTHENTICATED”
    if status == STATUS_EXPIRED:
        sql += " AND status != %s"
        params.append(STATUS_AUTHENTICATED)

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(sql, params)
            conn.commit()
            return None
        except Exception as e:
            conn.rollback()
            return f"Error: {e}"
        

def api_google_auth_get_user_info_by_google_account(auth_type, google_id):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    sql = f"SELECT * FROM {target_table} WHERE google_id = %s"

    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute(sql, (google_id,))
            return cursor.fetchone()


def api_google_auth_get_user_info_by_user_id(auth_type, user_id):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    sql = f"SELECT * FROM {target_table} WHERE id=%s"

    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute(sql, (user_id,))
            return cursor.fetchone()


def api_google_user_modify(auth_type, dic_data):
    if auth_type not in COLUMNS:
        return {'error': 'invalid auth_type'}

    google_id = dic_data.get("google_id")
    if not google_id:
        return {'error': 'google_id is required'}

    columns_all = COLUMNS[auth_type]

    columns = []
    values = []

    for col in columns_all:
        if col in dic_data and col not in ("uid", "google_id"):
            columns.append(col)
            values.append(dic_data[col])

    if not columns:
        return {'error': 'no fields to update'}

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"
    set_clause = ", ".join(f"{col} = %s" for col in columns)

    sql = f"""
        UPDATE {target_table}
        SET {set_clause}
        WHERE google_id = %s
    """

    values.append(google_id)

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(sql, values)
            conn.commit()
            return {'suceed': 'done'}
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}


def api_google_auth_get_user_type_hash():
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name FROM user_type")
            return {id_: name for id_, name in cursor.fetchall()}


def api_google_auth_get_user_status_list():
    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM user_status")
            return cursor.fetchall()


def api_google_auth_get_user_info_list(auth_type, status_list):
    if not status_list:
        return []

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"
    placeholders = ','.join(['%s'] * len(status_list))

    sql = f"""
        SELECT *
        FROM {target_table}
        WHERE status IN ({placeholders})
    """

    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute(sql, status_list)
            return cursor.fetchall()


def api_google_auth_filter_psn_user_info_list(filter_name, filter_email, filter_group, filter_status):

    sql_parts = [
        "SELECT DISTINCT A.*",
        "FROM user_info_psn AS A"
    ]

    where_clauses = ["A.status NOT IN (%s, %s)"]
    params = [STATUS_DELETED, STATUS_DELETED_TO_GO]

    # group filter
    if filter_group:
        group_list = [g.strip() for g in filter_group.split(',') if g.strip()]
        if group_list:
            placeholders = ','.join(['%s'] * len(group_list))
            sql_parts.append(
                "JOIN panelsearch_nando_group_user AS B ON A.id = B.user_id"
            )
            where_clauses.append(f"B.group_id IN ({placeholders})")
            params.extend(group_list)

    # status filter
    if filter_status:
        status_list = [s.strip() for s in filter_status.split(',') if s.strip()]
        if status_list:
            placeholders = ','.join(['%s'] * len(status_list))
            where_clauses.append(f"A.status IN ({placeholders})")
            params.extend(status_list)

    # name / email filter
    if filter_email and filter_name:
        where_clauses.append("""
            (
                A.email LIKE %s OR
                A.first_name_nl LIKE %s OR
                A.last_name_nl LIKE %s OR
                LOWER(CONCAT(A.last_name_nl, A.first_name_nl)) LIKE %s
            )
        """)
        pattern_email = f"%{filter_email}%"
        pattern_name  = f"%{filter_name.lower()}%"
        params.extend([pattern_email, pattern_name, pattern_name, pattern_name])

    elif filter_email:
        where_clauses.append("A.email LIKE %s")
        params.append(f"%{filter_email}%")

    elif filter_name:
        where_clauses.append("""
            (
                A.first_name_nl LIKE %s OR
                A.last_name_nl LIKE %s OR
                LOWER(CONCAT(A.last_name_nl, A.first_name_nl)) LIKE LOWER(%s)
            )
        """)
        pattern = f"%{filter_name}%"
        params.extend([pattern, pattern, pattern])

    sql = "\n".join(sql_parts)
    if where_clauses:
        sql += "\nWHERE " + " AND ".join(where_clauses)

    return fetch_all(sql, params, dict_cursor=True)


def api_google_auth_filter_common_user_info_list(filter_name, filter_email, filter_status):

    sql_parts = [
        "SELECT DISTINCT A.*, B.name as user_type_name",
        "FROM user_account AS A JOIN user_type AS B ON A.user_type=B.id"
    ]

    where_clauses = ["A.status NOT IN (%s, %s)"]
    params = [STATUS_DELETED, STATUS_DELETED_TO_GO]

    if filter_status:
        status_list = [s.strip() for s in filter_status.split(',') if s.strip()]
        if status_list:
            placeholders = ','.join(['%s'] * len(status_list))
            where_clauses.append(f"A.status IN ({placeholders})")
            params.extend(status_list)

    if filter_email and filter_name:
        where_clauses.append("""
            (
                A.email LIKE %s OR
                A.first_name_en LIKE %s OR
                A.last_name_en LIKE %s OR
                LOWER(CONCAT(A.last_name_en, A.first_name_en)) LIKE %s
            )
        """)
        pattern_email = f"%{filter_email}%"
        pattern_name  = f"%{filter_name.lower()}%"
        params.extend([pattern_email, pattern_name, pattern_name, pattern_name])

    elif filter_email:
        where_clauses.append("A.email LIKE %s")
        params.append(f"%{filter_email}%")

    elif filter_name:
        where_clauses.append("""
            (
                A.first_name_nl LIKE %s OR
                A.last_name_nl LIKE %s OR
                LOWER(CONCAT(A.last_name_nl, A.first_name_nl)) LIKE LOWER(%s)
            )
        """)
        pattern = f"%{filter_name}%"
        params.extend([pattern, pattern, pattern])

    sql = "\n".join(sql_parts)
    if where_clauses:
        sql += "\nWHERE " + " AND ".join(where_clauses)

    return fetch_all(sql, params, dict_cursor=True)


###
#
# email
#
###

def get_template(dic_cursor, auth_type, template_name):
    sql = """
        SELECT id, subject_template, body_template
        FROM email_templates
        WHERE auth_type = %s AND template_name = %s
        LIMIT 1
    """
    dic_cursor.execute(sql, (auth_type, template_name))
    return dic_cursor.fetchone()


def api_psn_get_group_invite_email_template():
    try:    
        with get_mysql_connection() as conn:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
                template = get_template(cursor, AUTH_TYPE_PSN, MAIL_TEMPLATE_GROUP_INVITE)
                if template:
                    return template
                else:
                    return {'subject_template': None, 'body_template': None}
    except Exception as e:
        return {'error': str(e), 'subject_template': None, 'body_template': None}


def api_psn_admin_modify_email_template(data):
    template_id = data.get('id')
    template_body = data.get('body_template')
    template_subject = data.get('subject_template')

    if not template_id:
        return {'status': 'error', 'message': 'template id is required'}

    with get_mysql_connection() as conn:
        try:
            with conn.cursor() as cur:
                sql = """
                    UPDATE email_templates
                    SET subject_template = %s,
                        body_template = %s
                    WHERE id = %s
                """
                cur.execute(sql, (template_subject, template_body, template_id))
            conn.commit()

            if cur.rowcount == 0:
                return {'status': 'error', 'message': 'template not found'}

            return {'status': 'succeed'}

        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'status': 'error', 'message': str(e)}
        except Exception as e:
            conn.rollback()
            return {'status': 'error', 'message': str(e)}
    

def get_all_email_template():
    with get_mysql_connection() as conn:
        with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM email_templates")
            return cursor.fetchall()


def get_user_mail_contents(dic_cursor, auth_type, id, target_id_or_uid):

    target_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    sql = f"""
    select 
        id,
        last_name_en,
        first_name_en,
        last_name_nl,
        first_name_nl,
        email,
        uid,
        authentication_code 
    from {target_table} 
    where {target_id_or_uid} = %s
    limit 1
    """
    dic_cursor.execute(sql, (id,))
    return dic_cursor.fetchone()


def get_mail_settings():

    mail_setting = {
        'smtp_server':  MAIL_SMTP_SERVER,
        'smtp_port':    MAIL_SMTP_PORT,
        'from_name':    MAIL_FROM_NAME,
        'from_email':   MAIL_FROM_EMAIL,
		'username':     MAIL_USERNAME,
        'password':     MAIL_PASSWORD
    }

    return mail_setting


def do_send_email_task(mail_from, mail_to, mail_subject, mail_body):
    mail_settings = get_mail_settings()

    try:
        msg = MIMEMultipart()
        msg["From"] = formataddr((None, mail_from))
        msg["To"] = mail_to if isinstance(mail_to, str) else ",".join(mail_to)
        msg["Subject"] = mail_subject
        msg.attach(MIMEText(mail_body, "plain", "utf-8"))

        smtp_user = mail_settings["username"]
        smtp_pass = mail_settings["password"]
        server_host = mail_settings["smtp_server"]
        server_port = mail_settings["smtp_port"]

        context = ssl.create_default_context()

        if server_port == MAIL_PORT_SSL:
            with smtplib.SMTP_SSL(server_host, server_port, context=context) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(server_host, server_port) as server:
                server.starttls(context=context)
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)

        return {'status': 'success'}

    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'type': e.__class__.__name__,
        }   

def sendmail(url_base, auth_type, template_name, user_id_sender, id_or_uid, target_id_or_uid):

    # ---------- 1️⃣ DB 阶段：只做数据库 ----------
    try:
        with get_mysql_connection() as conn:
            with conn.cursor(MySQLdb.cursors.DictCursor) as cursor:

                user_info = get_user_mail_contents(cursor, auth_type, id_or_uid, target_id_or_uid)
                if not user_info:
                    return {'status': 'error', 'message': 'user not found'}

                template = get_template(cursor, auth_type, template_name)
                if not template:
                    return {'status': 'error', 'message': 'template not found'}

                mail_settings = get_mail_settings()

                mail_from = f"{mail_settings['from_name']} <{mail_settings['from_email']}>"
                mail_to   = user_info['email']
                subject   = template['subject_template']

                name = (
                    f"{user_info['last_name_nl']} {user_info['first_name_nl']}"
                    if auth_type == AUTH_TYPE_PSN
                    else f"{user_info['last_name_en']} {user_info['first_name_en']}"
                )

                if template_name == MAIL_TEMPLATE_AUTH:
                    encoded = quote(user_info['authentication_code'], safe='')
                    link = f"{url_base}?auth_type={auth_type}&uid={user_info['uid']}&code={encoded}"
                    body = template['body_template'].format(name=name, link=link)
                elif template_name == MAIL_TEMPLATE_ACCEPT:
                    body = template['body_template'].format(name=name, server=url_base)
                else:
                    body = template['body_template'].format(name=name)

                cursor.execute("""
                    INSERT INTO email_queue
                    (auth_type, template_id, sender_user_id, receiver_user_id,
                     `from`, `to`, subject, body, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                """, (
                    auth_type,
                    template['id'],
                    user_id_sender,
                    user_info['id'],
                    mail_from,
                    mail_to,
                    subject,
                    body
                ))

                email_id = cursor.lastrowid
            conn.commit()

    except Exception as e:
        return {'status': 'error', 'error': str(e)}

    # ---------- 2️⃣ IO 阶段：发邮件（不占 DB 连接） ----------
    mail_response = do_send_email_task(mail_from, mail_to, subject, body)

    # ---------- 3️⃣ 结果回写 ----------
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                if mail_response["status"] == "success":
                    cursor.execute(
                        "UPDATE email_queue SET status='sent', sent_at=%s WHERE id=%s",
                        (datetime.now(), email_id)
                    )
                else:
                    cursor.execute(
                        "UPDATE email_queue SET status='failed', error_msg=%s, sent_at=%s WHERE id=%s",
                        (mail_response["error"], datetime.now(), email_id)
                    )
            conn.commit()

    except Exception:
        # 这里即使失败也不要影响发信结果
        pass

    return {'status': mail_response['status'], 'email_id': email_id}


def sendmail_registry_fail(auth_type, user_name, mail_to, fail_reason):

    # ---------- 1️⃣ 写 email_queue（事务 1） ----------
    try:
        with get_mysql_connection() as OBJ_MYSQL, \
             OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:

            mail_settings = get_mail_settings()
            mail_from = f"{mail_settings['from_name']} <{mail_settings['from_email']}>"

            template = get_template(cursor, auth_type, MAIL_TEMPLATE_FAIL)

            mail_subject = template["subject_template"]
            mail_body = template["body_template"].format(
                name=user_name,
                fail_reason=fail_reason
            )

            cursor.execute("""
                INSERT INTO email_queue
                    (auth_type, template_id, `from`, `to`, subject, body, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'pending')
            """, (
                auth_type,
                template["id"],
                mail_from,
                mail_to,
                mail_subject,
                mail_body
            ))

            email_id = cursor.lastrowid
            OBJ_MYSQL.commit()

    except Exception as e:
        return {'status': 'error', 'error': str(e)}

    # ---------- 2️⃣ 发邮件（无事务） ----------
    mail_response = do_send_email_task(
        mail_from,
        mail_to,
        mail_subject,
        mail_body
    )

    # ---------- 3️⃣ 更新发送结果（事务 2） ----------
    try:
        with get_mysql_connection() as OBJ_MYSQL, OBJ_MYSQL.cursor() as cursor:

            if mail_response["status"] == "success":
                cursor.execute("""
                    UPDATE email_queue
                    SET status='sent', sent_at=%s
                    WHERE id=%s
                """, (datetime.now(), email_id))

                retmsg = {'status': 'success', 'email_id': email_id}

            else:
                cursor.execute("""
                    UPDATE email_queue
                    SET status='failed', error_msg=%s, sent_at=%s
                    WHERE id=%s
                """, (mail_response["error"], datetime.now(), email_id))

                retmsg = {'status': 'error', 'error': mail_response["error"]}

            OBJ_MYSQL.commit()
            return retmsg

    except Exception as e:
        return {'status': 'error', 'error': str(e)}


def api_psn_admin_load_email(filter_to,filter_fromdate,filter_todate,auth_type,filter_status,filter_template_name):
    user_table = "user_info_psn" if auth_type == AUTH_TYPE_PSN else "user_account"

    name_cols = (
        "B.last_name_nl, B.first_name_nl"
        if auth_type == AUTH_TYPE_PSN
        else "B.first_name_en, B.last_name_en"
    )

    affiliation_col = (
        "B.affiliation"
        if auth_type == AUTH_TYPE_PSN
        else "B.affiliation_en"
    )

    sql = f"""
        SELECT
            A.id,
            A.auth_type,
            A.template_id,
            A.to,
            A.sent_at,
            A.status,
            CONCAT({name_cols}) AS name,
            {affiliation_col} AS affiliation
        FROM email_queue AS A
        JOIN {user_table} AS B ON A.receiver_user_id = B.id
        WHERE A.auth_type = %s
    """

    params = [auth_type]

    try:
        with get_mysql_connection() as OBJ_MYSQL, \
             OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:

            if filter_to:
                pattern = f"%{filter_to}%"
                sql += """
                    AND (
                        A.to LIKE %s
                        OR B.first_name_nl LIKE %s
                        OR B.last_name_nl LIKE %s
                        OR LOWER(CONCAT(B.last_name_nl, B.first_name_nl)) LIKE LOWER(%s)
                    )
                """
                params.extend([pattern, pattern, pattern, pattern])

            if filter_fromdate:
                sql += " AND A.sent_at >= %s"
                params.append(filter_fromdate)

            if filter_todate:
                sql += " AND A.sent_at <= %s"
                params.append(filter_todate)

            if filter_status:
                sql += " AND A.status = %s"
                params.append(filter_status)

            if filter_template_name:
                template = get_template(cursor, auth_type, filter_template_name)
                sql += " AND A.template_id = %s"
                params.append(template["id"])

            sql += " ORDER BY A.created_at DESC"

            cursor.execute(sql, params)
            return cursor.fetchall()

    except Exception as e:
        # 这里是否吞异常 / 上抛，看你项目整体风格
        return []


def api_psn_admin_load_email_detail(email_id):
    with get_mysql_connection() as OBJ_MYSQL:
        with OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:
            return _fetch_email_detail(cursor, email_id)


def _fetch_email_detail(cursor, email_id):
    sql = "select * from email_queue where id = %s"
    cursor.execute(sql, (email_id,))
    return cursor.fetchone()


def api_psn_admin_resend_email(email_id):

    # ---------- 1️⃣ 读取邮件内容（事务 1） ----------
    try:
        with get_mysql_connection() as OBJ_MYSQL, \
             OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:

            mail_info = _fetch_email_detail(cursor, email_id)
            if not mail_info:
                return {'status': 'error', 'message': 'email not found'}

            mail_from    = mail_info["from"]
            mail_to      = mail_info["to"]
            mail_subject = mail_info["subject"]
            mail_body    = mail_info["body"]

    except Exception as e:
        return {'status': 'error', 'message': str(e)}

    # ---------- 2️⃣ 发送邮件（无事务） ----------
    mail_response = do_send_email_task(
        mail_from,
        mail_to,
        mail_subject,
        mail_body
    )

    # ---------- 3️⃣ 回写发送结果（事务 2） ----------
    try:
        with get_mysql_connection() as OBJ_MYSQL, OBJ_MYSQL.cursor() as cursor:

            if mail_response["status"] == "success":
                cursor.execute("""
                    UPDATE email_queue
                    SET status='sent',
                        error_msg='',
                        sent_at=%s
                    WHERE id=%s
                """, (datetime.now(), email_id))

                retmsg = {'message': 'mail resend success'}

            else:
                cursor.execute("""
                    UPDATE email_queue
                    SET status='failed',
                        error_msg=%s,
                        sent_at=%s
                    WHERE id=%s
                """, (mail_response["error"], datetime.now(), email_id))

                retmsg = {
                    'message': 'mail resend failed: ' + mail_response["error"]
                }

            OBJ_MYSQL.commit()
            return retmsg

    except Exception as e:
        return {
            'status': 'error',
            'message': 'mail resend failed: ' + str(e)
        }


def api_google_auth_add_authlog(auth_type, user_id, user_agent, result, action, reason):

    target_table = "user_authentication_log_psn" if auth_type == AUTH_TYPE_PSN else "user_authentication_log_pcf"

    sql = f"INSERT INTO {target_table} (user_id, user_agent, result, action, reason) VALUES (%s,%s,%s,%s,%s)"

    try:
        with get_mysql_connection() as OBJ_MYSQL:
            with OBJ_MYSQL.cursor() as cur:
                cur.execute(sql, (user_id, user_agent, result, action, reason))
            OBJ_MYSQL.commit()
            return None
    except MySQLdb.IntegrityError as e:
        OBJ_MYSQL.rollback()
        return f'Error: {str(e)}'

    except Exception as e:
        OBJ_MYSQL.rollback()
        return f'Error: {str(e)}'
        

def api_google_auth_load_authlog(
    auth_type,
    name,
    fromdate,
    todate,
    results
):

    target_table = (
        "user_authentication_log_psn"
        if auth_type == AUTH_TYPE_PSN
        else "user_authentication_log_pcf"
    )

    user_table = (
        "user_info_psn"
        if auth_type == AUTH_TYPE_PSN
        else "user_account"
    )

    name_expr = (
        "CONCAT(B.last_name_nl, B.first_name_nl)"
        if auth_type == AUTH_TYPE_PSN
        else "CONCAT(B.first_name_en, ' ', B.last_name_en)"
    )

    sql = f"""
        SELECT
            A.id,
            A.created_at,
            {name_expr} AS user_name,
            B.google_id AS email,
            A.user_agent,
            A.result,
            A.action,
            A.reason
        FROM {target_table} AS A
        JOIN {user_table} AS B ON A.user_id = B.id
        WHERE 1=1
    """

    params = []

    if name:
        sql += f"""
            AND (
                {name_expr} LIKE %s
                OR B.google_id LIKE %s
            )
        """
        pattern = f"%{name}%"
        params.extend([pattern, pattern])

    if fromdate:
        sql += " AND A.created_at >= %s"
        params.append(fromdate)

    if todate:
        sql += " AND A.created_at <= %s"
        params.append(todate)

    if results:
        result_list = results.split(',')
        placeholders = ','.join(['%s'] * len(result_list))
        sql += f" AND A.result IN ({placeholders})"
        params.extend(result_list)

    #sql += " ORDER BY A.created_at DESC"

    with get_mysql_connection() as OBJ_MYSQL: 
        with OBJ_MYSQL.cursor(MySQLdb.cursors.DictCursor) as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()


def main():
    print(api_google_auth_load_authlog(AUTH_TYPE_PSN,"bbb","","","" ))
    print(api_psn_admin_load_email("","","","pubcasefinder","",""))
if __name__ == '__main__':
    main()


