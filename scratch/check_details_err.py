import json
import os

def main():
    json_path = r"c:\Users\sasag\Desktop\ZET STEFAN\lint_output.json"
    with open(json_path, 'r', encoding='utf-16') as f:
        data = json.load(f)
        
    for entry in data:
        if "PropertyDetails.jsx" in entry.get("filePath", ""):
            print("File:", entry["filePath"])
            for msg in entry["messages"]:
                print(f"Line: {msg.get('line')}, Message: {repr(msg.get('message'))[:200]}")

if __name__ == "__main__":
    main()
