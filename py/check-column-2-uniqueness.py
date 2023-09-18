# def check_unique_column(file_path):
#     with open(file_path, 'r') as f:
#         lines = f.readlines()
#         col2_values = [line.split('\t')[1].strip() for line in lines if '\t' in line]
        
#         if len(col2_values) == len(set(col2_values)):
#             print("All values in column 2 are unique.")
#         else:
#             print("Some values in column 2 are not unique.")

# file_path = "src/fa/book_names.txt"  # Replace with your file path
# check_unique_column(file_path)


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
            print("All values in column 2 are unique.")
        else:
            print("Some values in column 2 are not unique. The duplicates are:")
            for dup in duplicates:
                print(dup)

file_path = "src/fa/book_names.txt"  # Replace with your file path
check_unique_column(file_path)
