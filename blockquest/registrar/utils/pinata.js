const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Pin JSON data to Pinata
 * @param {Object} jsonData - JSON object to pin
 * @param {String} name - Name for the pinned content
 * @returns {String} IPFS CID
 */
async function pinJSON(jsonData, name = 'data') {
  try {
    const data = JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: {
        name: name,
        keyvalues: {
          app: 'BlockQuest',
          type: 'evidence'
        }
      }
    });

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );

    console.log(`✅ Pinned JSON to Pinata: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Pinata JSON pinning failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Pin file to Pinata
 * @param {String} filePath - Path to file
 * @param {String} name - Name for the pinned content
 * @returns {String} IPFS CID
 */
async function pinFile(filePath, name = 'file') {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const metadata = JSON.stringify({
      name: name,
      keyvalues: {
        app: 'BlockQuest',
        type: 'document'
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity
      }
    );

    console.log(`✅ Pinned file to Pinata: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Pinata file pinning failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get content from Pinata Gateway
 * @param {String} cid - IPFS CID
 * @returns {Object} Content data
 */
async function getContent(cid) {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch from Pinata:', error.message);
    throw error;
  }
}

/**
 * Test Pinata connection
 * @returns {Boolean} Connection status
 */
async function testConnection() {
  try {
    const response = await axios.get(
      `${PINATA_API_URL}/data/testAuthentication`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    console.log('✅ Pinata authentication successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Pinata authentication failed:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  pinJSON,
  pinFile,
  getContent,
  testConnection
};
