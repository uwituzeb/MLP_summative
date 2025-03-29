from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from src.preprocessing import preprocess_data
from src.model import CareerRecommendationModel
from src.prediction import make_predictions
import matplotlib.pyplot as plt
import seaborn as sns
import os
import shutil

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
UPLOAD_FOLDER = './data/uploads'
STATIC_FOLDER = './data/static'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

class PredictionInput(BaseModel):
    Education: str
    Interest: str
    Favorite_Subject: str
    Extracurriculars: str
    Personality_Trait: str
    Age: Optional[int] = None
    CandidateID: Optional[str] = None


@app.post("/predict")
async def predict(data: PredictionInput):
    df = pd.DataFrame([data.model_dump()])
    X_processed = preprocess_data(df, is_train=False)
    predictions = make_predictions(X_processed)
    return {'Recommended_Career': predictions[0]}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"UPLOAD_FOLDER absolute path: {os.path.abspath(UPLOAD_FOLDER)}")
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"File {file.filename} uploaded successfully"}

@app.post("/retrain")
async def retrain():
    upload_files = os.listdir(UPLOAD_FOLDER)
    if not upload_files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    dfs = [pd.read_csv(os.path.join(UPLOAD_FOLDER, f)) for f in upload_files]
    combined_df = pd.concat(dfs, ignore_index=True)
    
    X_train, _, _, y_train, _, _, _ = preprocess_data(combined_df)
    model = CareerRecommendationModel()
    model.train(X_train, y_train)
    model.save()
    
    return {"message": "Model retrained successfully"}

@app.get("/visualizations/{plot_type}")
async def get_visualizations(plot_type: str):
    df = pd.read_csv('data/train/high_school_career_recommendation_dataset.csv')
    
    plt.figure(figsize=(8, 6))
    if plot_type == "education":
        sns.countplot(data=df, x='Education')
        plt.xticks(rotation=45)
        plt.title('Education Distribution')
    elif plot_type == "interest":
        sns.countplot(data=df, x='Interest', hue='Recommended_Career')
        plt.xticks(rotation=45)
        plt.title('Interest vs Career')
    elif plot_type == "personality":
        sns.countplot(data=df, x='Personality_Trait')
        plt.xticks(rotation=45)
        plt.title('Personality Distribution')
    else:
        raise HTTPException(status_code=404, detail="Invalid plot type")
    
    plot_path = f"{STATIC_FOLDER}/{plot_type}.png"
    plt.savefig(plot_path)
    plt.close()
    return FileResponse(plot_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
