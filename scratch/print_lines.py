with open(r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\PropertyDetails.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for idx in range(270, 310):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")
