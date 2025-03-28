from sklearn.linear_model import LogisticRegression
import joblib
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

class CareerRecommendationModel:
    def __init__(self, model=None):
        if model is not None:
            self.model = model
        else:
            self.model = LogisticRegression(
                multi_class='multinomial',
                max_iter=1000,
                random_state=42,
                solver='lbfgs'
        )

    def train(self, X_train, y_train):
        y_train_encoded = np.argmax(y_train, axis=1)
        self.model.fit(X_train, y_train_encoded)

    def evaluate(self, X, y):
        y_encoded = np.argmax(y, axis=1)
        y_pred = self.model.predict(X)
        accuracy = accuracy_score(y_encoded, y_pred)
        report = classification_report(y_encoded, y_pred)
        return accuracy, report
    
    def predict(self, X):
        return self.model.predict(X)
    
    def save(self, path='./models/logistic_regression_model.pkl'):
        joblib.dump(self.model, path)

    @staticmethod
    def load(path='./models/logistic_regression_model.pkl'):
        model = joblib.load(path)
        return CareerRecommendationModel(model)