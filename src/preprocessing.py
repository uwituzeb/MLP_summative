import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import tensorflow as tf
import joblib
import os

def preprocess_data(df, is_train=True, scaler_path='./models/scaler.pkl', encoder_path='./models/label_encoder.pkl'):

    # Split features and target
    X = df.drop('Recommended_Career', axis=1) if 'Recommended_Career' in df.columns else df
    y = df['Recommended_Career'] if 'Recommended_Career' in df.columns else None

    # Encode target
    categorical_cols = ['Education', 'Interest', 'Favorite_Subject', 'Extracurriculars', 'Personality_Trait']
    X = pd.get_dummies(X, columns=[col for col in categorical_cols if col in X.columns])

    if is_train:
        # Split data
        x_train, x_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
        x_val, x_test, y_val, y_test = train_test_split(x_temp, y_temp, test_size=0.5, random_state=42)

        # Scale features
        scaler = StandardScaler()
        x_train_scaled =  scaler.fit_transform(x_train)
        x_val_scaled = scaler.transform(x_val)
        x_test_scaled = scaler.transform(x_test)

        # Encode labels
        le = LabelEncoder()
        y_train_encoded = le.fit_transform(y_train)
        y_val_encoded = le.transform(y_val)
        y_test_encoded = le.transform(y_test)

        # # Conveert to categorical
        # y_train_categorical = tf.keras.utils.to_categorical(y_train_encoded)
        # y_val_categorical = tf.keras.utils.to_categorical(y_val_encoded)
        # y_test_categorical = tf.keras.utils.to_categorical(y_test_encoded)

        joblib.dump(scaler, scaler_path)
        joblib.dump(le, encoder_path)

        return (x_train_scaled, x_val_scaled, x_test_scaled, 
                y_train_encoded, y_val_encoded, y_test_encoded,
                x_train.columns)
    else:
        # Load saved preprocessors
        scaler = joblib.load(scaler_path)
        # Ensure input has same columns as training data
        X = pd.get_dummies(X, columns=[col for col in categorical_cols if col in X.columns])
        training_columns = joblib.load(scaler_path + '.columns') if os.path.exists(scaler_path + '.columns') else X.columns
        for col in training_columns:
            if col not in X.columns:
                X[col] = 0
        X = X[training_columns]
        X_scaled = scaler.transform(X)
        return X_scaled