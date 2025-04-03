# MLP Summative: Pathway Finder

## Overview

Pathway Finder is a machine learning-based application designed to predict career recommendations for high school students in Rwanda based on their interests, grades, extracurricular activities, personality traits, and facorite subjects. 

This project demonstrates the full lifecycle of an ML pipeline from model training to deployment on a cloud platform with scalability, visualization and retraining capabilities.
For more information about the project and the model creation refer to [summative intro to ml](https://github.com/uwituzeb/summative-intro-to-ml)

## Features

1. **Model Prediction**: Users can input student data and receive career recommendation

2. **Data upload**: Users can upload bulk data in a csv file containing multiple student records which will be saved in the MongoDB database and used to retrain the model

3. **Retraing model**: Users can retrain the model using the new dataset from data upload

4. **Visualizations**: Interactive visualizations interprete key features to provide insights into career recommendation trends.


## Technologies used

- FastAPI
- Tensorflow
- React
- Docker
- MongoDB

## Video demo

[Video Link](https://drive.google.com/file/d/1aVQZNTgJOfZIciAjcl-CAeBrcnssIIag/view?usp=sharing)

## Swagger documentation

Navigate to [Documentation](https://mlp-summative.onrender.com/) to try out the API through Swagger Docs. NB: Due to it being a free service, may take longer to load.

## Setup and Installation

### Prerequisites

- Python
- Docker
- Node.js

### Setup

1. Clone the repository

```

git clone https://github.com/uwituzeb/MLP_summative.git
cd MLP_summative

```

2. Setup virtual environment

3. Install dependencies

```
pip install -r requirements.txt

```

4. Run locally with docker

`docker-compose up --build` or run `py app.py`

5. For the frontend, navigate to frontend directory and install packages

```
cd frontend
npm install 
```

6. Run  `npm start`

## API Endpoints

- `POST /predict`: Predicts career recommendation based on student input
- `POST /upload`: Uploads a CSV dataset for model training
- `POST /retrain`: Retrains the career recommendation model using uploaded datasets
- `GET /visualizations/{plot_type}`: Returns visualizations for data insights. Possible options are `extracurriculars`, `interest`, `personality`

## Frontend

- Navigate to [Pathway Finder](https://pathway-finder-zeta.vercel.app/) to navigate to the homepage
- `/prediction` is for user to enter data and predict career recommendation
- `/visualizations` is for getting visualizations according to parameter passed to get data insights
- `/upload`: upload csv file for retraining
- `/retrain`: retrain using uploaded data

