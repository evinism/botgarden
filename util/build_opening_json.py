import os
import re
import json
import secrets

path = os.path.dirname(os.path.abspath(__file__))


with open(path + "/openings.txt") as f:
  openings = f.read()


openings = re.sub(r';[^\n]*\n', '\n', openings) # Remove comments
openings = re.sub(r'\s*\n\s*', '\n', openings) # Remove trailing whitespace
openings = re.sub(r'^\s*', '', openings)
openings = re.sub(r'\s*$', '', openings)

# ---
lines = openings.split('\n')
compressed = []
def is_title_line(line):
  return re.match(r'^[A-Z][0-9]+', line)
for line in lines:
  if is_title_line(line) or is_title_line(compressed[-1]):
    compressed.append(line)
  else:
    compressed[-1] = compressed[-1] + " " + line
openings = "\n".join(compressed)
# ---

lines = openings.split("\n")
moves = []
for idx in range(len(lines)):
  line = lines[idx]
  if (idx%2 == 0):
    splicepoint = line.index(" ")
    moves.append({
      "id": secrets.token_hex(4),
      "code": line[0:splicepoint],
      "description": line[splicepoint:].strip(),
    })
  else:
    line = line.replace('1/2', '').strip()
    moves[-1]['line'] = line

with open(path + "/../src/openings.json", 'w') as f:
  json.dump(moves, f, indent=2)