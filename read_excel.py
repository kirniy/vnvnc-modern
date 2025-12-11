
import pandas as pd
import json

try:
    xl = pd.read_excel('wintersaga.xlsx', sheet_name=None)
    data = {}
    for sheet_name, df in xl.items():
        data[sheet_name] = json.loads(df.to_json(orient='records', force_ascii=False, date_format='iso'))
    
    with open('winter_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
