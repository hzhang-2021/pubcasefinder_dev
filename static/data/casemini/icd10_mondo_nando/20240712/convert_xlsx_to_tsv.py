import openpyxl
import csv
import argparse

# 设置命令行参数解析
parser = argparse.ArgumentParser(description='Convert XLSX to UTF-8 TSV.')
parser.add_argument('input_file', help='Path to the input XLSX file')
parser.add_argument('output_file', help='Path to the output TSV file')
args = parser.parse_args()

# 打开 Excel 文件
wb = openpyxl.load_workbook(args.input_file)

# 打开一个输出文件并设置为 UTF-8 编码
with open(args.output_file, 'w', newline='', encoding='utf-8') as tsvfile:
    tsv_writer = csv.writer(tsvfile, delimiter='=', lineterminator='\n')

    # 遍历所有工作表
    for sheet in wb.worksheets:
        print(f"Processing sheet: {sheet.title}")
        for row in sheet.iter_rows(values_only=True):
            # 将每一行写入 TSV 文件
            tsv_writer.writerow(row)

print("Conversion completed.")

