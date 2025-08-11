import io
import os
import json
import shutil
import numpy as np
import tensorflow as tf
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# --- CONFIGURACIÓN GLOBAL ---
MODELS_DIR = Path("models") # Directorio donde se guardan los modelos y configuraciones
MODELS = {} # Diccionario para almacenar modelos cargados en memoria

# --- LÓGICA DE CARGA DE MODELOS ---
def load_single_model(model_path: Path): 
    model_name = model_path.stem # Nombre del modelo sin extensión
    config_path = model_path.with_suffix(".json") # Ruta del archivo de configuración

    if not config_path.exists():
        print(f"Advertencia: No se encontró config para '{model_path.name}'.") 
        return False

    try: 
        with open(config_path, "r", encoding="UTF-8") as f: 
            config = json.load(f)
        
        model = tf.keras.models.load_model(model_path)
        MODELS[model_name] = {"model": model, "config": config} 
        print(f"✅ Modelo '{model_name}' cargado/recargado exitosamente.") 
        return True 
    except Exception as e:
        print(f"❌ Error cargando el modelo '{model_name}': {e}")
        return False

# --- GESTOR DE CICLO DE VIDA ---
@asynccontextmanager 
async def lifespan(app: FastAPI): 
    # --- CÓDIGO DE INICIO ---
    MODELS_DIR.mkdir(exist_ok=True)
    print("Iniciando aplicación y cargando modelos existentes...")
    for model_file in MODELS_DIR.glob("*.h5"):
        load_single_model(model_file)
    for model_file in MODELS_DIR.glob("*.keras"):
        load_single_model(model_file)
    
    yield # La aplicación se ejecuta en este punto

    print("Apagando la aplicación y limpiando recursos...")
    MODELS.clear()

# Se pasa el gestor 'lifespan' al crear la instancia de FastAPI.
app = FastAPI(lifespan=lifespan)

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_and_predict(image_bytes: bytes, model_data: dict) -> str: 
    model = model_data["model"]
    config = model_data["config"]
    image_size = tuple(config["image_size"])
    class_names = config["class_names"]

    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_resized = img.resize(image_size)
    img_array = tf.keras.preprocessing.image.img_to_array(img_resized) / 255.0
    img_batch = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_batch)
    
    score = np.max(prediction[0]) 
    class_index = np.argmax(prediction[0])
    class_name = class_names[class_index]

    return f"{class_name} ({score:.2%})"


@app.get("/")
def read_root():
    return {"status": "Servidor de modelos dinámico funcionando"}

@app.get("/models/")
def get_available_models():
    return {"models": list(MODELS.keys())}

@app.get("/models/{model_name}/config")
def get_model_config(model_name: str):
    if model_name not in MODELS:
        raise HTTPException(status_code=404, detail=f"Configuración para el modelo '{model_name}' no encontrada.")
    
    return MODELS[model_name]["config"]

@app.post("/predict/{model_name}")
async def predict(model_name: str, image: UploadFile = File(...)):
    if model_name not in MODELS:
        raise HTTPException(status_code=404, detail=f"Modelo '{model_name}' no encontrado.")
    
    image_bytes = await image.read()
    prediction_result = process_and_predict(image_bytes, MODELS[model_name])
    
    return {"model_used": model_name, "result": prediction_result}

@app.post("/models/")
async def upload_model(model_file: UploadFile = File(...), config_file: UploadFile = File(...)):
   
    # Validar nombres de archivo
    model_filename = Path(model_file.filename)
    config_filename = Path(config_file.filename)
    if model_filename.stem != config_filename.stem:
        raise HTTPException(status_code=400, detail="El nombre del modelo y el de la configuración deben coincidir.")

    # Guardar los archivos en el directorio de modelos
    model_save_path = MODELS_DIR / model_filename
    config_save_path = MODELS_DIR / config_filename
    
    try:
        with open(model_save_path, "wb") as buffer:
            shutil.copyfileobj(model_file.file, buffer)
        with open(config_save_path, "wb") as buffer:
            shutil.copyfileobj(config_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando archivos: {e}")
    finally:
        model_file.file.close()
        config_file.file.close()

    # Cargar el nuevo modelo en memoria sin reiniciar el servidor
    if load_single_model(model_save_path):
        return {"message": f"Modelo '{model_filename.stem}' subido y cargado correctamente."}
    else:
        raise HTTPException(status_code=500, detail="El modelo fue guardado pero no pudo ser cargado. Revisa los logs del servidor.")
