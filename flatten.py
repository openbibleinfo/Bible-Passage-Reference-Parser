from collections import defaultdict

# Define the input and output file paths
input_file_path = 'src/fa/book_names.txt'
output_file_path = 'src/fa/data_out.txt'

# Create a dictionary to store the flattened values
data_dict = defaultdict(list)

# Define the order for column 1 values
order = [
    "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam",
    "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", 
    "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", 
    "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", 
    "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", 
    "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim",
    "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John",
    "3John", "Jude", "Rev", "Tob", "Jdt", "GkEsth", "Wis", "Sir", "Bar", 
    "PrAzar", "Sus", "Bel", "SgThree", "EpJer", "1Macc", "2Macc", "3Macc",
    "4Macc", "1Esd", "2Esd", "PrMan"
]

# Read the input file and populate the dictionary
with open(input_file_path, 'r', encoding="utf-8") as infile:
    for line in infile:
        col1, col2 = line.strip().split('\t')
        data_dict[col1].append(col2)

# Write the flattened data to the output file in the specified order
with open(output_file_path, 'w', encoding="utf-8") as outfile:
    for key in order:
        if key in data_dict:
            outfile.write(key + '\t' + '\t'.join(data_dict[key]) + '\n')
