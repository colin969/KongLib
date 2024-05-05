# Setup

Grabs all useful files for local testing.

# Required base files

Place in this folder:
`badges.json` - https://www.kongregate.com/badges.json

Make sure python 3 is installed and run `python -m pip install -r requirements.txt` to make sure the requirements are available.

Run the scripts in order:

`1_info.py` - Downloads the needed game info from each badged game
`2_pairs.py` - Pairs the game info up with their SWF paths and game IDs, also downloads the SWF files.
`3_dedupe.py` - Cleans up the resulting pairs.json into filtered_pairs.json
`4_avmdata.py` - **Requires Ruffle repo set up, modify the paths at the top of the file. See their repo for details.** - Adds the required Avm1 / Avm2 flag to each from filtered_pairs.json into finished_pairs.json

Copy the resulting `finished_pairs.json` to `../www/game_info.json`
Copy the resulting `downloads/games/` folder to `../www/files/games`

### Required Flash API modifications

See root README.md
