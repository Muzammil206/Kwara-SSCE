export const downloadSampleCSV = () => {
  try {
    const sampleData = [
      { Easting: "671375.408", Northing: "937153.835" },
      { Easting: "671404.571", Northing: "937151.614" },
      { Easting: "671398.527", Northing: "937079.948" },
      { Easting: "671367.91", Northing: "937088.584" },
      { Easting: "671375.408", Northing: "937153.835" }
    ];

    // Convert array to CSV string
    const headers = ["Easting", "Northing"];
    const csvRows = [
      headers.join(','),
      ...sampleData.map(row => headers.map(header => row[header]).join(','))
    ];
    const csvString = csvRows.join('\n');

    // Create and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'sample_coordinates.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading CSV:', error);
    toast.error('Failed to download sample coordinates');
  }
}
