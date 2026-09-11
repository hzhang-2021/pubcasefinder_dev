let newData = { PCFNo: null };

let notIncludedInNewData = [
  "CASE_INFO",
  "MEDICAL_INFO",
  "MEDICAL_BODY_INFO",
  "PHENOTYPE_INFO",
  "GENOTYPE_INFO",
  "FAMILY_INFO",
];

for (let key in columnKeys) {
  if (notIncludedInNewData.includes(key)) continue;

  if (key.split("_")[0] === "PHENOTYPE" || key.split("_")[0] === "GENOTYPE") {
    newData[columnKeys[key]] = [];
  } else {
    newData[columnKeys[key]] = null;
  }
}

for (let category of categories) {
  for (let column of category.columns) {
    if (column.defaultValue) {
      newData[column.columnId] = column.defaultValue;
    } else if (column.groupBy) {
      newData[column.columnId] = [];
    } else if (column.inputType === "radio" && column.options) {
      newData[column.columnId] =
        column.options[lang]?.[0] || column.options.en[0];
    } else if (!newData[column.columnId]) {
      newData[column.columnId] = null;
    }
  }
}

newData["genotype_analysis"] = "";
