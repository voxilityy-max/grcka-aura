with open(r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\PropertyDetails.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- Around line 500 ---")
for idx in range(495, 515):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")

print("--- Around line 580 ---")
for idx in range(570, 595):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")
