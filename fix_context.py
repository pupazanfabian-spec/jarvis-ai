
import sys
import os

file_path = r'C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\core\CONTEXT.md'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_section = """## Proiecte active
- [[wiki/knowledge/projects/jarvis]] — aplicație mobilă React Native, agent AI personal"""

new_section = """## Proiecte active
- [[wiki/knowledge/projects/jarvis]] — aplicație mobilă React Native, agent AI personal (în așteptare)
- **Proiect activ sesiune curentă:** audit și optimizare sistem BRAIN"""

if old_section in content:
    content = content.replace(old_section, new_section)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("CONTEXT.md updated successfully.")
else:
    # Try with different line endings
    old_section_lf = old_section.replace('\r\n', '\n')
    if old_section_lf in content.replace('\r\n', '\n'):
         content = content.replace('\r\n', '\n').replace(old_section_lf, new_section)
         with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
         print("CONTEXT.md updated successfully (LF).")
    else:
        print("Active projects section not found in CONTEXT.md")
