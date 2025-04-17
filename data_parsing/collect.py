import os
import json
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


def get_filename_from_cd(content_disposition):
    '''
    Extract filename from Content-Disposition header.
    '''
    if not content_disposition:
        return None
    # Try to extract filename using regex
    filenames = re.findall('filename="([^"]+)"', content_disposition)
    if not filenames:
        filenames = re.findall('filename=([^;]+)', content_disposition)
    return filenames[0].strip() if filenames else None


def download_xls_files(year, download_folder='downloads'):
    # Create download directory if it doesn't exist
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)
        print(f'Created folder: {download_folder}')

    if not os.path.exists(f'{download_folder}/{year}'):
        os.makedirs(f'{download_folder}/{year}')
        print(f'Created folder: {download_folder}/{year}')

    url = BASE_URL.format(year)
    downloaded_files = {}

    # Fetch the webpage HTML
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f'Error fetching URL {url}: {e}')
        return downloaded_files

    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(response.content, 'html.parser')
    links = soup.find_all('a', href=True)
    print(f'Found {len(links)} links. Scanning for Excel files...')

    for link in links:
        file_link = link['href']
        # Build absolute URL (handles relative links)
        full_url = urljoin(url, file_link)

        if 'documentID=' not in full_url:
            continue
        else:
            doc_id = full_url.split('documentID=')[1].split('&')[0]

        filename = doc_id

        print(f'Processing URL: {full_url} (document id: {doc_id})')
        try:
            file_response = requests.get(full_url)
            file_response.raise_for_status()
        except requests.RequestException as e:
            print(f'Failed to download {full_url}: {e}')
            continue

        content_type = file_response.headers.get('Content-Type', '').lower()
        if 'vnd.openxmlformats-officedocument.spreadsheetml.sheet' in content_type:
            ext = '.xlsx'
        elif 'vnd.ms-excel' in content_type or 'excel' in content_type:
            ext = '.xls'
        else:
            continue

        filename += ext
        file_path = os.path.join(download_folder, str(year), filename)
        try:
            with open(file_path, 'wb') as file:
                file.write(file_response.content)
            print(f'Saved file: {file_path}')
            downloaded_files[doc_id] = link.contents[0]
        except IOError as e:
            print(f'Error saving file {file_path}: {e}')
    return downloaded_files


if __name__ == '__main__':
    BASE_URL = 'https://www.statistics.gr/el/statistics/-/publication/SHE03/{}'

    file_map = {}
    year = 1998
    while True:
        downloaded = download_xls_files(year)
        if not downloaded:
            break
        else:
            file_map[year] = downloaded
            year += 1

    with open('filemap.json', 'w', encoding='utf8') as f:
        json.dump(file_map, f, indent=4, ensure_ascii=False)
