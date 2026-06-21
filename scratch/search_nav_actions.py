import re

with open("src/App.css", "r", encoding="utf-8") as f:
    content = f.read()

# Find all blocks in CSS
blocks = re.findall(r'([^{]+)\{([^}]+)\}', content)

print("Found selectors matching nav-actions:")
for selector, body in blocks:
    if "nav-actions" in selector:
        print(f"Selector: {selector.strip()}")
        print(f"Body:\n{body.strip()}")
        print("-" * 40)
