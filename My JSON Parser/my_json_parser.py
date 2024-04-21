import sys
import os

def check_for_brackets(brackets):
    return brackets[0] == '{' and brackets[-1] == '}' 

def check_string_keys_and_string_values(string_keys_and_values):
    print(string_keys_and_values)
    for pair in string_keys_and_values:
        key_value = pair.split(":")
        print(pair, key_value)
        if not (type(key_value[0].strip()) == str and type(key_value[1].strip()) == str):
            print(key_value[0].strip(), type(key_value[0].strip()))
            return 0
    return 1

def check_for_json(content):
    brackets = list(content)
    if not check_for_brackets(brackets):
        print(brackets,brackets[0], brackets[-1])
        print("failed in brackets")
        return 0
    
    string_keys_and_values = content[1:-1].split(',')

    print(content, brackets, string_keys_and_values)

    if not check_string_keys_and_string_values(string_keys_and_values):
        print("failed in strings")
        return 0
    return 1


directory = 'tests/step2'

files = os.listdir(directory)

for file in files:
    file_path = os.path.join(directory, file)
    content = open(file_path,'r').read()
    try:
        res = check_for_json(content)
    except Exception as error:
        print(error)
        res = 0
    print(file, res)