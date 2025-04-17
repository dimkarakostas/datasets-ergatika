import os
import re
import json
import pandas as pd


START_YEAR = 2000
END_YEAR = 2023


filename_mapping = {
    'Εργατικά ατυχήματα κατά είδος τραυματισμού και ποσοστιαία κατανομή τους': 'injuries_by_type',
    'Εργατικά ατυχήματα ανάλογα με το μέρος του σώματος που τραυματίστηκε και ποσοστιαία κατανομή τους': 'injuries_by_body_part',
    'Εργατικά ατυχήματα κατά ομάδες ηλικιών και ποσοστιαία κατανομή τους': 'injuries_by_age',
    'Εργατικά ατυχήματα κατά επάγγελμα του παθόντος και περιφέρειας που συνέβη το ατύχημα': 'injuries_by_profession',
    'Εργατικά ατυχήματα κατά κλάδο οικονομικής δραστηριότητας της τοπικής μονάδας του εργοδότη και περιφέρειας που συνέβη το ατύχημα': 'injuries_by_workplace_type',
}


def write_data_to_file(data_type, data):
    fname = filename_mapping[data_type]
    with open(f'data/{fname}.json', 'w', encoding='utf8') as f:
        for dct in data.values():
            keys_to_replace = []
            for old_key in dct.keys():
                new_key = old_key.replace('  ', ' ').replace(' - years', '').replace(' - and over', '').replace(' unknown age', '').replace(' -up to 15 years', '').strip()
                keys_to_replace.append([old_key, new_key])
            for old_key, new_key in keys_to_replace:
                dct[new_key] = dct.pop(old_key)
        json.dump(data, f, indent=4, ensure_ascii=False)


def sanitize_datasheet_name(val):
    return val.strip().rstrip('.').strip().replace(',', '').replace('  ', ' ')[val.find('Εργατικά'):].replace('ποσοστιαία κατανομή αυτών', 'ποσοστιαία κατανομή τους').replace('ΥΠΑ', 'περιφέρειας')


def find_common_datasheets():
    with open('filemap.json') as f:
        file_map = json.load(f)

    dataset_types = {}
    for year in range(START_YEAR, END_YEAR):
        dct = file_map[str(year)]
        dataset_types[year] = set()
        for val in dct.values():
            analysis_type = sanitize_datasheet_name(val)
            dataset_types[year].add(analysis_type)

    return set.intersection(*[dataset_types[year] for year in range(START_YEAR, END_YEAR)])


def is_integer_val(val):
    """
    Check if the value represents an integer.
    Returns True if the value is an int type or a float with no fractional part.
    """
    try:
        # Check if already an integer.
        if isinstance(val, int):
            return True
        # If it's a float and its fractional part is 0.
        if isinstance(val, float) and val.is_integer():
            return True
        if int(val.replace("'", '')):
            return True
        return False
    except Exception:
        return False


def parse_excel_files(year, filename):
    try:
        try:
            file_path = os.path.join('downloads', str(year), filename + '.xls')
            df = pd.read_excel(file_path)
        except FileNotFoundError:
            file_path = os.path.join('downloads', str(year), filename + '.xlsx')
            df = pd.read_excel(file_path)
    except Exception as e:
        print(f'Error processing file {year}/{filename}: {e}')
        return

    # drop all NaN (empty) cells
    df_clean = df.dropna(how='all')

    # To find where the table starts within the sheet,
    # find the cell whose value (without whitespaces) is one of ['Σύνολο', 'ΣΥΝΟΛΟ']
    # _and_ where the first cell on the right of this cell with a non-empty value contains an integer
    matching_indices = []
    num_rows, num_cols = df_clean.shape
    for i in range(num_rows):
        for j in range(num_cols - 1):
            current_cell = df_clean.iat[i, j]
            processed_value = re.sub(r'\s+', '', str(current_cell))
            if processed_value in ['Σύνολο', 'ΣΥΝΟΛΟ']:
                step = 1
                right_cell = df_clean.iat[i, j+step]
                while str(right_cell) == 'nan':
                    step += 1
                    right_cell = df_clean.iat[i, j+step]
                if is_integer_val(right_cell):
                    matching_indices.append((i, j))

    total_cell = matching_indices[0]

    table_df = df_clean.iloc[total_cell[0]:, total_cell[1]:]
    table = []
    for row_idx, row in table_df.iterrows():
        table.append([])
        for col_idx, cell in row.items():
            if str(cell) != 'nan':
                table[-1].append(str(cell))

    # In some cases, the identifier is split in two spreadsheet lines,
    # where the second line has no corresponding values.
    for i in reversed(range(1, len(table))):
        if len(table[i]) == 1:
            table[i-1][0] = str(table[i-1][0]) + str(table[i][0])
            table.pop(i)

    # However, also in some cases, after the table there is a description
    # of the health agency, so we want to remove that
    for row in table[1:]:
        row[0] = row[0].split('Τμήμα Στατιστικών Υγείας')[0].strip()

    total = int(table[0][1])

    injuries = {}
    for row in table[1:]:
        if row[1] != 'nan':
            try:
                injuries[row[0]] = int(row[1])
            except ValueError as e:
                # In one spreadsheet, a row was squashed, but not deleted
                # which has a string as the key and a string in the position of
                # the number - ignore this particular case and throw otherwise
                if 'invalid literal for int' in str(e):
                    pass
                else:
                    raise e
        if sum(injuries.values()) == total:
            break
    return injuries


if __name__ == '__main__':
    with open('filemap.json') as f:
        file_map = json.load(f)

    common_types = sorted(find_common_datasheets())
    for elem in common_types:
        if elem.endswith(')'):
            common_types.remove(elem)
    for elem in common_types:
        print(elem)
    print(f'Total: {len(common_types)}')
    for data_type in common_types:
        print(data_type)
        data = {}
        year = START_YEAR
        while True:
            downloads_folder = f'downloads/{year}'
            if not os.path.exists(downloads_folder):
                break
            for key, value in file_map[str(year)].items():
                if data_type == sanitize_datasheet_name(value):
                    filename = str(key)
                    break
            print(f'Parsing {year}/{filename}')
            injuries = parse_excel_files(year, filename)
            if injuries:
                data[year] = injuries
            year += 1
        write_data_to_file(data_type, data)
