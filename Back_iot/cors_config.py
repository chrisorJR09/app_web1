from fastapi.middleware.cors import CORSMiddleware

def configurar_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],    #se puede cambiar * por dominios especificos
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )