import yaml, glob, json, os

dataset = {"data": []}
for file in glob.glob("./datasets/*.yaml"):
    with open(file, 'r') as yaml_file:
        dataset['data'].append(yaml.safe_load(yaml_file))

with open('./website/datasets.json', 'w') as file:
    file.write(json.dumps(dataset, indent=2))