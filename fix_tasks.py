
import sys
import os

file_path = r'C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\knowledge\TASKS.md'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update frontmatter status
content = content.replace('status: 5/10 completate', 'status: "8/18 completate"')

# Mark tasks 16, 17, 18
content = content.replace('- **Task 16:** Syntax HUD Formatting.', '- ✅ **Task 16:** Syntax HUD Formatting. **COMPLETAT [2026-05-17]**')
content = content.replace('- **Task 17:** Auto-Backlink cleanup.', '- ✅ **Task 17:** Auto-Backlink cleanup. **COMPLETAT [2026-05-17]**')
content = content.replace('- **Task 18:** Silent Notifications.', '- ✅ **Task 18:** Silent Notifications. **COMPLETAT [2026-05-17]**')

# Remove duplicate inconsistent Task 16
content = content.replace('- 🔴 **Task 16 (PRIORITAR):** [[wiki/knowledge/tasks/TASK-16-GQR]] — Gemini Quota Rotation & Auto-Verification', '')

# Clean up extra newlines if needed
content = content.replace('\n\n\n', '\n\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("TASKS.md updated successfully.")
