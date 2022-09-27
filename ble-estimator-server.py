from functions import *
import pandas as pd
import joblib
import warnings
import time
warnings.filterwarnings("ignore")

pd.options.mode.chained_assignment = None



# Este es un dataframe, pero aquí va el que generamos.
# Importante aclarar el formato del personcount y de la data.
# timeSeries es la lista con todos los timestamps hasta el momento. Mejor si incluye fecha y hora, más fácil

data = pd.read_csv("csv/int/"+time.strftime("%Y-%m-%d")+"_ble.csv", sep=";",header=['Timestamp int.','Raspberry','Timestamp inicial','Nº Mensajes','MAC','Tipo MAC','Tipo ADV','BLE Size','RSP Size','BLE Data','RSSI promedio'])
#intervalos de cinco minutos
pc_data = pd.read_csv("csv/int/"+time.strftime("%Y-%m-%d")+"_contador.csv", sep=";")
pc_last = pc_data.iloc[-1].tolist() 
personcount = pd.DataFrame([["12/07/2022  11:00:00", 40, 235]], columns=["Timestamp", "personCount", "Minutes"])
timeSeries = ["12/07/2022  11:00:00"] #fecha de hoy y la hora 11:00 11:05
trainingDataSet = pd.DataFrame(
    columns=["Timestamp", "Person Count", "Minutes", "N MAC TOTAL", "N MAC RA", "N MAC RB", "N MAC RC", "N MAC RD",
             "N MAC RE",
             "N MAC RDE", "N MAC RCE", "N MAC RCDE", "N MAC RBE", "N MAC MEN RA 10", "N MAC MEN RA 10-30",
             "N MAC MEN RA 30", "N MAC MEN RB 10", "N MAC MEN RB 10-30", "N MAC MEN RB 30", "N MAC MEN RC 10",
             "N MAC MEN RC 10-30", "N MAC MEN RC 30", "N MAC MEN RD 10", "N MAC MEN RD 10-30", "N MAC MEN RD 30",
             "N MAC MEN RE 10", "N MAC MEN RE 10-30", "N MAC MEN RE 30", "N MAC INTERVALO ANTERIOR",
             "N MAC DOS INTERVALOS ANTERIORES"])

data["Timestamp int."] = pd.to_datetime(data["Timestamp int."], dayfirst=True)
data = data.rename(columns={"Timestamp int.": "Timestamp"})#Renombra columna

# trainingSet es el que se va a usar para meter al estimador.
# trainingDataSet es el dataframe donde se irán almacenando los valores que le meteremos al estimador para tener un historial.
trainingSet, trainingDataSet = getTrainingDataset(data, personcount, timeSeries, trainingDataSet)

finalTrainingDataSet = pd.DataFrame(
    columns=["Timestamp", "Person Count", "Minutes", "N MAC RA", "N MAC RB", "N MAC RC", "N MAC RD", "N MAC RE",
             "N MAC RDE", "N MAC RCE", "N MAC RCDE",
             "N MAC RBE", "N MAC MEN RA 10", "N MAC MEN RB 10", "N MAC MEN RC 10", "N MAC MEN RD 10",
             "N MAC MEN RE 10", "N MAC INTERVALO ANTERIOR", "N MAC DOS INTERVALOS ANTERIORES"])

finalTrainingSet, finalTrainingDataSet = getTrainingSetFormat(trainingSet, finalTrainingDataSet)
#TO-DO training data set y final a csv
# Estos son los estimadores que ya están entrenados
est = joblib.load('models/HistGradientBoostingRegressor.pkl')
lgbm = joblib.load('models/LGBMRegressor.pkl')
rfr = joblib.load('models/RandomForestRegressor.pkl')

# Nos quedamos con los valores para estimar
X = finalTrainingSet.loc[:, (finalTrainingSet.columns != "Timestamp") & (finalTrainingSet.columns != "Person Count")]

# Estimamos
predicted_est_y = est.predict(X)
predicted_lgbm_y = lgbm.predict(X)
predicted_rfr_y = rfr.predict(X)
