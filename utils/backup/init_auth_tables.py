import os
from sqlalchemy import (
    create_engine, 
    MetaData, 
    Table, 
    Column,
    Integer, 
    BigInteger, 
    String, 
    Boolean, 
    TIMESTAMP, 
    Text, 
    text,
    Enum, 
    insert,
    select,
)
from sqlalchemy.exc import SQLAlchemyError

# =================================================
# Engine（MySQL）
# =================================================

# DB設定（環境変数から取得）
db_host = os.getenv('MYSQL_HOST', 'mysql')
db_port = os.getenv('MYSQL_INTERNAL_PORT', '3306')
db_name = os.getenv('MYSQL_DATABASE')
db_user = os.getenv('MYSQL_USER')
db_password = os.getenv('MYSQL_PASSWORD')

required_vars = {
    "MYSQL_DATABASE": db_name,
    "MYSQL_USER": db_user,
    "MYSQL_PASSWORD": db_password,
}

missing = [k for k, v in required_vars.items() if not v]
if missing:
    raise RuntimeError(f"Missing environment variables: {', '.join(missing)}")

engine = create_engine(
    f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4",
    pool_pre_ping=True,
)

metadata = MetaData()

# =========================
# ENUM 定義
# =========================
auth_result_enum = Enum("success", "fail", name="auth_result_enum")
auth_action_enum = Enum("login", "logout", name="auth_action_enum")
email_status_enum = Enum("pending", "sent", "failed", name="email_status_enum")

# =================================================
# user_type 表
# =================================================
user_type = Table(
    "user_type",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=False),
    Column("name", String(50), nullable=False, unique=True),
    Column("description", String(255)),
)

# =================================================
# user_status 表
# =================================================
user_status = Table(
    "user_status",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(50), nullable=False, unique=True),
    Column("status_group", String(50), nullable=False),
    Column("group_label", String(50), nullable=False),
)



# =================================================
# user_info_psn 表
# =================================================
user_info_psn = Table(
    "user_info_psn",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("uid", String(20), nullable=False),
    Column("authentication_code", String(50), nullable=False),
    Column("google_id", String(50), nullable=False, unique=True),
    Column("first_name_en", String(40), nullable=False, server_default=""),
    Column("first_name_nl", String(40), nullable=False, server_default=""),
    Column("last_name_en", String(40), nullable=False, server_default=""),
    Column("last_name_nl", String(40), nullable=False, server_default=""),
    Column("affiliation", String(256), nullable=False, server_default=""),
    Column("email", String(50), nullable=False),
    Column("job_title", String(256), nullable=False, server_default=""),
    Column("user_type", Integer, nullable=False, server_default="1"),
    Column("status", Integer, nullable=False, server_default="40"),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    Column("changed_at", TIMESTAMP, nullable=True),
    Column("is_updated", Integer, nullable=False, server_default="0"),
    mysql_charset="utf8mb4",
    mysql_collate="utf8mb4_unicode_ci",
)

