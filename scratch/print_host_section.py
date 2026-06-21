with open(r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\HostPanel.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(118, 380):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")
