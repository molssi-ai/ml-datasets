import yaml, glob, json

import glob
dataset = {"data": []}
for file in glob.glob("./datasets/*.yaml"):
    with open(file, 'r') as yaml_file:
        dataset['data'].append(yaml.safe_load(yaml_file))

with open('datasets.json', 'w') as file:
    file.write(json.dumps(dataset, indent=2))