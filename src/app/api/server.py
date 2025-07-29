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
MODELS_DIR = Path("models")
MODELS = {}

# --- LÓGICA DE CARGA DE MODELOS ---
def load_single_model(model_path: Path):
    """Carga un único modelo y su configuración en memoria."""
    model_name = model_path.stem
    config_path = model_path.with_suffix(".json")

    if not config_path.exists():
        print(f"Advertencia: No se encontró config para '{model_path.name}'.")
        return False

    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        
        model = tf.keras.models.load_model(model_path)
        MODELS[model_name] = {"model": model, "config": config}
        print(f"✅ Modelo '{model_name}' cargado/recargado exitosamente.")
        return True
    except Exception as e:
        print(f"❌ Error cargando el modelo '{model_name}': {e}")
        return False

# --- GESTOR DE CICLO DE VIDA (LIFESPAN) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona los eventos de inicio y apagado de la aplicación.
    Al iniciar, crea el directorio de modelos si no existe y carga todos los modelos.
    """
    # --- CÓDIGO DE INICIO (STARTUP) ---
    MODELS_DIR.mkdir(exist_ok=True)
    print("Iniciando aplicación y cargando modelos existentes...")
    for model_file in MODELS_DIR.glob("*.h5"):
        load_single_model(model_file)
    for model_file in MODELS_DIR.glob("*.keras"):
        load_single_model(model_file)
    
    yield # La aplicación se ejecuta en este punto

    # --- CÓDIGO DE APAGADO (SHUTDOWN) ---
    # Este código se ejecuta cuando la aplicación se detiene.
    print("Apagando la aplicación y limpiando recursos...")
    MODELS.clear()

# --- APLICACIÓN FASTAPI ---
# Se pasa el gestor 'lifespan' al crear la instancia de FastAPI.
app = FastAPI(lifespan=lifespan)

# --- MIDDLEWARE (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- FUNCIÓN DE PREDICCIÓN ---
def process_and_predict(image_bytes: bytes, model_data: dict) -> str:
    # (El código de esta función no cambia)
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

# --- ENDPOINTS DE LA API ---

@app.get("/")
def read_root():
    return {"status": "Servidor de modelos dinámico funcionando"}

@app.get("/models/")
def get_available_models():
    """Devuelve una lista de los modelos disponibles."""
    return {"models": list(MODELS.keys())}

@app.post("/predict/{model_name}")
async def predict(model_name: str, image: UploadFile = File(...)):
    """Realiza una predicción usando el modelo especificado."""
    if model_name not in MODELS:
        raise HTTPException(status_code=404, detail=f"Modelo '{model_name}' no encontrado.")
    
    image_bytes = await image.read()
    prediction_result = process_and_predict(image_bytes, MODELS[model_name])
    
    return {"model_used": model_name, "result": prediction_result}

# --- ENDPOINT PARA ADMINISTRADORES ---
@app.post("/upload-model/")
async def upload_model(model_file: UploadFile = File(...), config_file: UploadFile = File(...)):
    """
    Endpoint para que un administrador suba un nuevo modelo y su configuración.
    """
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
