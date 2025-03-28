import joblib
import numpy as np

def make_predictions(X, model_path='./models/logistic_regression_model.pkl',
                     encoder_path='./models/label_encoder.pkl'):
    try:
        model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)
        predictions = model.predict(X)
        return encoder.inverse_transform(predictions)
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Model or encoder file not found: {e}")
    except Exception as e:
        raise Exception(f"Error making predictions: {e}")