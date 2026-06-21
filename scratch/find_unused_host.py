with open(r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\HostPanel.jsx", "r", encoding="utf-8") as f:
    content = f.read()

vars_to_check = [
    'queryLoading', 'editingRow', 'dbResetMessage', 'dbLatency',
    'handleSaveSnippet', 'handleDeleteSnippet', 'handleResetDb',
    'handleExportDb', 'handleExportCsv', 'openEditRow',
    'saveEditedRow', 'deleteRow'
]

for v in vars_to_check:
    count = content.count(v)
    print(f"{v}: count = {count}")
