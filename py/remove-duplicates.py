def sort_file(file_name):
    with open(file_name, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Remove duplicates
    unique_lines = list(set(lines))

    # Sort by first column, then by second column
    sorted_lines = sorted(unique_lines, key=lambda x: (x.split('\t')[0], x.split('\t')[1]))

    with open('../src/fa/book_names.txt', 'w', encoding='utf-8') as f:
        for line in sorted_lines:
            f.write(line)

# Use the function
sort_file('../src/fa/book_names.txt')
