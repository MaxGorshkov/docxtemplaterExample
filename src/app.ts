const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const fs = require('fs');
const path = require('path');

// Load the docx file as a binary
const content = fs
    .readFileSync(path.resolve(__dirname, '../templates/template1.pptx'), 'binary');

const zip = new PizZip(content);

const doc = new Docxtemplater();
doc.loadZip(zip);

// set the templateVariables
doc.setData({
    first_name: 'John',
    last_name: 'Doe',
    phone: '0652455478',
    description: {
        description: 'New Website',
    },
    rows: [
        {
            name: {
                items: [{ v: 'q' }, { v: 'q' }, { v: 'q' }, { v: '1' }]
            },
            sum1: 1111,
            sum2: 2222,
        },
        {
            name: {
                items: [{ v: 'q' }, { v: 'q' }, { v: 'q' }, { v: '2' }]
            },
            sum1: 3333,
            sum2: 4444,
        }
    ]
});

try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
} catch (error) {
    // The error thrown here contains additional information when logged with
    // JSON.stringify (it contains a properties object containing all suberrors).
    function replaceErrors(key, value) {
        if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function(error, key2) {
                error[key2] = value[key2];
                return error;
            }, {});
        }
        return value;
    }
    console.log(JSON.stringify({error: error}, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join('\n');
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}

const buf = doc.getZip()
             .generate({type: 'nodebuffer'});

// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
fs.writeFileSync(path.resolve(__dirname, 'output1.pptx'), buf);
