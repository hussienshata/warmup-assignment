const fs = require("fs");


// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================

function toSeconds(time){
    let x = time.split(":");
    let hour = Number(x[0]);
    let mins = Number(x[1]);
    let third = x[2];

    let y = third.split(" ");
    let seconds = Number(y[0]);
    let period = y[1];
    
    if(period){
        
        if (period === "pm" && hour !== 12){
        hour += 12;
        } 

        if (period === "am" && hour === 12){
        hour = 0;
        }
    }

    return (hour * 3600) + (mins * 60) + (seconds);
}

function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let final = toSeconds(endTime) - toSeconds(startTime);
    let finalhours = Math.floor(final / 3600);
    let remaining = final % 3600;
    let finalmins = Math.floor(remaining / 60);
    let finalsecs = remaining % 60;

    if (finalmins < 10) {
    finalmins = "0" + finalmins;
    }

    if (finalsecs < 10) {
    finalsecs = "0" + finalsecs;
    }
    
    let str = finalhours + ":" + finalmins + ":" + finalsecs;
    return str;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    let startseconds = toSeconds(startTime); 
    let endseconds = toSeconds(endTime); 
    let x = 0;

    if(startseconds < 28800){ 
        x = x + (28800 - startseconds); 
    }

    if(endseconds > 79200){ 
        x = x + (endseconds - 79200); 
    } 

    let finalhours = Math.floor(x / 3600); 
    let remaining = x % 3600; 
    let finalmins = Math.floor(remaining / 60); 
    let finalsecs = remaining % 60; 

    if (finalmins < 10) { 
        finalmins = "0" + finalmins; 
    }

    if (finalsecs < 10) { 
        finalsecs = "0" + finalsecs; 
    }

    let str = finalhours + ":" + finalmins + ":" + finalsecs; 
    return str;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    let x = toSeconds(shiftDuration) - toSeconds(idleTime);
    let finalhours = Math.floor(x / 3600); 
    let remaining = x % 3600; 
    let finalmins = Math.floor(remaining / 60); 
    let finalsecs = remaining % 60; 

    if (finalmins < 10) { 
        finalmins = "0" + finalmins; 
    }

    if (finalsecs < 10) { 
        finalsecs = "0" + finalsecs; 
    }

    let str = finalhours + ":" + finalmins + ":" + finalsecs; 
    return str;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
    let array = date.split("-");
    let year = array[0];
    let month = Number(array[1]);
    let day = Number(array[2]);
    let seconds = toSeconds(activeTime);

    if((month == 4) && (day >= 10 && day <= 30)){
        if(seconds >= 21600){
            return true;
        }
    }

    if(seconds >= 30240){
        return true;
    }

    return false;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8");
    let lines = data.trim().split("\n");

    for(let line of lines){
        let parts = line.split(",");

        if(parts[0] === shiftObj.driverID && parts[2] === shiftObj.date){
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let metQuotaResult = metQuota(shiftObj.date, activeTime);

    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: metQuotaResult,
        hasBonus: false
    };

    let newLine = Object.values(newRecord).join(",");

    lines.push(newLine);

    fs.writeFileSync(textFile, lines.join("\n"));

    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8");
    let lines = data.trim().split("\n");

    for(let i = 0; i < lines.length; i++){
        let parts = lines[i].split(",");

        if(parts[0] === driverID && parts[2] === date){
            parts[9] = newValue;
            lines[i] = parts.join(",");
        }
    }
    fs.writeFileSync(textFile, lines.join("\n"));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    let newMonth = Number(month);
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8");
    
    if (data === "") {
        return -1;
    }

    let lines = data.trim().split("\n");
    let driverExists = 0;
    let bonusCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");

        let id = parts[0];
        let date = parts[2];
        let bonus = parts[9].trim();

        if (id === driverID) {
            driverExists++;
            let dateSplit = date.split("-");
            let monthArray = Number(dateSplit[1]);

            if(newMonth === monthArray){
                if(bonus === "true"){
                    bonusCount++
                }
            }
        }    
    }

    if(driverExists === 0){
        return -1;
    }
    
    else{
        return bonusCount;
    }
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    let newMonth = Number(month);
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8");
    let lines = data.trim().split("\n");
    let totalTime = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");

        let id = parts[0];
        let date = parts[2];
        let bonus = parts[9].trim();

        if (id === driverID) {
            let dateSplit = date.split("-");
            let monthArray = Number(dateSplit[1]);

            if(newMonth === monthArray){
               totalTime = totalTime + toSeconds(parts[7]);
            }
        }
    }
    let finalhours = Math.floor(totalTime / 3600); 
    let remaining = totalTime % 3600; 
    let finalmins = Math.floor(remaining / 60); 
    let finalsecs = remaining % 60; 

    if (finalmins < 10) { 
        finalmins = "0" + finalmins; 
    }

    if (finalsecs < 10) { 
        finalsecs = "0" + finalsecs; 
    }

    let str = finalhours + ":" + finalmins + ":" + finalsecs; 
    return str;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
    const fs = require("fs");
    let newMonth = Number(month);

    let data = fs.readFileSync(textFile, "utf8");
    let shiftLine = data.trim().split("\n");

    let data2 = fs.readFileSync(rateFile, "utf8");
    let rateLine = data2.trim().split("\n");
    let dayOff = "";
    let time = 0;

    for(let i = 0; i < rateLine.length; i++){
       let parts = rateLine[i].split(",");
       let id = parts[0]; 
       
       if(id === driverID){
            dayOff = parts[2].trim();
            break;
        }
    
    }

    for (let i = 0; i < shiftLine.length; i++) {
        let line = shiftLine[i].trim();

        if (line === "") {
            continue;
        }

        let parts = line.split(",");
        let id = parts[0];
        let date = parts[2];
        let d = new Date(date);
        let weekday = d.toLocaleDateString("en-US", { weekday: "long" });

        if (id === driverID) {
            let dateSplit = date.split("-");
            let monthArray = Number(dateSplit[1]);
            let dayArray = Number(dateSplit[2]);
            if(newMonth === monthArray){
               if(weekday !== dayOff){
                    if(dayArray >= 10 && dayArray <= 30){
                        time = time + (6 * 3600);
                    }
                    else{
                        time = time + (8 * 3600) + 1440;
                    }
               }
            }
        }
    }
    time = time - (bonusCount * 2 * 3600);
    let finalhours = Math.floor(time / 3600);
    let remaining = time % 3600;
    let finalmins = Math.floor(remaining / 60);
    let finalsecs = remaining % 60;

    if (finalmins < 10) {
    finalmins = "0" + finalmins;
    }

    if (finalsecs < 10) {
    finalsecs = "0" + finalsecs;
    }
    
    let str = finalhours + ":" + finalmins + ":" + finalsecs;
    return str;

}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
    const fs = require("fs");

    let data2 = fs.readFileSync(rateFile, "utf8");
    let rateLine = data2.trim().split("\n");

    let actualHoursSeconds = toSeconds(actualHours);
    let requiredHoursSeconds = toSeconds(requiredHours);

    let tier = 0;
    let basepay = 0

    for(let i = 0; i < rateLine.length; i++){
        let parts = rateLine[i].split(",");
        let id = parts[0];
        
        if(id === driverID){
            tier = Number(parts[3]);
            basepay = Number(parts[2]);
            break;
        }
    }

    let allowedMissingSeconds = 0;

    if(tier === 1){
        allowedMissingSeconds = 50 * 3600;
    }

    else if(tier === 2){
        allowedMissingSeconds = 20 * 3600;
    }

    else if(tier === 3){
        allowedMissingSeconds = 10 * 3600;
    }
    
    else{
        allowedMissingSeconds = 4 * 3600;
    }

    let seconds = actualHoursSeconds - requiredHoursSeconds + allowedMissingSeconds;
    let netpay = 0;
    if(seconds >= 0){
        netpay = basepay;
    }
    else{
        let missinghours = Math.floor(Math.abs(seconds) / 3600);
        let deductionRatePerHour = basepay / 185;
        let salaryDeduction = missinghours * deductionRatePerHour;
        netpay = basepay - salaryDeduction;
    }
    return Math.round(netpay);
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
