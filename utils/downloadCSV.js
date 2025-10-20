import * as XLSX from 'xlsx';

export function downloadCSV(data, filename = 'applications.xlsx') {
  
    console.log('downloadCSV called')
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Data must be a non-empty array');
      return;
    }
  
    const fields = [
      'name',
      'application_type',
      'area',
      'client_name',
      'land_use',
      'location',
      'mds_fee',
      'pillar_no',
      'plan_number',
      'quarter',
    ];
  
    const getValue = (obj, path) => {
      return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
    };
  
    const worksheetData = [
      fields, // headers
      ...data.map(row =>
        fields.map(field => getValue(row, field))
      )
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    const xlsxContent = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
    const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  