import json
import os

def main():
    json_path = r"c:\Users\sasag\Desktop\ZET STEFAN\lint_output.json"
    out_path = r"c:\Users\sasag\Desktop\ZET STEFAN\scratch\full_eslint_summary.txt"
    if not os.path.exists(json_path):
        print("lint_output.json does not exist")
        return
        
    try:
        with open(json_path, 'r', encoding='utf-16') as f:
            data = json.load(f)
    except Exception as e:
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e2:
            print("Failed with UTF-16:", e)
            print("Failed with UTF-8:", e2)
            return

    lines = []
    lines.append("=== ESLINT ERROR AUDIT ===")
    total_errors = 0
    total_warnings = 0
    
    for file_entry in data:
        filepath = file_entry.get("filePath", "")
        messages = file_entry.get("messages", [])
        if not messages:
            continue
            
        rel_path = os.path.relpath(filepath, r"c:\Users\sasag\Desktop\ZET STEFAN")
        lines.append(f"\nFile: {rel_path} ({len(messages)} issues)")
        
        for msg in messages:
            severity = "ERROR" if msg.get("severity") == 2 else "WARNING"
            if severity == "ERROR":
                total_errors += 1
            else:
                total_warnings += 1
                
            line = msg.get("line")
            col = msg.get("column")
            rule = msg.get("ruleId")
            text = msg.get("message")
            
            lines.append(f"  [{severity}] Line {line}:{col} | {rule} | {text}")
            
    lines.append(f"\nTotal: {total_errors} errors, {total_warnings} warnings\n")
    
    output_text = "\n".join(lines)
    with open(out_path, 'w', encoding='utf-8') as out_f:
        out_f.write(output_text)
    print(f"Written summary to {out_path}. Total: {total_errors} errors, {total_warnings} warnings.")

if __name__ == "__main__":
    main()
