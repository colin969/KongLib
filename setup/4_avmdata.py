import csv
import json
import subprocess
import os

command_base = "cargo run --release --package=ruffle_scanner -- scan {} {}"
command_dir = "/home/coder/ruffle"
output_file = "/home/coder/KongLib/game.csv"
downloads_dir = "/home/coder/KongLib/setup/downloads"

def load_csv_data(game_path):
    full_path = os.path.join(downloads_dir, game_path[1:])
    command = command_base.format(full_path, output_file)
    subprocess.run(command, cwd=command_dir, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    with open(output_file, mode='r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        csv_data = {rows[0]: rows[-1] for rows in csv_reader}  # assuming swf_filename is in the first column and 'avm' value in the last
        return csv_data

# Load the JSON data
def load_json_data(json_filename):
    with open(json_filename, 'r', encoding='utf-8') as file:
        json_data = json.load(file)
    return json_data

# Update JSON data with CSV data
def update_json_with_asm(json_data):
    for item in json_data:
        swf_filename = item.get('swf_filename')
        game_path = item.get('game_path')
        print(game_path)
        data = load_csv_data(game_path)
        item['avm'] = data[swf_filename]

# Save updated JSON data to a new file
def save_json_data(json_data, output_filename):
    with open(output_filename, 'w', encoding='utf-8') as file:
        json.dump(json_data, file)

def main():
    json_filename = 'filtered_pairs.json'
    output_filename = 'finished_pairs.json'
    
    json_data = load_json_data(json_filename)
    
    update_json_with_asm(json_data)
    save_json_data(json_data, output_filename)

    print("JSON data has been updated and saved to", output_filename)

if __name__ == "__main__":
    main()
