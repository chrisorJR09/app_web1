#esquemas para manejar los datos dentro del codigo
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


"""Schemas para Maquina"""
#schema base
class MaquinaBase(BaseModel):
    nombre: str                

#schema para crear registro
class MaquinaCreate(MaquinaBase):
    pass 

#schema para respuesta
class MaquinaRead(MaquinaBase):
    id: int

    class Config:
        from_attributes=True


"""Schemas para proyecto"""
#schema base
class ProyectoBase(BaseModel):
    fecha_alta: datetime
    fecha_fin: Optional[datetime] = None 
    nombre: str

 #schema para registro           
class ProyectoCreate(ProyectoBase):
    id: str

class ProyectoRead(ProyectoBase):
    id: str

    class Config:
        from_attributes=True


"""Schemas para Actividad"""
class ActividadBase(BaseModel):
    maquina_id: Optional[int] = None 
    proyecto_id: str
    
    fin: Optional[datetime] = None 

class ActividadCreate(ActividadBase):    
    pass
    

class ActividadRead(ActividadBase):
    id: int

    class Config:
        from_attributes=True

"""Schemas para pestañas del front"""

#Schema de pendientes
class MuestraPendientes(BaseModel):
    id: str
    nombre: str
    fecha_alta: datetime
    maquina: Optional[str] = None
    class config :
        from_attributes=True

#Schema de activos
class MuestraActivos(BaseModel):
    id: str
    nombre: str
    fecha_alta: datetime
    fecha_inicio: datetime
    maquina: str
    class config:
        from_attributes=True

#Schema de parados
#Este hogar apoya totalmente a Kendrick Lamar
class MuestraParados(BaseModel):
    id: str
    nombre: str
    fecha_inicio: datetime
    fecha_paro: datetime
    motivo: str
    class config:
        from_attributes=True


"""Schemas para actualizar datos"""
#Actualizar maquinas
class ActualizaMaquina(BaseModel):
    maquina_id: int
    class config:
        from_attributes=True

#Actualizar datos 
class ActUpdate(BaseModel):
    fecha_paro: Optional[datetime] = None
    fecha_reanu: Optional[datetime] = None
    motivo: Optional[str] = None
    inicio: Optional[datetime]=None
    fin: Optional[datetime] = None
