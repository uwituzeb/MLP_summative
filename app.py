from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from src.preprocessing import preprocess_data, preprocess_data_for_retrain
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
from dotenv import load_dotenv
from gridfs import GridFS
from urllib.parse import quote_plus

app = FastAPI(
    title="Career Recommendation API",
    description="API for predicting career recommendations based on student input.",
    version="1.0.0",
    docs_url="/",
    openapi_tags=[
       {
            "name": "predictions",
            "description": "Career prediction operations"
        },
        {
            "name": "data",
            "description": "Data upload and model operations"
        },
        {
            "name": "visualizations",
            "description": "Data visualization endpoints"
        }
    ]
)

app.mount('/static', StaticFiles(directory='./data/static'), name='static')

# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Mount static files
STATIC_FOLDER = os.path.abspath("./data/static")
UPLOAD_FOLDER = os.path.abspath("./data/uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

# mongodb
ATLAS_USER = os.getenv("ATLAS_USER")
ATLAS_PASSWORD = os.getenv("ATLAS_PASSWORD")
ATLAS_DB = os.getenv("ATLAS_DB")
ATLAS_CLUSTER = os.getenv("ATLAS_CLUSTER")
BACKEND_URL = os.getenv("BACKEND_URL", "https://mlp-summative.onrender.com")

encoded_user = quote_plus(ATLAS_USER)
encoded_password = quote_plus(ATLAS_PASSWORD)
MONGODB_URI = f"mongodb+srv://{encoded_user}:{encoded_password}@{ATLAS_CLUSTER}.mongodb.net/{ATLAS_DB}?retryWrites=true&w=majority"

# Connect to MongoDB Atlas
try:
    client = MongoClient(MONGODB_URI)
    db = client[ATLAS_DB]
    fs = GridFS(db)
    print("Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {str(e)}")
    raise


class PredictionInput(BaseModel):
    Education: str = Field(..., example="O-Level")
    Interest: str = Field(..., example="Business")
    Favorite_Subject: str = Field(..., example="Mathematics")
    Extracurriculars: str = Field(..., example="Art Club")
    Personality_Trait: str = Field(..., example="Leader")
    Age: Optional[int] = Field(None, example=16)
    CandidateID: Optional[str] = Field(None, example="123456")

    class Config:
        schema_extra = {
            "example": {
                "Education": "O-Level",
                "Interest": "Business",
                "Favorite_Subject": "Mathematics",
                "Extracurriculars": "Art Club",
                "Personality_Trait": "Leader",
                "Age": 16,
                "CandidateID": "123456"
            }
        }


@app.post("/predict",
          tags=["predictions"],
          summary="Predict career recommendation",
          description="Takes student profile information and returns recommended career using the trained ML model.")
async def predict(data: PredictionInput):
    """
    Predict a career recommendation based on student profile data.
    
    This endpoint processes student information such as education, interests, and personality traits
    to generate a suitable career recommendation using a machine learning model.
    """
    df = pd.DataFrame([data.model_dump()])
    X_processed = preprocess_data(df, is_train=False)
    predictions = make_predictions(X_processed)
    return {'Recommended_Career': predictions[0]}

@app.post("/upload",
          tags=["data"],
          summary="Upload a dataset CSV file",
          description="Upload CSV files to retrain the model.")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a CSV file to the server for later model retraining.
    
    The file will be stored both on the server filesystem and in MongoDB GridFS.
    """
    print(f"UPLOAD_FOLDER absolute path: {os.path.abspath(UPLOAD_FOLDER)}")
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # save to MongoDB
    file_id = fs.put(open(file_path, 'rb'), filename=file.filename)
    print(f"File {file.filename} uploaded to MongoDB with ID: {file_id}")
    return {"message": f"File {file.filename} uploaded successfully"}

@app.post("/retrain",
          tags=["data"],
          summary="Retrain the model",
          description="Retrain the model using the uploaded dataset.")
async def retrain():
    """
    Retrain the career recommendation model using uploaded dataset.
    """
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
    
    X_scaled, y_encoded = preprocess_data_for_retrain(combined_df)
    model = CareerRecommendationModel()
    model.train(X_scaled, y_encoded)


    model.save()
    
    return {
        "message": "Model retrained successfully",
    }

@app.get("/visualizations/{plot_type}",
         tags=["visualizations"],
         summary="Generate data visualizations",
         description="Generate and return visualizations based on the specified plot type. Possible options are extracurriculars, interest, and personality.")
async def get_visualizations(plot_type: str):
    """
    Generate data visualizations based on the specified plot type.

    Available plot types: extracurriculars, interest, personality
    """
    df = pd.read_csv('data/train/high_school_career_recommendation_dataset.csv')

    if not os.path.exists(STATIC_FOLDER):
        os.makedirs(STATIC_FOLDER, exist_ok=True)
    
    plt.figure(figsize=(12, 8))
    plots = []
    if plot_type == "extracurriculars":
        # First plot: Count plot
        plt.figure(figsize=(12, 8))
        sns.countplot(data=df, x='Extracurriculars', hue='Recommended_Career')
        plt.xticks(rotation=45)
        plt.title('Extracurriculars Distribution')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        # Second plot: Stacked bar plot with career correlation
        plt.figure(figsize=(12, 8))
        extracurriculars_career = df.groupby(['Extracurriculars', 'Recommended_Career']).size().unstack().fillna(0)
        extracurriculars_career.plot(kind='bar', stacked=True)
        plt.title('Extracurriculars vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45, ha="right")
        plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2, bbox_inches='tight')
        plt.close()
        plots.append(plot_path2)

    elif plot_type == "interest":
        plt.figure(figsize=(12, 8))
        sns.countplot(data=df, x='Interest', hue='Recommended_Career')
        plt.xticks(rotation=45)
        plt.title('Interest vs Career')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        plt.figure(figsize=(12, 8))
        interest_career = df.groupby(['Interest', 'Recommended_Career']).size().unstack().fillna(0)
        interest_career.plot(kind='bar', stacked=True)
        plt.title('Interest vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45, ha="right")
        plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2, bbox_inches='tight')
        plt.close()
        plots.append(plot_path2)

    elif plot_type == "personality":
        plt.figure(figsize=(12, 8))
        sns.countplot(data=df, x='Personality_Trait')
        plt.xticks(rotation=45)
        plt.title('Personality Distribution')
        plot_path1 = f"{STATIC_FOLDER}/{plot_type}_count.png"
        plt.savefig(plot_path1)
        plt.close()
        plots.append(plot_path1)

        plt.figure(figsize=(12, 8))
        personality_career = df.groupby(['Personality_Trait', 'Recommended_Career']).size().unstack().fillna(0)
        personality_career.plot(kind='bar', stacked=True)
        plt.title('Personality vs Career - Stacked Bar Plot')
        plt.xticks(rotation=45)
        plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plot_path2 = f"{STATIC_FOLDER}/{plot_type}_bar.png"
        plt.savefig(plot_path2, bbox_inches='tight')
        plt.close()
        plots.append(plot_path2)

    else:
        raise HTTPException(status_code=404, detail="Invalid plot type")
    
    return JSONResponse(content={
    "count_plot": f"{BACKEND_URL}/static/{os.path.basename(plots[0])}",
    "bar_plot": f"{BACKEND_URL}/static/{os.path.basename(plots[1])}"
})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