# =================================================
# user_authentication_log_pcf 表
# =================================================
user_authentication_log_pcf = Table(
    "user_authentication_log_pcf",
    metadata,
    Column("id", BigInteger, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("user_agent", Text, nullable=True),
    Column("result", auth_result_enum, nullable=False, server_default="success"),
    Column("action", auth_action_enum, nullable=False, server_default="login"),
    Column("reason", Text, nullable=True),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    mysql_charset="utf8mb4",
    mysql_collate="utf8mb4_unicode_ci",
)

# =================================================
# user_authentication_log_psn 表
# =================================================
user_authentication_log_psn = Table(
    "user_authentication_log_psn",
    metadata,
    Column("id", BigInteger, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("user_agent", Text, nullable=True),
    Column("result", auth_result_enum, nullable=False, server_default="success"),
    Column("action", auth_action_enum, nullable=False, server_default="login"),
    Column("reason", Text, nullable=True),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    mysql_charset="utf8mb4",
    mysql_collate="utf8mb4_unicode_ci",
)


# =================================================
# email_smtp_setting
# =================================================
email_smtp_setting = Table(
    "email_smtp_setting",
    metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("provider",String(100),nullable=False),
    Column("smtp_server",String(255),nullable=False),
    Column("smtp_port",Integer,nullable=False,server_default="587"),
    Column("use_tls",Boolean,nullable=False,server_default=text("0")),
    Column("use_ssl",Boolean,nullable=False,server_default=text("1")),
    Column("username",String(255),nullable=False),
    Column("password",String(255),nullable=False),
    Column("from_name",String(255),nullable=False),
    Column("from_email", String(255), nullable=False),
    Column("active",Boolean,nullable=False,server_default=text("1")),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    Column("updated_at", TIMESTAMP, nullable=True),
    mysql_charset="utf8mb4",
    mysql_collate="utf8mb4_unicode_ci",
)

# =================================================
# email_templates 表
# =================================================
email_templates = Table(
    "email_templates",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("auth_type",String(100),nullable=False),
    Column("template_name", String(100), nullable=False),
    Column("subject_template", Text, nullable=False),
    Column("body_template", Text, nullable=False),
    Column("is_active", Boolean, nullable=False, server_default=text("1")),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    mysql_charset="utf8mb4",
)

# =================================================
# email_queue 表
# =================================================
email_queue = Table(
    "email_queue",
    metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("auth_type",String(50, collation="utf8mb4_unicode_ci"),nullable=False),
    Column("template_id",Integer,nullable=False),
    Column("sender_user_id",Integer,nullable=True),
    Column("receiver_user_id",Integer,nullable=True),
    # ---- 注意：from / to 是 SQL 保留字 ----
    Column("from", String(300), nullable=False, key="from_"),
    Column("to", String(300), nullable=False, key="to_"),
    Column("subject", String(300), nullable=False),
    Column( "body", Text, nullable=True ),
    Column("status",email_status_enum,nullable=True,server_default="pending"),
    Column("error_msg", Text, nullable=True ),
    Column("created_at", TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    Column("sent_at", TIMESTAMP, nullable=True),
    mysql_charset="utf8mb4",
    mysql_collate="utf8mb4_unicode_ci",
)

# =================================================
# 初始化 user_type
# =================================================
initial_user_type = [
    {"id": 0, "name": "public user",   "description": "Guest user"},
    {"id": 1, "name": "reviewer",      "description": "User can input review for entity"},
    {"id": 2, "name": "curator",       "description": "User can modify entity definition"},
    {"id": 3, "name": "administrator", "description": "System administrator"},
    {"id": 4, "name": "researcher",    "description": "Reasearcher user"},
    {"id": 5, "name": "provider",      "description": "Provider user"},
]

stmt_user_type = (
    insert(user_type)
    .values(initial_user_type)
    .prefix_with("IGNORE")   # MySQL
)

# =================================================
# 初始化 user_status
# =================================================
initial_user_status = [
    {"id": 5,  "name": "status-deleted",            "status_group": "5,10",     "group_label": "削除"},
    {"id": 10, "name": "status-deleted_to_go",      "status_group": "5,10",     "group_label": "削除"},
    {"id": 12, "name": "status-blocked",            "status_group": "12,14",    "group_label": "停止"},
    {"id": 14, "name": "status-blocked_to_go",      "status_group": "12,14",    "group_label": "停止"},
    {"id": 15, "name": "status-rejected",           "status_group": "15,20",    "group_label": "拒否"},
    {"id": 20, "name": "status-rejected_to_go",     "status_group": "15,20",    "group_label": "拒否"},
    {"id": 25, "name": "status-cancelled",          "status_group": "25,30",    "group_label": "退会"},
    {"id": 30, "name": "status-cancelled_to_go",    "status_group": "25,20",    "group_label": "退会"},
    {"id": 35, "name": "status-expired",            "status_group": "35",       "group_label": "無効"},
    {"id": 40, "name": "status-registed",           "status_group": "40,45,50", "group_label": "承認"},
    {"id": 45, "name": "status-reset_expired_date", "status_group": "40,45,50", "group_label": "承認"},
    {"id": 50, "name": "status-authenticated",      "status_group": "40,45,50", "group_label": "承認"},
    {"id": 55, "name": "status-passed",             "status_group": "55,60",    "group_label": "承認"},
    {"id": 60, "name": "status-passed_to_go",       "status_group": "55,60",    "group_label": "承認"},
]

stmt_user_status = (
    insert(user_status)
    .values(initial_user_status)
    .prefix_with("IGNORE")   # MySQL
)
# =================================================
# 初始化 email_templates
# =================================================
initial_email_templates = [
    {
        "id": 1,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "auth_request",
        "subject_template": "Please verify your email address at PubCaseFinder Panelsearch(nanbyo)",
        "body_template": """Hello {name},

Welcome to our service!
To complete the registration process and verify your email address, please click on the following link:

{link}

Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.

If you did not sign up for our service, please ignore this email.

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 2,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "accept",
        "subject_template": "Finished registration to Pubcasefinder PanelSearch(nanbyo)!",
        "body_template": """Hello {name},

Thank you for signing up for our service.
Your registration was successfully completed. 
Please click on the following link to start your tour :

{server}

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 3,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "reject",
        "subject_template": "Failed registration to Pubcasefinder panelsearch(nanbyo)!",
        "body_template": """Hello {name},

Sorry to inform you that your registration was failed.

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 4,
        "auth_type": "pubcasefinder",
        "template_name": "auth_request",
        "subject_template": "Please verify your email address at PubCaseFinder",
        "body_template": """Hello {name},

Welcome to our service!
To complete the registration process and verify your email address, please click on the following link:

{link}

Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.

If you did not sign up for our service, please ignore this email.

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 5,
        "auth_type": "pubcasefinder",
        "template_name": "accept",
        "subject_template": "Finished registration to Pubcasefinder!",
        "body_template": """Hello {name},

Thank you for signing up for our service.
Your registration was successfully completed. 
Please click on the following link to start your tour :

{server}

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 6,
        "auth_type": "pubcasefinder",
        "template_name": "reject",
        "subject_template": "Failed registration to Pubcasefinder!",
        "body_template": """Hello {name},

        Thank you for signing up for our service.
Sorry to inform you that your registration was failed.

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 7,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "fail",
        "subject_template": "Failed registration to Pubcasefinder panelsearch(nanbyo)!",
        "body_template": """Hello {name},

Thank you for signing up for our service.
Sorry to inform you that your registration was failed due to following reason:

------
{fail_reason}
------

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 8,
        "auth_type": "pubcasefinder",
        "template_name": "fail",
        "subject_template": "Failed registration to Pubcasefinder panelsearch(nanbyo)!",
        "body_template": """Hello {name},

Thank you for signing up for our service.
Sorry to inform you that your registration was failed due to following reason:

------
{fail_reason}
------

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 9,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "invite_to_group",
        "subject_template": "Please sign up and join this group!",
        "body_template": """Hello  {user_name},

Please join 「{group_title}」

Regist Pubcasefinder Panelsearch(nanbyo) at following:

{GOOGLE_FORM_URL}

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
    {
        "id": 10,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "block",
        "subject_template": "Your Account Has Been Blocked",
        "body_template": """Hello {name},

We would like to inform you that your account has been blocked and is no longer able to log in to Pubcasefinder(nanbyo).

Thank you for your understanding.

Kind regards,

PubCaseFinder(Nanbyo)
"""
    },
    {
        "id": 11,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "restore",
        "subject_template": "Your Account Has Been Restored",
        "body_template": """Hello {name},

We are pleased to inform you that your account has been restored and you can now log in to Pubcasefinder(nanbyo) again.

You may sign in using your existing account credentials.

Thank you for your patience and understanding.

Kind regards,

PubCaseFinder(Nanbyo)
"""
    },
    {
        "id": 12,
        "auth_type": "pubcasefinder",
        "template_name": "block",
        "subject_template": "Your Account Has Been Blocked",
        "body_template": """Hello {name},

We would like to inform you that your account has been blocked and is no longer able to log in to Pubcasefinder.

Thank you for your understanding.

Kind regards,

PubCaseFinder
"""
    },
    {
        "id": 13,
        "auth_type": "pubcasefinder",
        "template_name": "restore",
        "subject_template": "Your Account Has Been Restored",
        "body_template": """Hello {name},

We are pleased to inform you that your account has been restored and you can now log in to Pubcasefinder again.

You may sign in using your existing account credentials.

Thank you for your patience and understanding.

Kind regards,

PubCaseFinder
"""
    },
    {
        "id": 14,
        "auth_type": "panelsearch_nanbyo",
        "template_name": "cancel",
        "subject_template": "Your Account Has Been Closed",
        "body_template": """Hello {name},

This email confirms that your request to close your account has been completed.

Your account has been closed and you can no longer sign in to our website.

If you would like to use our service again, please wait 5 minutes before signing up for a new account.

Thank you for using Panelsearch(nanbyo). We appreciate your support and wish you all the best.

Best regards,
PubCaseFinder.dbcls.ac.jp
""" 
    },
    {
        "id": 15,
        "auth_type": "pubcasefinder",
        "template_name": "cancel",
        "subject_template": "Your Account Has Been Closed",
        "body_template": """Hello {name},

This email confirms that your request to close your account has been completed.

Your account has been closed and you can no longer sign in to our website.

If you would like to use our service again, please wait 5 minutes before signing up for a new account.

Thank you for using PubCaseFinder. We appreciate your support and wish you all the best.

Best regards,
PubCaseFinder.dbcls.ac.jp
"""
    },
]

stmt_email_templates = (
    insert(email_templates)
    .values(initial_email_templates)
    .prefix_with("IGNORE")   # MySQL
)

# =================================================
# 执行初始化（事务）
# =================================================
def main():
    metadata.create_all(engine)

    with engine.begin() as conn:
        conn.execute(stmt_user_type)
        conn.execute(stmt_user_status)
        conn.execute(stmt_email_templates)

        print("user_type:")
        for row in conn.execute(select(user_type)):
            print(row)

        print("user_status:")
        for row in conn.execute(select(user_status)):
            print(row)

        print("\nemail_templates:")
        for row in conn.execute(select(email_templates)):
            print(row)

# =================================================
# 15. 验证（可选）
# =================================================
if __name__ == "__main__":
    try:
        main()
        print("DB initialization completed.")
    except SQLAlchemyError as e:
        print("DB initialization failed:", e)
        raise
