import matplotlib.pyplot as plt
import missingno as msno
import numpy as np
import pandas as pd

from sklearn.impute import SimpleImputer


def readInData() -> pd.DataFrame:
    df = pd.read_csv("../../data/propertydata.csv")
    print(df)
    return df

def visGapsInData(df: pd.DataFrame) -> None:
    # Visualize gaps in data
    msno.matrix(df)
    plt.show()

def readInDatawithConsistentNA() -> pd.DataFrame:
    # Read csv file into pandas dataframe, replace missing values with NaN
    return pd.read_csv("../../data/propertydata.csv", na_values=["na", "--"])

def handleOwnOccupied(df: pd.DataFrame):
    # Handle OWN_OCCUPIED
    cnt = 0
    for row in df['OWN_OCCUPIED']:
        try:
           # Try to cast value to int
            int(row)
            # If possible, replace that value
            df.loc[cnt, 'OWN_OCCUPIED'] = np.nan
        except ValueError:
            pass
        cnt += 1

def handleNumBath(df: pd.DataFrame):
    # Handle NUM_BATH
    cnt = 0
    for row in df['NUM_BATH']:
        try:
            # Try to cast value to float
            int(row) #float(row)
        except ValueError:
            # If NOT possible, replace that value
            df.loc[cnt, 'NUM_BATH'] = np.nan
        cnt += 1

def meanImputation(df: pd.DataFrame, features: list):
    for feature in features:
        imp_mean = SimpleImputer(missing_values=np.nan, strategy='mean')
        df[feature] = imp_mean.fit_transform(df[feature].values.reshape(-1, 1))
        df[feature] = df[feature].astype(int)

def mostFrequentImputation(df: pd.DataFrame, features: list):
    for feature in features:
        imp_most_frequent = SimpleImputer(missing_values=np.nan, strategy='most_frequent')
        df[[feature]] = imp_most_frequent.fit_transform(df[[feature]])

def main():
    df = readInDatawithConsistentNA()
    print(df)
    handleOwnOccupied(df)
    handleNumBath(df)
    meanImputation(df, ['ST_NUM', 'NUM_BEDROOMS', 'NUM_BATH', 'SQ_FT'])
    mostFrequentImputation(df, ['OWN_OCCUPIED'])
    print(df)

if __name__ == '__main__':
    main()

