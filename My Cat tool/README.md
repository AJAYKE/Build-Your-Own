Build your own UNIX tool.
The challenge: https://codingchallenges.fyi/challenges/challenge-cat
Now we are going to build own own custom unix CAT tool on Mac. This Unix command is used to read files predominantly. If you are on a Unix system open the terminal and type 
```
% cat /path/to/somefile.txt
```
this will print the contents of the given file (somefile.txt). On Windows 'type' tool does the same. Now we will build our custom CAT tool in Mac. I am using Python, you can use any language.
Step 1: Basic Cat Tool
Create a Python file: Start by creating a Python file, for example, my_cat.py.
Shebang line: Add the path to your language interpreter. To get the path, open the terminal and type
```
which python3
```
This will give the interpreter path, my file is at '/opt/anaconda3/bin/python3'. I added '#!' before which informs the system about the interpreter path.
#!/opt/anaconda3/bin/python3
3. Read file content: Let's add some basic functionality and then set up the custom cat tool.
```
#!/opt/anaconda3/bin/python3

import sys

filename = sys.argv[1]
with open(filename,'r') as file:
  content = file.read()
print(content)
```
Now try running this file
```
%python my_cat.py test.txt 
```
this will print the contents of test.txt.
here sys.argv will have ['my_cat.py', 'test.txt'] so we will always take from the first element onwards instead of 0. If you had given sys.argv[0], it will print its code.
4. Make it executable: Now let's make it add it to the unix commands. open the terminal, navigate to the folder where this Python file at and enter
```
chmod +x my_cat.py
```
chmod +x => change the mode of the file 'my_cat.py' to executable. It adds permission for this file to execute as a Unix command. 
5. Create a symbolic link: Run the following line in the terminal
```
sudo ln -s /path/to/my_cat.py /usr/local/bin/mycat
```
This command will add it as a Unix command mycat.
sudo: as super admin
ln: create the link between files (between my_cat.py and mycat), whenever u run mycat, it will execute my_cat.py
-s: ensures symbolic links

Now you are all set.
In your terminal, run mycat test.txt, it will print the contents of the file.
```
% mycat test.txt
```
Optional:
We are done with the initial step above.
Step 2: Concatenate Files
In this step, your goal is to read the input from the standard in and concatenate files
```
#!/opt/anaconda3/bin/python3

import sys

def printlines():
    for line in sys.stdin:  #Here we read the input from the standard input.
        print(line, end='')

files = sys.argv

for i in range(1,len(sys.argv)):
    filename = files[i]
    if filename == '-':
        printlines()
    else:
        content = ''
        with open(filename,'r') as file:
            content += file.read()
        print(content,end='')
```
you can test it like this:
```
head -n1 test.txt | mycat - test.txt
```
head -n1 test.txt will give the first line of the test.txt,
if command1 | command2
| operator ensures the output of the command1 is feed into the command2
so firstline is passed as standard input to the mycat -, 
my_cat.py checks the '-' in the files and calls the printlines function.
Step 3: Numbered Lines
Number the lines as they're printed out, both including(-n) and excluding non-blank(-b) lines
#!/opt/anaconda3/bin/python3
```
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
```
You can test this with:
```
sed G test.txt | cccat -n | head -n4
sed G test.txt | cccat -b | head -n5
```
sed G adds blank lines in the test.txt.
That's it, we are done with the challenge too. Your custom mycat tool can handle basic file reading, concatenation, and numbering lines based on different conditions.
