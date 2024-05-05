import json

if __name__ == "__main__":
    # Load JSON data from a file named 'pairs.json'
    with open('pairs.json', 'r') as file:
        pairs = json.load(file)

    new_pairs = []
    checked_ids = []

    # Iterate over each pair in the data
    for pair in pairs:
        game_path = pair['game_path']
        game_id = pair['game_id']

        if game_id not in checked_ids:
            new_pairs.append(pair)
            checked_ids.append(game_id)

    # Save the filtered data back to a new JSON file
    with open('filtered_pairs.json', 'w') as file:
        json.dump(new_pairs, file)

    print("Filtered pairs have been saved to 'filtered_pairs.json'.")