import re
import csv
import requests
import io

def extract_sheet_id(url: str) -> str:
    """Extracts the Google Sheet ID from its URL."""
    match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    raise ValueError("Invalid Google Sheet URL")

def fetch_sheet_data(url: str) -> list:
    """
    Fetches data from a public Google Sheet URL.
    Returns a list of dictionaries, one for each row (group).
    
    Expected CSV format (example):
    Group Name, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    Nhóm 1, Miệng, Thực quản, Dạ dày, ...
    """
    sheet_id = extract_sheet_id(url)
    export_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    
    response = requests.get(export_url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch Google Sheet data. Make sure it is public. Status Code: {response.status_code}")
    
    response.encoding = 'utf-8'
    csv_data = response.text
    
    # Parse CSV data
    reader = csv.DictReader(io.StringIO(csv_data))
    
    parsed_data = []
    
    # We find which column represents the group name and which are the answers.
    # We assume 'Group Name' or 'Nhóm' or 'Tên nhóm' might be the first column.
    if not reader.fieldnames:
         raise Exception("The Google Sheet is empty or not formatted correctly.")
            
    group_col = reader.fieldnames[0]
    answer_cols = reader.fieldnames[1:]
    
    for row in reader:
        group_name = row.get(group_col, "Unknown Group")
        answers = {col: row.get(col, "") for col in answer_cols}
        
        parsed_data.append({
            "Group Name": group_name,
            "Answers": answers
        })
        
    return parsed_data
