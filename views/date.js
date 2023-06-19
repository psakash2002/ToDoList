module.exports = getDate;
function getDate(){
let today = new Date();
    options={
        month:"long",
        day:"numeric",
        weekday:"long"
    }
    let currentday = today.toLocaleDateString("en-US",options);
    return currentday;
}