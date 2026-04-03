export function formatDate(dateString) {
    if (!dateString) {
        return "N/A";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "N/A";
    }
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}


export function formatDateForTime(isoString) {
    const date = new Date(isoString);

    console.log("new date : ", date)

    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata' // 👈 Ensures UTC time instead of local
    };
    const formatted = date.toLocaleString('en-US', options);
    const [monthDay, Year, time] = formatted.split(', ');

    const [month, day] = monthDay.split(' ');


    return `${day} ${month} ${Year} at ${time}`;
}