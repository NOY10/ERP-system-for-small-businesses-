import readXlsxFile from "read-excel-file/browser";

const normalizeCell = (cell) => (cell == null ? "" : String(cell).trim());

const rowsToObjects = (rows) => {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) {
    return [];
  }

  const headers = headerRow.map(normalizeCell);

  return dataRows
    .filter((row) => row.some((cell) => normalizeCell(cell) !== ""))
    .map((row) =>
      headers.reduce((entry, header, index) => {
        if (header) {
          entry[header] = row[index] ?? "";
        }
        return entry;
      }, {})
    );
};

const parseDelimitedText = (text, delimiter) => {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) =>
      line
        .split(delimiter)
        .map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"').trim())
    );

  return rowsToObjects(rows);
};

export const readImportFile = async (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || extension === "tsv") {
    const text = await file.text();
    return parseDelimitedText(text, extension === "tsv" ? "\t" : ",");
  }

  if (extension === "xlsx") {
    const rows = await readXlsxFile(file);
    return rowsToObjects(rows);
  }

  throw new Error("Unsupported file format. Please upload a CSV, TSV, or XLSX file.");
};
