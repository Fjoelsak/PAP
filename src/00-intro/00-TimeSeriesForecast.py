import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from statsmodels.tsa.arima.model import ARIMA

# read csv into a dataframe
df=pd.read_csv("../../data/airlinepassengerdata.csv")

# set index instead of months for visualization
df.set_index('Month', inplace=False)

values = df['Passengers'].values

# Model definition
model = ARIMA(values[:], order=(2, 1, 2), seasonal_order=(1, 1, 1, 12))

# Model training
res = model.fit()

# Model usage
x = np.arange(143,160)
p = res.predict(start=x[0], end=x[-1])

print(x.shape, p.shape)

# Plot
plt.plot(x,p)
plt.plot(values)
plt.show()
