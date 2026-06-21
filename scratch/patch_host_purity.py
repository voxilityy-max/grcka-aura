import os

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\HostPanel.jsx"
    if not os.path.exists(file_path):
        print("HostPanel.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace API_URL declaration to add getUniqueId
    old_api = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';"
    new_api = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';\nconst getUniqueId = () => Date.now();"
    
    content = content.replace(old_api, new_api)
    
    # Replace id: Date.now() inside the add property submit
    # We do a flexible replacement
    old_id = """    const newProperty = {
      ...formData,
      id: Date.now(),"""
      
    new_id = """    const newProperty = {
      ...formData,
      id: getUniqueId(),"""
      
    if old_id in content:
        content = content.replace(old_id, new_id)
        print("Replaced Date.now() successfully")
    else:
        # Try with normalization
        old_id_norm = old_id.replace("\r\n", "\n").replace("\r", "\n")
        content_norm = content.replace("\r\n", "\n").replace("\r", "\n")
        if old_id_norm in content_norm:
            content_norm = content_norm.replace(old_id_norm, new_id.replace("\r\n", "\n").replace("\r", "\n"))
            content = content_norm
            print("Replaced Date.now() successfully (normalized)")
        else:
            print("FAILED to replace Date.now()")
            
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched HostPanel.jsx for purity successfully.")

if __name__ == "__main__":
    main()
