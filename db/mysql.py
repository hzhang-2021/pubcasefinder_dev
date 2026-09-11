# -*- coding: utf-8 -*-

from flask import Flask
import MySQLdb
import MySQLdb.cursors
from contextlib import contextmanager

app = Flask(__name__)
app.config.from_pyfile('../config.cfg')
db_host = app.config['DBHOST']
db_port = app.config['DBPORT']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']

def init_mysql(app):
    # do nothing
    dummy = 1


@contextmanager
def get_mysql_connection():
    conn = MySQLdb.connect(
        host=db_host,
        port=db_port,
        db=db_name,
        user=db_user,
        passwd=db_pw,
        charset="utf8mb4",
        use_unicode=True,
        autocommit=False
    )
    try:
        yield conn
    finally:
        conn.close()


def fetch_all(sql, params=None, *, dict_cursor=True):
    params = params or ()
    cursor_cls = MySQLdb.cursors.DictCursor if dict_cursor else None
    try:
        with get_mysql_connection() as conn:
            with conn.cursor(cursor_cls) as cursor:
                cursor.execute(sql, params)
                return list(cursor.fetchall())
    except MySQLdb.IntegrityError as e:
        return {'error': str(e)}
    except Exception as e:
        return {'error': str(e)}


def fetch_one(sql, params=None, *, dict_cursor=True):
    params = params or ()
    cursor_cls = MySQLdb.cursors.DictCursor if dict_cursor else None
    try:
        with get_mysql_connection() as conn:
            with conn.cursor(cursor_cls) as cursor:
                cursor.execute(sql, params)
                return cursor.fetchone()
    except MySQLdb.IntegrityError as e:
        return {'error': str(e)}
    except Exception as e:
        return {'error': str(e)}


def execute_sql(sql, params=None, *, dict_cursor=False, many=False):
    cursor_class = (
        MySQLdb.cursors.DictCursor
        if dict_cursor
        else None
    )
    
    with get_mysql_connection() as conn:
        try:
            with conn.cursor(cursor_class) as cur:
                if many:
                    cur.executemany(sql, params)
                else:
                    cur.execute(sql, params)
                conn.commit()
                return {
                    "rowcount": cur.rowcount,
                    "lastrowid": cur.lastrowid
                }
        except MySQLdb.IntegrityError as e:
            conn.rollback()
            return {'error': str(e)}
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}
