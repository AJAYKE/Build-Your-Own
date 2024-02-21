import sys
import os

def check_for_brackets(brackets):
    return brackets[0] == '{' and brackets[-1] == '}' 

def check_for_json(content):
    brackets = list(content)
    if not check_for_brackets(brackets):
        return 0
    return 1

if len(sys.argv) < 2:
    print("Usage: python my_json_parser.py <directory_path>")
    sys.exit(1)

directory = sys.argv[1]

if not os.path.isdir(directory):
    print("Error: The specified directory does not exist.")
    sys.exit(1)

files = os.listdir(sys.argv[1])

for file in files:
    file_path = os.path.join(directory, file)
    content = open(file_path,'r').read()
    try:
        res = check_for_json(content)
    except:
        res = 0
    print(file, res)