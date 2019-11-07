const process = require('process');
const fs = require('fs');
const parse = require('csv-parse')

// Gets CSV filename from the list of arguments or defaults to false
const csvFilename = process.argv[2] || false;

// Gets JSON filename from the list of arguments or defaults to false
const jsonFilename = process.argv[3] || false;

/**
 * Prints the error on console and gives information about script usage
 * 
 * @param {string} message 
 */
const printError = (message) => {
    console.log("\n");
    console.error(message);
    console.log(`Usage: node ${process.argv[1]} SOURCE.csv DESTINATION.json`);
    console.log("\n");
}

if (!csvFilename) {
    printError('Error: No CSV file was provided.')
    return;
}

if (!jsonFilename) {
    printError('Error: No JSON file was provided.')
    return;
}

/**
 * Prepares user email
 * 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} postalCode 
 */
const getUserEmail = (firstName, lastName, postalCode) => {
    const emailString = firstName + lastName + postalCode;
    const buffer = Buffer.from(emailString, 'utf8');
    const base64String = buffer.toString('base64');

    return `dmblacklist${base64String}@thirdlove.com`;
}


/**
 * Parser initialization options
 */
const options = {
    from_line: 2,
    delimiter: ',',
    record_delimiter: '\r\n',
    trim: true,
    skip_empty_lines: true
}

/**
 * Prepares data from requirements to be exported as json
 * 
 * @param {array} records 
 */
const processCsv = (records) => {
    const formatted = records.map(record => {
        return {
            first_name: record[0],
            last_name: record[1],
            address1: record[2],
            address2: record[3],
            city: record[4],
            state: record[5],
            postal_code: record[6],
            email: getUserEmail(record[0], record[1], record[6])
        }
    })

    let jsonData = JSON.stringify(formatted);
    fs.writeFileSync(`${__dirname}/${jsonFilename}`, jsonData);
}

const parser = parse(options, (err, records) => processCsv(records));

fs.createReadStream(`${__dirname}/${csvFilename}`).pipe(parser);