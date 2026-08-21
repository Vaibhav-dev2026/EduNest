export function formatDate(dateValue) {
    if (!dateValue) return "Not Available";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Not Available";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

export function generateId(prefix = "EDU") {

    return `${prefix}${Date.now()}`;

}

export function calculateDueFee(

    totalFee,

    paidFee

) {

    return Number(totalFee) - Number(paidFee);

}

export function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +

        text.slice(1).toLowerCase();

}

export function formatCurrency(amount) {

    return new Intl.NumberFormat(

        "en-IN",

        {

            style: "currency",

            currency: "INR"

        }

    ).format(amount);

}

export function debounce(

    callback,

    delay = 500

) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}