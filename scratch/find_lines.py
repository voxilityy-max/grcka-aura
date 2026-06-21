with open(r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\PropertyDetails.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    
for i, line in enumerate(lines):
    if "invalidateSize" in line or "setSelectedRoom" in line or "setInquiryName" in line:
        print(f"Line {i+1}: {repr(line)}")
