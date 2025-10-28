

/**
 * Generates and triggers a download for a CSV file.
 * @param filename The name of the file to be downloaded (e.g., 'data.csv').
 * @param headers An array of strings representing the column headers.
 * @param data An optional 2D array of strings representing the rows and cells of the CSV.
 */
export const downloadCSV = (filename: string, headers: string[], data: (string | number)[][] = []) => {
    // RFC 4180 compliant CSV cell escaping
    const escapeCell = (cell: string | number) => {
        const strCell = String(cell);
        if (strCell.includes('"') || strCell.includes(',') || strCell.includes('\n')) {
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };

    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(escapeCell).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Create a downloadable URL for the blob
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    
    // Append, click, and remove the link to trigger the download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
};
