import os

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\App.jsx"
    if not os.path.exists(file_path):
        print("App.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace in createMockAdminNotification
    old_notif = """  const createMockAdminNotification = useCallback((message) => {
    const newNotif = {
      id: Date.now(),"""
      
    new_notif = """  const createMockAdminNotification = useCallback((message) => {
    const newNotif = {
      id: getUniqueId(),"""

    # Replace in logActivity
    old_log = """    } else {
      const localLog = { ...newLog, id: Date.now() };"""
      
    new_log = """    } else {
      const localLog = { ...newLog, id: getUniqueId() };"""

    # Replace in handleAddProperty
    old_add = """      const propertyWithApproval = { ...newProperty, isApproved, id: newProperty.id || Date.now() };"""
    new_add = """      const propertyWithApproval = { ...newProperty, isApproved, id: newProperty.id || getUniqueId() };"""

    # We do simple replaces
    replaces = [
        (old_notif, new_notif, "createMockAdminNotification"),
        (old_log, new_log, "logActivity"),
        (old_add, new_add, "handleAddProperty"),
    ]
    
    success_count = 0
    for old, new, name in replaces:
        if old in content:
            content = content.replace(old, new)
            print(f"Successfully replaced in {name}")
            success_count += 1
        else:
            # Try with different whitespace normalization
            old_norm = old.replace("\r\n", "\n").replace("\r", "\n")
            content_norm = content.replace("\r\n", "\n").replace("\r", "\n")
            if old_norm in content_norm:
                content_norm = content_norm.replace(old_norm, new.replace("\r\n", "\n").replace("\r", "\n"))
                content = content_norm
                print(f"Successfully replaced in {name} (normalized)")
                success_count += 1
            else:
                print(f"FAILED to replace in {name}")
                
    if success_count > 0:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Wrote App.jsx changes successfully.")
    else:
        print("No changes made to App.jsx.")

if __name__ == "__main__":
    main()
