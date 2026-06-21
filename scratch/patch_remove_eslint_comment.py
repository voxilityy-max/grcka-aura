import os

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\PropertyDetails.jsx"
    if not os.path.exists(file_path):
        print("PropertyDetails.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # We want to replace the eslint disable comment line
    old_comment = "// eslint-disable-next-line react-hooks/set-state-in-effect"
    
    if old_comment in content:
        # We also want to remove any extra newlines around it if they were introduced
        content = content.replace(old_comment + "\n", "")
        content = content.replace(old_comment, "")
        print("Successfully removed eslint-disable comment")
    else:
        # Try normalized
        content_norm = content.replace("\r\n", "\n").replace("\r", "\n")
        if old_comment in content_norm:
            content_norm = content_norm.replace(old_comment + "\n", "")
            content_norm = content_norm.replace(old_comment, "")
            content = content_norm
            print("Successfully removed eslint-disable comment (normalized)")
            
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched successfully.")

if __name__ == "__main__":
    main()
