import os

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\ProfileTab.jsx"
    if not os.path.exists(file_path):
        print("ProfileTab.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace React import at start
    content = content.replace("import React, { useState } from 'react';", "import { useState } from 'react';")
    
    # Replace catch (err)
    content = content.replace("} catch (err) {", "} catch {")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched ProfileTab.jsx successfully!")

if __name__ == "__main__":
    main()
