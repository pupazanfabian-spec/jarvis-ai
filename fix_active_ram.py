
import sys
import os

file_path = r'C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\core\ACTIVE_RAM.md'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update frontmatter
content = content.replace("actualizat: '2026-05-17'", "actualizat: 2026-05-15")
content = content.replace("actualizat: 2026-05-17", "actualizat: 2026-05-15")

# Find and replace the task section
import re
pattern = r"## .* Context Task Curent\n- .*Task:.*?\n- .*Obiectiv:.*"
replacement = "## 🧠 Context Task Curent\n- Task: Audit și verificare sistem BRAIN\n- Obiectiv: Verificare corectitudine reguli, structură și consistență vault"

content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("ACTIVE_RAM.md updated successfully.")
