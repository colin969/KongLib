import json
import os
import requests

PROCESSED_DIR = 'processed'

class Game():
    def __init__(self, rawGame):
        self.title = rawGame['title']
        self.url = rawGame['url']

class Badge():
    def __init__(self, rawBadge):
        self.id = rawBadge['id']
        self.name = rawBadge['name']
        self.game = Game(rawBadge['games'][0])

with open('badges.json', 'r', encoding='utf-8') as badgesFile:
    # Read badge data
    rawBadgeData = json.loads(badgesFile.read())
    print('{0} Badges'.format(len(rawBadgeData)))
    badges = list(map((lambda rawBadge: Badge(rawBadge)), rawBadgeData))
    
    # Set up folders
    if not os.path.exists(PROCESSED_DIR):
        os.makedirs(PROCESSED_DIR)
    for badge in badges:
        path = os.path.join(PROCESSED_DIR, '{0}.json'.format(badge.id))
        if os.path.exists(path):
            # Already processed, skip
            continue
        res = requests.get(badge.game.url)
        if (res.status_code != 200):
            # Error processing, stop for now
            print('Error on {0} - Status Code {1}'.format(badge.id, res.status_code))
            continue
        print('Processing {0}'.format(badge.id))
        for line in res.iter_lines(decode_unicode=True):
            if 'new Holodeck' in line:
                # Found the holodeck info, extract json
                formatted = json.loads('{' + line[line.find('"chat_host"'):-2])
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(json.dumps(formatted, indent=2))        
