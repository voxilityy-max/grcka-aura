import json
import os

def main():
    json_path = r"c:\Users\sasag\Desktop\ZET STEFAN\lint_output.json"
    with open(json_path, 'r', encoding='utf-16') as f:
        data = json.load(f)
        
    for entry in data:
        if "InteractiveMap.jsx" in entry.get("filePath", ""):
            print("File:", entry["filePath"])
            print("Messages:", entry["messages"])

if __name__ == "__main__":
    main()
