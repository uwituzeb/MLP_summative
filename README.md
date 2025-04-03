# MLP Summative: Pathway Finder

## Overview

Pathway Finder is a machine learning-based application designed to predict career recommendations for high school students in Rwanda based on their interests, grades, extracurricular activities, personality traits, and facorite subjects. 

This project demonstrates the full lifecycle of an ML pipeline from model training to deployment on a cloud platform with scalability, monitoring and retraining capabilities.
For more information about the project and the model creation refer to [summative intro to ml](https://github.com/uwituzeb/summative-intro-to-ml)

## Features

1. **Model Prediction**: Users can input student data and receive career recommendation

2. **Data upload**: Users can upload bulk data in a csv file containing multiple student records which will be used to retrain the model

3. **Retraing model**: Users can retrain the model using the new dataset from data upload

4. **Visualizations**: Interactive visualizations interprete key features to provide insights into career recommendation trends.


## Technologies used

- FastAPI
- Tensorflow
- React
- Docker

## Project Structure

```

```

## Setup and Installation

### Prerequisites

- Python 3.8+
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

`docker-compose up --build`

5. For the frontend, navigate to frontend directory and install packages

```
cd frontend
npm install 
```

6. Run  `npm start`

## API Endpoints


