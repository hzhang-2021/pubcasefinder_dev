from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


# DB設定（環境変数から取得）
db_host = os.getenv('MYSQL_HOST', 'mysql')
db_port = os.getenv('MYSQL_INTERNAL_PORT', '3306')
db_name = os.getenv('MYSQL_DATABASE')
db_user = os.getenv('MYSQL_USER')
db_password = os.getenv('MYSQL_PASSWORD')

# TCP接続でMySQLに接続
# engine = create_engine(f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")
# engine = create_engine(
#     f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
#     "?charset=utf8mb4&use_unicode=1",
#     pool_pre_ping=True,
# )

engine = create_engine(
    f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4",
    pool_pre_ping=True,
)

Session = sessionmaker(engine)
