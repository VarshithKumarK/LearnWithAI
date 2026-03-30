import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib

def main():
    print("Loading data...")
    df = pd.read_csv("../data/Course_Completion_Prediction.csv")
    
    # Feature Selection
    features = [
        'Age', 
        'Education_Level', 
        'Employment_Status', 
        'Time_Spent_Hours', 
        'Progress_Percentage', 
        'Quiz_Score_Avg', 
        'App_Usage_Percentage'
    ]
    
    target = 'Completed'
    
    X = df[features]
    y = df[target].apply(lambda x: 1 if x == 'Completed' else 0)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Pipeline
    numeric_features = ['Age', 'Time_Spent_Hours', 'Progress_Percentage', 'Quiz_Score_Avg', 'App_Usage_Percentage']
    categorical_features = ['Education_Level', 'Employment_Status']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
        
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    print("Training model...")
    clf.fit(X_train, y_train)
    
    score = clf.score(X_test, y_test)
    print(f"Model accuracy: {score:.4f}")
    
    print("Saving model to ../models/completion_model.pkl...")
    joblib.dump(clf, '../models/completion_model.pkl')
    print("Done.")

if __name__ == "__main__":
    main()
