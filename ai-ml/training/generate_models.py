import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.stem.porter import PorterStemmer
import pickle
import os

def stem(text):
    ps = PorterStemmer()
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)

def main():
    print("Loading datasets...")
    # Load data
    data = pd.read_csv("../data/Coursera.csv")
    
    print("Preprocessing data...")
    # Clean data
    data = data[['Course Name', 'Difficulty Level', 'Course URL', 'Course Description', 'Skills']]
    data['Course Name'] = data['Course Name'].str.replace(' ', ',')
    data['Course Name'] = data['Course Name'].str.replace(':', '')
    data['Course Name'] = data['Course Name'].str.replace(',,', ',')
    
    data['Course Description'] = data['Course Description'].str.replace(' ', ',')
    data['Course Description'] = data['Course Description'].str.replace(',,', ',')
    data['Course Description'] = data['Course Description'].str.replace(':', '')
    data['Course Description'] = data['Course Description'].str.replace('_', '')
    data['Course Description'] = data['Course Description'].str.replace('(', '')
    data['Course Description'] = data['Course Description'].str.replace(')', '')
    
    data['Skills'] = data['Skills'].str.replace('(', '')
    data['Skills'] = data['Skills'].str.replace(')', '')
    
    data['tags'] = data['Course Name'] + data['Difficulty Level'] + data['Course Description'] + data['Skills']
    
    new_df = data[['Course Name', 'Course URL', 'tags']].copy()
    new_df["Course Name"] = data['Course Name'].str.replace(',', ' ')
    new_df.rename(columns={'Course Name': 'course_name', 'Course URL': 'course_url'}, inplace=True)
    new_df['tags'] = new_df['tags'].apply(lambda x: x.lower())
    new_df['tags'] = new_df['tags'].apply(stem)
    
    print("Generating similarity matrix...")
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(new_df['tags']).toarray()
    similarity = cosine_similarity(vectors)
    
    print("Saving models to ../models/...")
    os.makedirs("../models", exist_ok=True)
    pickle.dump(similarity, open("../models/similarity.pkl", "wb"))
    pickle.dump(new_df, open("../models/courses.pkl", "wb"))
    pickle.dump(new_df[['course_name', 'course_url']].to_dict('records'), open("../models/course_list.pkl", "wb"))
    
    print("Successfully generated and saved recommendation models.")

if __name__ == "__main__":
    main()
