import argparse
import sys

parser = argparse.ArgumentParser(
    prog='my_wc.py',
    usage='$(prog)s [options] FILE [FILE...]', #usage string options are the below optional arguments and FILE or list of FILE define the files argument
    description='Print number of lines, words, bytes and characters in each file',
)
# Defining a positional argument named "files"
parser.add_argument(
    "files",#name of the argument
    metavar='FILE',#name to display in the help message
    default="", #default value if the value is not provided
    type=str, #the type of argument if passed
    nargs="*", #allows the argument to accept 0 or more values
    help= "take a file or list of files",
)
# Defining an optional argument for counting lines
parser.add_argument(
    '-l', #short name of the argument
    '--lines', #long name of the argument both are accepted
    default=False, #default value is set to false
    action="store_true", #when the argument is passed the action is set to True
    help='prints the number of lines in the file',
)
parser.add_argument(
    "-c",
    "--bytes",
    default=False,
    action="store_true",
    help='Prints the number of bytes in the given file',
)
parser.add_argument(
    "-w",
    "--words",
    default=False,
    action="store_true",
    help="Prints number of words in the file",
)
parser.add_argument(
    "-m",
    "--characters",
    default=False,
    action="store_true",
    help="converts byte string to text"
)

def get_count_of_bytes(content): #since the conent is the sequence of bytes the len argument returns the size considering all the byte characters.
    return len(content)

def get_count_of_lines(content): #b'\n' creates a byte literal instead of string literal coz we are reading data as byte sequence
    return len(content.split(b'\n'))-1

def get_count_of_words(content): #split bydefault splits the string at whitespaces (spaces, tabs, newline)
    return len(content.split()) 

def get_count_of_characters(conent): #this converts byteobject to text with utf-8 encoding which is the sequence of characters data.
    return len(conent.decode('utf-8', errors="ignore"))

def wrapper(function,content):
    global res
    temp_res = function(content)
    res += f"{temp_res} "



def get_the_params(content):
    if not any([args.lines, args.words, args.bytes, args.characters]):
        wrapper(get_count_of_lines, content)
        wrapper(get_count_of_words, content)
        wrapper(get_count_of_bytes, content)
    else:
        
        if args.lines:
            wrapper(get_count_of_lines, content)
        
        if args.words:
            wrapper(get_count_of_words, content)
        
        if args.bytes:
            wrapper(get_count_of_bytes, content)
        
        if args.characters:
            wrapper(get_count_of_characters, content)

args = parser.parse_args()

for file in args.files:
    res = ""
    with open(file, 'rb') as filename: #'rb' reads the data as the sequence of bytes, where as 'r' reads the data as sequence of characters
        content1 = filename.read()
        get_the_params(content1)
    
    res += f"{file}"
    print(res, end ='\n')

if not args.files:
    res = ""
    if sys.stdin: #buffer lets you read the input in the binary form
        content = sys.stdin.buffer.read()
        get_the_params(content)
        print(res, end ='\n')



