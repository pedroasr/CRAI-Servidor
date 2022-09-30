#!./py3env/bin/python

from functions import *
import pandas as pd
import joblib
import warnings
import time
import numpy as np
import sys
import mysql.connector

warnings.filterwarnings("ignore")

mydb = mysql.connector.connect(
    host="localhost",
    user="sqlco2",
    password="sqlpass",
    database="co2blelr"
)

# print("AI Starts")
mycursor = mydb.cursor()

pd.options.mode.chained_assignment = None

# Este es un dataframe, pero aquí va el que generamos.
# Importante aclarar el formato del personcount y de la data.
# timeSeries es la lista con todos los timestamps hasta el momento. Mejor si incluye fecha y hora, más fácil

# ruta = "csv/int/"+time.strftime("%Y-%m-%d")
# ruta = "test/2022-09-28"
ruta = sys.argv[1]

data = pd.read_csv(ruta, sep=";")
data.columns = ['Timestamp int.', 'Raspberry', 'Timestamp inicial', 'Nº Mensajes', 'MAC', 'Tipo MAC', 'Tipo ADV',
                'BLE Size', 'RSP Size', 'BLE Data', 'RSSI promedio']
# intervalos de cinco minutos
pc_data = pd.read_csv(ruta.split("_")[0] + "_contador.csv", sep=";")
pc_last = pc_data.iloc[-2].tolist()
major = pc_last[0].split(" ")[1]  # Get the last


personcount = pd.DataFrame([pc_last], columns=["Timestamp", "personCount", "Minutes"])
timeSeries = generateTimeSeriesByHour(data.iloc[0]['Timestamp int.'], major)  # fecha de hoy y la hora 11:00 11:05

data["Timestamp int."] = pd.to_datetime(data["Timestamp int."], dayfirst=True)
data = data.rename(columns={"Timestamp int.": "Timestamp"})  # Renombra columna

data.replace(
    {"Raspberry1": "Raspberry A", "Raspberry2": "Raspberry D", "Raspberry3": "Raspberry B", "Raspberry5": "Raspberry E",
     "Raspberry7": "Raspberry C"}, inplace=True)

#Guardamos el dataset
# trainingSet es el que se va a usar para meter al estimador.
# trainingDataSet es el dataframe donde se irán almacenando los valores que le meteremos al estimador para tener un historial.
trainingSet = getTrainingDataset(data, personcount, timeSeries)

finalTrainingSet = getTrainingSetFormat(trainingSet)
# TO-DO training data set y final a csv
# Estos son los estimadores que ya están entrenados
est = joblib.load('ai_models/HistGradientBoostingRegressor.pkl')
lgbm = joblib.load('ai_models/LGBMRegressor.pkl')
rfr = joblib.load('ai_models/RandomForestRegressor.pkl')

# Nos quedamos con los valores para estimar
X = finalTrainingSet.loc[:, (finalTrainingSet.columns != "Timestamp") & (finalTrainingSet.columns != "Person Count")]

# Estimamos
predicted_est_y = int(np.round(est.predict(X)))
predicted_lgbm_y = int(np.round(lgbm.predict(X)))
predicted_rfr_y = int(np.round(rfr.predict(X)))

print(f"HistGradient: {predicted_est_y}")
print(f"LGBMRegressor: {predicted_lgbm_y}")
print(f"RandomForestRegressor: {predicted_rfr_y}")

sql = "INSERT INTO hd_ocupa (FuenteEst,Estimacion,Timestamp) VALUES (%s,%s,%s)"
major = time.strftime("%Y-%m-%d") + " " + (pc_data.iloc[-1].tolist())[0].split(" ")[1]

val = ("HistGradient", predicted_est_y, major)
mycursor.execute(sql, val)
mydb.commit()

val = ("LGBM_Regressor", predicted_lgbm_y, major)
mycursor.execute(sql, val)
mydb.commit()

val = ("RandomForestRegressor", predicted_rfr_y, major)
mycursor.execute(sql, val)

mydb.commit()
