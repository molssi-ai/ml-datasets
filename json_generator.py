import yaml, glob, json, os

if not os.path.isdir("./json"):
    os.mkdir("json")

dataset = {"data": []}
for file in glob.glob("./datasets/*.yaml"):
    with open(file, 'r') as yaml_file:
        dataset['data'].append(yaml.safe_load(yaml_file))

with open('./json/datasets.json', 'w') as file:
    file.write(json.dumps(dataset, indent=2))