#Archivo para generar la conexion a la base de datos
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

#Datos para conexion a base de datos
MYSQL_USER= "root"
MYSQL_PASSWORD="root"
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_DB="iot_cnc"

DB_CONNECTION=(f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}") #conexion a la base de datos

engine=create_engine(DB_CONNECTION)
SessionLocal =sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db= SessionLocal()
    try:
        yield db
    finally:
        db.close()