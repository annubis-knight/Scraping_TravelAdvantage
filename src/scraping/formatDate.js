function formatDate(date) {
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

function getCurrentDateTime() {
    const now = new Date();
    const date = formatDate(now);
    const time = now.toTimeString().split(' ')[0].slice(0, 5); // Format HH:mm
    return `${date} ${time}`;
}

module.exports = { formatDate, getCurrentDateTime};