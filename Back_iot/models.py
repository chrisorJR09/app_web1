from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base 


class Maquina(Base):
    __tablename__= "maquinas"   #tabla a la que se hace referencia

    id= Column(Integer, primary_key=True, index=True) #identificador de la maquina
    nombre=Column (String, index=True)                

    actividades=relationship("Actividad", back_populates="maquina")

class Proyecto(Base):
    __tablename__= "proyectos" 

    id = Column(String, primary_key=True, index=True)
    nombre= Column(String, index=True)
    fecha_alta=Column(DateTime, index=True)
    fecha_fin=Column(DateTime, index=True, nullable=True)

    actividades=relationship("Actividad", back_populates="proyecto")

class Actividad(Base):
    __tablename__= "actividades"

    id=Column(Integer, primary_key=True, index=True)
    maquina_id=Column(Integer, ForeignKey("maquinas.id"), nullable=True)
    proyecto_id=Column(String, ForeignKey("proyectos.id"))
    inicio=Column(DateTime, nullable=True)
    fecha_paro=Column(DateTime, nullable=True)
    fecha_reanu=Column(DateTime, nullable=True)
    fin_ph=Column(DateTime, nullable=True)
    motivo=Column(String, nullable=True)

    maquina=relationship("Maquina", back_populates="actividades")
    proyecto=relationship("Proyecto", back_populates="actividades")

    