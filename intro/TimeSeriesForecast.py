import pandas as pd
from matplotlib import pyplot as plt
from statsmodels.tsa.arima.model import ARIMA

# read csv into a dataframe
df=pd.read_csv("../data/airline-passengers.csv")

# set index instead of months for visualization
df.set_index('Month', inplace=False)

values = df['Passengers'].values

# Model definition
model = ARIMA(values[:], order=(2, 1, 2), seasonal_order=(1, 1, 1, 12))

# Model training
res = model.fit()

# Model usage
p = res.predict(start=2, end=144)

# Plot
plt.plot(p)
plt.plot(values)
plt.show()
