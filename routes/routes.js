const express = require("express");
const router = express.Router();
const Submission = require('../models/history');

const axios = require('axios');
//encodes the code to base64
function encode(str) {
    return btoa(str);
}
//decodes the code from base64
function decode(encodedStr) {
    return atob(encodedStr);
}
async function handlePost(encodedCode, encodedInput, language) {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': '82b3aeacd3mshe010573867cdb84p137843jsn3e4fa42304d1',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            language_id: language,
            source_code: encodedCode,
            stdin: encodedInput
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.token;
    } catch (error) {
        return error;
    }
}



/////////////////////////
async function Output(token) {
    const options = {
        method: 'GET',
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'X-RapidAPI-Key': '82b3aeacd3mshe010573867cdb84p137843jsn3e4fa42304d1',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
    };
    let isProcessing = true;
    let requestCount = 0;
    
    while (isProcessing && requestCount < 5) {
        try {
            const response = await axios.request(options);
            const { status, stdout } = response.data;

            if (status) {
                if (status.description === 'Accepted') {
                    const outp = decode(stdout);
                    return outp;
                    isProcessing = false; 
                } else if (status.description === 'Compilation Error') {
                    const msg = decode(response.data.compile_output);
                    const errorMsg =status.description+"\n"+ msg ;
                    return errorMsg;
                    isProcessing = false; 
                } 
                else{
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    requestCount++; 
                }
            }
        } catch (error) {
            console.error("Error:", error);
            
            break; 
        }
    }

    if (isProcessing) {
        const maxRequestsMsg = "Something went wrong...";
        return maxRequestsMsg;
    }
    
}

////////////////////////



router.post('/submit', async (req, res) => {
    try {
        const { username, language, snipName, code } = req.body;
        const submission = new Submission({
            username,
            language,
            snipName,
            code
        });
        await submission.save();
        res.status(201).send('Submission successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/run', async (req, res) => {
    try{
    const { code, language, stdin } = req.body;
    const encoded_code = encode(code);
    const encoded_input = encode(stdin);
    const token = await handlePost(encoded_code, encoded_input, language);

    if (token) {
        const OutputData = await Output(token);
        res.status(200).json(OutputData);
    } else {
        res.status(500).json({ error: 'Failed to submit code' });
    }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }



});



module.exports = router;