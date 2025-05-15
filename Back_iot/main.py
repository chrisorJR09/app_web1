from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas 
from typing import List
from sqlalchemy import and_
from cors_config import configurar_cors

app =FastAPI()

configurar_cors(app)


def get_db():
    db=database.SessionLocal()
    try:
        yield db 
    finally:
        db.close()

@app.get("/")
async def root():
    return {
        "message": "Hola"
    }

@app.get("/test-db")
async def test_connection(db: Session=Depends(database.get_db)):
    return {"Status": "Conexion exitosa con la base de datos!"}


#------Endpoints-------
#---Endpoint para dar de alta una maquina
@app.post("/maquinas/", response_model=schemas.MaquinaRead)
def crear_maquina(maquina: schemas.MaquinaCreate, db: Session = Depends(get_db)):
    db_maquina=models.Maquina(**maquina.dict())
    db.add(db_maquina)
    db.commit()
    db.refresh(db_maquina)
    return db_maquina

#--Endpoint para consultar las maquinas disponibles
@app.get("/maquinas/", response_model=List[schemas.MaquinaRead])
async def listar_maquinas(db: Session = Depends(get_db)):
    return db.query(models.Maquina).all()


#---Endpoint que llenará la tabla de proyectos y actividades
@app.post("/proyectos/", response_model=schemas.ProyectoRead)
async def crear_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    consulta_id=db.query(models.Proyecto).filter(models.Proyecto.id==proyecto.id).first()
    if consulta_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="s0 ya se encuentra registrado")
    
    
    db_proyecto=models.Proyecto(**proyecto.dict())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    
    db_act=models.Actividad(
        proyecto_id=db_proyecto.id
    )
    db.add(db_act)
    db.commit()
    db.refresh(db_act)
    
    return db_proyecto


#endpoint para actualización de datos (fecha_paro,fecha_reanu, motivo, inicio, fin)
@app.patch("/actDatos/{proyecto_id}", response_model=schemas.ActividadRead)
async def actualiza_proyec(proyecto_id: str, proyecto: schemas.ActUpdate, db: Session= Depends(get_db)):
    db_actividad=db.query(models.Actividad).filter(models.Actividad.proyecto_id== proyecto_id).first() 
    if not db_actividad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    
    db_proyecto=db.query(models.Proyecto).filter(models.Proyecto.id== proyecto_id).first() 
    if not db_proyecto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    
    update_data=proyecto.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_actividad, key, value)
    
        #if key=="fecha_fin":
         #   db_proyecto.fecha_fin=value

        if key=="fecha_paro":
            db_actividad.fecha_reanu=None
        if key=="fecha_reanu":
            db_actividad.fecha_paro=None
            db_actividad.motivo=None        
           

    db.commit()
    db.refresh(db_actividad) 
    db.refresh(db_proyecto)     
    return db_actividad

#---Endpoint para actualizar maquina
@app.patch("/actMaquina/{proyecto_id}", response_model=schemas.ActividadRead)
async def actualizaMaquina(proyecto_id: str, info_act: schemas.ActualizaMaquina, db: Session=Depends(get_db)):
    db_proyecto=db.query(models.Actividad).filter(models.Actividad.proyecto_id==proyecto_id).first()
    if not db_proyecto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    
    updated_data=info_act.dict(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(db_proyecto, key, value)

    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

#--Endpoint que muestra todos los registros de actividades
@app.get("/actividades", response_model=List[schemas.ActividadRead])
async def listar_actividades(db: Session=Depends(get_db)):
    return db.query(models.Actividad).all()

@app.patch("/actividades/{proyecto_id}", response_model=schemas.ActividadRead)
async def update_act(proyecto_id: str, actividad: schemas.ActUpdate, db: Session=Depends(get_db)):
    db_act=db.query(models.Actividad).filter(models.Actividad.proyecto_id==proyecto_id).first()
    if not db_act:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    update_data=actividad.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_act, key, value)
    
    db.commit()
    db.refresh(db_act)

    return db_act

#---Endpoint para pestaña de pendientes por id de proyecto
@app.get("/pendientes/{proyecto_id}", response_model=List[schemas.MuestraPendientes])
async def pendientes(proyecto_id: str, db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(models.Actividad.proyecto_id==proyecto_id).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "S0 no encontrada")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraPendientes(
            id=act.proyecto_id,
            nombre = act.proyecto.nombre,
            fecha_alta= act.proyecto.fecha_alta,
            maquina= act.maquina.nombre if act.maquina else "Sin CNC asignado" #si act. maquina tiene algo asignado se usa ese nombre
                                                                #si no, se deja un texto en blanco
        ))

    return resultado


