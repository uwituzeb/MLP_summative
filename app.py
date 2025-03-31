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
from pymongo import MongoClient
import gridfs
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount('/static', StaticFiles(directory='./data/static'), name='static')

# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = './data/uploads'
STATIC_FOLDER = './data/static'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

# mongodb
client = MongoClient("mongodb://localhost:27017/")
db = client['career_recommendation']
fs = gridfs.GridFS(db)


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
    
    # save to MongoDB
    file_id = fs.put(open(file_path, 'rb'), filename=file.filename)
    print(f"File {file.filename} uploaded to MongoDB with ID: {file_id}")
    return {"message": f"File {file.filename} uploaded successfully"}

@app.post("/retrain")
async def retrain():
    files = db.fs.files.find()
    dfs = []
    for file_doc in files:
        file_data = fs.get(file_doc['_id']).read()
        temp_path = os.path.join(UPLOAD_FOLDER, file_doc['filename'])
        with open(temp_path, 'wb') as temp_file:
            temp_file.write(file_data)
        df = pd.read_csv(temp_path)
        dfs.append(df)
        os.remove(temp_path)

    if not dfs:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
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
    plots = []
    if plot_type == "education":
        # First plot: Count plot
        plt.figure(figsize=(8, 6))
        sns.countplot(data=df, x='Education')
        plt.xticks(rotation=45)
        plt.title('Education Distribution')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        # Second plot: Stacked bar plot with career correlation
        plt.figure(figsize=(8, 6))
        education_career = df.groupby(['Education', 'Recommended_Career']).size().unstack().fillna(0)
        education_career.plot(kind='bar', stacked=True)
        plt.title('Education vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45)
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2)
        plt.close()
        plots.append(plot_path2)

    elif plot_type == "interest":
        plt.figure(figsize=(8, 6))
        sns.countplot(data=df, x='Interest', hue='Recommended_Career')
        plt.xticks(rotation=45)
        plt.title('Interest vs Career')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        plt.figure(figsize=(8, 6))
        interest_career = df.groupby(['Interest', 'Recommended_Career']).size().unstack().fillna(0)
        interest_career.plot(kind='bar', stacked=True)
        plt.title('Interest vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45)
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2)
        plt.close()
        plots.append(plot_path2)

    elif plot_type == "personality":
        plt.figure(figsize=(8, 6))
        sns.countplot(data=df, x='Personality_Trait')
        plt.xticks(rotation=45)
        plt.title('Personality Distribution')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        plt.figure(figsize=(8, 6))
        personality_career = df.groupby(['Personality_Trait', 'Recommended_Career']).size().unstack().fillna(0)
        personality_career.plot(kind='bar', stacked=True)
        plt.title('Personality vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45)
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2)
        plt.close()
        plots.append(plot_path2)

    else:
        raise HTTPException(status_code=404, detail="Invalid plot type")
    
    return JSONResponse(content={
    "count_plot": f"http://localhost:8000/static/{os.path.basename(plots[0])}",
    "bar_plot": f"http://localhost:8000/static/{os.path.basename(plots[1])}"
})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
