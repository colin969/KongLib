import requests
import re
import sys
import uuid
import os
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote

def find_swf_info(url):
    # Fetch the HTML content from the URL
    response = requests.get(url)
    html_content = response.text
    with open('output.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Extract all <script> elements
    script_elements = soup.find_all('script')

       # Regex pattern to match and capture iframeUrl declarations up to the channel_id
    pattern = re.compile(r"var iframeUrl = '(https?://.*?/frame/)(.+?)(/\?.*?)';")
    title_pattern = re.compile(r"trackTimedEvent\(.+?,\s*\"(.*?)\"")

    game_frame_url = None
    game_name = None

    for script in soup.find_all('script'):
        if script.string:
            for match in re.finditer(title_pattern, script.string):
                game_name = match.group(1)
                break
        if game_name is not None:
            break

    print(game_name)

    # Replace each found channel_id with a UUID
    for script in soup.find_all('script'):
        if script.string:
            for match in re.finditer(pattern, script.string):
                # Generate a new UUID
                new_uuid = str(uuid.uuid4())
                # Original full URL with old channel_id
                old_url = match.group(0)
                # New URL with UUID replacing the channel_id
                new_url = f"{match.group(1)}{new_uuid}{match.group(3)}"
                game_frame_url = new_url

    frame_response = requests.get(game_frame_url)
    frame_html_content = frame_response.text
    frame_soup = BeautifulSoup(frame_html_content, 'html.parser')

    frame_script_elements = frame_soup.find_all('script');
                

    # Regex pattern to find "var swf_location = '...';" ignoring 'konduit' in the URL
    pattern = re.compile(r'var swf_location\s*=\s*["\'](.*?)["\'];')

    # List to hold all valid swf locations
    valid_swf_locations = []

    # Process each script element
    for script in frame_script_elements:
        if script.string:  # Check if the script tag has any content
            matches = pattern.findall(script.string)
            for match in matches:
                if 'konduit' not in match:
                   return {
                        "swf_url": match,
                        "name": game_name
                    }

    return None

# Example usage:
# url = "https://example.com/page"
# print(find_swf_locations(url))

if __name__ == "__main__":
    info_directory = "./processed"
    save_directory = "./downloads"
    out_file = "./pairs.json"
    base_url = "http://kongregate.com"
    pairs = []

    for filename in os.listdir(info_directory):
        try:
            if filename.endswith('.json'):
                file_path = os.path.join(info_directory, filename)
                with open(file_path, 'r') as file:
                    print("checking " + file_path)
                    data = json.load(file)
                    game_path = data.get("game_path")
                    if game_path:
                        full_url = base_url + game_path
                        info = find_swf_info(full_url)
                        # Save to file
                        if info is not None:
                            swf_url = info["swf_url"]
                            res = requests.get("http:" + swf_url)
                            filename = os.path.basename(unquote(swf_url)).split('?')[0]
                            save_path = os.path.join("downloads", game_path[1:], filename)
                            os.makedirs(os.path.dirname(save_path), exist_ok=True)
                            if not os.path.exists(save_path):
                                with open(save_path, "wb") as f:
                                    f.write(res.content)
                                print("saved " + filename)
                            # Save pair data
                            pair = {"game_path": game_path, "name": info["name"], "game_id": data.get("game_id"), "swf_url": swf_url, "swf_filename": filename}
                            pairs.append(pair)
        except Exception as e:
            print(e)
            print("Failed for " + filename)

    with open(out_file, 'w') as f:
        json.dump(pairs, f)
