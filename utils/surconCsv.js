export function downloadCSV(data, filename = 'Surcon.csv') {
  
    console.log('downloadCSV called')
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Data must be a non-empty array');
      return;
    }
  
    const fields = [
       'users.name', // Nested
      'application_type',
      'area',
      'client_name',
      'land_use',
      'location',
      'pillar_no',
      'plan_number',
      'quarter',

    ];
  
    const getValue = (obj, path) => {
      return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
    };
  
    const csvContent = [
      fields.join(','), // headers
      ...data.map(row =>
        fields.map(field => {
          const value = getValue(row, field);
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
  