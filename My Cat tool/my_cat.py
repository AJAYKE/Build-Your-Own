#!/opt/anaconda3/bin/python3

import sys

def printlines():
    for line in sys.stdin:
        print(line,end='')

def printlineswithspaces():
    count = 0
    for line in sys.stdin:
        stripped_line = line.strip()
        count +=1
        if stripped_line:
            print(count, stripped_line)
        else:
            print(count,line, end='')

def printlineswithoutspaces():
    count = 0
    for line in sys.stdin:
        stripped_line=line.strip()
        if stripped_line:
            count += 1
            print(count, stripped_line,end='')
        else:
            print(stripped_line,end='')


files = sys.argv

for i in range(1,len(sys.argv)):
    filename = files[i]
    if filename == '-':
        printlines()
    elif filename == '-n':
        printlineswithspaces()
    elif filename == '-b':
        printlineswithoutspaces()
    else:
        content = ''
        with open(filename,'r') as file:
            content += file.read()
        print(content,end='')

