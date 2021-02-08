import pandas as pd
import requests 
from bs4 import BeautifulSoup
from pandas.api.types import is_string_dtype
import pymysql.cursors

url = 'https://understat.com/league/Serie_A/2020' 

res = requests.get(url) 

soup = BeautifulSoup(res.content, "lxml")
# Based on the structure of the webpage, I found that data is in the JSON variable, under 'script' tags 
scripts = soup.find_all('script')

import json 
string_with_json_obj = '' 
# Find data for teams 
for el in scripts: 
    if 'teamsData' in str(el): 
        string_with_json_obj = str(el).strip()
# strip unnecessary symbols and get only JSON data 
ind_start = string_with_json_obj.index("('")+2 
ind_end = string_with_json_obj.index("')") 
json_data = string_with_json_obj[ind_start:ind_end] 
json_data = json_data.encode('utf8').decode('unicode_escape')

data = json.loads(json_data)
# Get teams and their relevant ids and put them into separate dictionary 
teams = {} 
for id in data.keys(): 
    teams[id] = data[id]['title']

colonne = list(data['101']['history'][0].keys())
colonne.append('teams')

df = pd.DataFrame(data = [])
for id in data.keys(): 
    teams_data = []
    id_squadra = id
    for row in data[id_squadra]['history']:
        riga = list(row.values())
        riga.append(data[id_squadra]['title'])
        teams_data.append(riga)
    df = df.append(pd.DataFrame(data=pd.DataFrame(teams_data)))
    # df.append(teams_data)
df.columns =colonne
df['ppda_coeff'] = df['ppda'].apply(lambda x: x['att']/x['def'] if x['def']!=0 else 0)
df['oppda_coeff'] = df['ppda_allowed'].apply(lambda x: x['att']/x['def'] if x['def']!=0 else 0)

select_columns = ['pts','deep','xpts', 'npxGD','h_a','xG', 'date', 'xGA', 'npxGA', 'deep_allowed','npxG','scored', 'teams', 'ppda_coeff','oppda_coeff']

values_list = []
for _, row in df.iterrows():
    values_to_select = []
    for x in select_columns:
        if is_string_dtype(df[x]):
            value = "'{}'".format(row[x])
        else:
            value = str(row[x])
        values_to_select.append(value)
    string_to_insert = ", ".join(values_to_select)
    values_list.append("({})".format(string_to_insert))


columns_list = ", ".join(select_columns)
string_values = ",\n".join(values_list)


# Connect to the database
connection = pymysql.connect(host='localhost',
                             user='***',
                             password='***',
                             db='***',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        # Create a new record
        sql = "INSERT IGNORE INTO `fct_matches_serie_a` ({fields}) VALUES {values}".format(fields=columns_list,values=string_values)
        cursor.execute(sql)

    # connection is not autocommit by default. So you must commit to save
    # your changes.
    connection.commit()

finally:
    connection.close()
