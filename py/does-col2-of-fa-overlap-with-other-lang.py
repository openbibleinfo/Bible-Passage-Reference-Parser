import os

def check_unique_column(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
        col2_values = [line.split('\t')[1].strip() for line in lines if '\t' in line]
        
        # Finding non-unique values
        unique_values = set()
        duplicates = set()

        for value in col2_values:
            if value in unique_values:
                duplicates.add(value)
            else:
                unique_values.add(value)

        if len(duplicates) == 0:
            return True, []
        else:
            return False, list(duplicates)

def search_and_check_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if "book_names.txt" in filenames:
            file_path = os.path.join(dirpath, "book_names.txt")
            is_unique, duplicates = check_unique_column(file_path)
            
            # Extracting the language name from the directory path
            language = os.path.basename(dirpath)
            
            if is_unique:
                #print(f"All values in column 2 for the language '{language}' are unique.")
                pass
            else:
                print(f"Some values in column 2 for the language '{language}' are not unique. The duplicates are:")
                for dup in duplicates:
                    print(dup)


root_dir = "src/"
search_and_check_files(root_dir)
