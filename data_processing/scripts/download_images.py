import requests
import csv
import shutil

with open('../../public/data/pittsburgh_steps.csv', 'r') as f:
    data = [x for x in csv.DictReader(f)]

for row in data:
    r = requests.get(row['image'], stream=True)
    if r.status_code == 200:
        with open(f"../../public/images/{row['id']}.jpg", 'wb') as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)
