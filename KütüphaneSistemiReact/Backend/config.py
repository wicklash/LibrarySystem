# MSSQL veritabanı bağlantı ayarları
DATABASE_CONFIG = {
    "server": "DESKTOP-ECJJPMC\\SQLEXPRESS",                # SQL Server adı
    "database": "LibraryManagement",             # Veritabanı adı
    "username": "",                             # Kullanıcı adı (gerekirse ekleyin)
    "password": "",                             # Şifre (gerekirse ekleyin)
    "driver": "ODBC Driver 17 for SQL Server"    # ODBC sürücüsü
}

# SQLAlchemy bağlantı stringi (Kullanıcı adı/şifre ile bağlantı için)
SQLALCHEMY_DATABASE_URL = (
    f"mssql+pyodbc://{DATABASE_CONFIG['username']}:{DATABASE_CONFIG['password']}"
    f"@{DATABASE_CONFIG['server']}/{DATABASE_CONFIG['database']}?driver={DATABASE_CONFIG['driver'].replace(' ', '+')}"
)

# SQLAlchemy bağlantı stringi (Windows kimlik doğrulaması ile bağlantı için)
SQLALCHEMY_DATABASE_URL_TRUSTED = (
    f"mssql+pyodbc://@{DATABASE_CONFIG['server']}/{DATABASE_CONFIG['database']}?driver={DATABASE_CONFIG['driver'].replace(' ', '+')}&trusted_connection=yes"
)