#----Endpoint para pestaña de pendientos por campo de inicio null
@app.get("/pendientes/", response_model=List[schemas.MuestraPendientes])
async def MuestraPendientes(db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(models.Actividad.inicio==None).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "Sin actividades pendientes.")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraPendientes(
            id=act.proyecto_id,
            nombre= act.proyecto.nombre,
            fecha_alta=act.proyecto.fecha_alta,
            maquina= act.maquina.nombre if act.maquina else ""
        ))

    return resultado

#---endpoint para pestaña activos por id de proyecto  
@app.get("/activos/{proyecto_id}", response_model=List[schemas.MuestraActivos])
async def muestraActivos(proyecto_id: str, db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(models.Actividad.proyecto_id==proyecto_id).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="S0 inexistente")
    
    if not all(act.inicio for act in data):
        raise HTTPException(status_code=status.HTTP_206_PARTIAL_CONTENT, detail="Proyecto no iniciado")
    if not all(act.maquina for act in data):
        raise HTTPException(status_code=status.HTTP_206_PARTIAL_CONTENT, detail="Maquina no asignada")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraActivos(
            id=act.proyecto_id,
            fecha_alta= act.proyecto.fecha_alta,
            fecha_inicio= act.inicio,
            nombre=act.proyecto.nombre,
            maquina=act.maquina.nombre
    ))

    return resultado    

#--Endpoint para pestaña de activos por campo de inicio diferente de null, fecha de paro en null y fin igual a null
@app.get("/activos", response_model=List[schemas.MuestraActivos])
async def MuestraTotalActivos(db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(and_(
        models.Actividad.inicio!=None,
        models.Actividad.fecha_paro==None,
        models.Actividad.fin_ph==None
    )).all()

    if not data:
        raise HTTPException(status_code=status.HTTP_200_OK, detail="Sin proyectos activos")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraActivos(
            id=act.proyecto_id,
            fecha_alta= act.proyecto.fecha_alta,
            fecha_inicio= act.inicio,
            nombre=act.proyecto.nombre,
            maquina=act.maquina.nombre
        ))
    
    return resultado

#--endpoint para pestaña de parados
@app.get("/parados/{proyecto_id}", response_model=List[schemas.ActividadRead])
async def retornaParados(proyecto_id: str, db: Session=Depends(get_db)):#Jajajaj ta chistoso que diga parados (tengo 10 años mentales)
    data=db.query(models.Actividad).filter(models.Actividad.proyecto_id==proyecto_id).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="S0 inexistente")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraParados(
            id=act.proyecto_id,
            nombre= act.proyecto.nombre,
            fecha_inicio= act.inicio,
            fecha_paro= act.fecha_paro,
            motivo= act.motivo
        ))
    
    return resultado

#--endpoint para pestaña de parados por campo fecha de paro != null
@app.get("/parados/", response_model=List[schemas.MuestraParados])
async def retornaParados(db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(and_(models.Actividad.fecha_paro!=None, models.Actividad.fecha_reanu==None)).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_200_OK, detail="Sin proyectos detenidos")
    
    resultado=[]
    for act in data:
        resultado.append(schemas.MuestraParados(
            id=act.proyecto_id,
            nombre= act.proyecto.nombre,
            fecha_inicio= act.inicio,
            fecha_paro= act.fecha_paro,
            motivo= act.motivo
        ))
    
    return resultado


#--Endpoint que muestra terminados
@app.get("/terminados", response_model=List[schemas.ProyectoRead])
async def listar_actividades(db: Session=Depends(get_db)):
    data=db.query(models.Actividad).filter(models.Actividad.fin!=None).all()
    if not data:
        raise HTTPException(status_code=status.HTTP_200_OK, detail="Sin proyectos terminados")

    resultado=[]

    for act in data:
        resultado.append(schemas.ProyectoRead(
            id=act.proyecto_id,
            fecha_alta=act.proyecto.fecha_alta,
            fecha_fin=act.fin_ph,
            nombre=act.proyecto.nombre 
        ))

    return resultado
