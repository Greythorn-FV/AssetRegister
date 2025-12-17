// File: functions/index.js
// FIXED: API key now in header, not URL

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

// Define the API key as a secret parameter
const vehicleApiKey = defineSecret('VEHICLE_API_KEY');

exports.lookupVehicle = onCall(
  { secrets: [vehicleApiKey] },
  async (request) => {
    console.log('🚀 Function called');
    
    try {
      const registration = request.data?.registration;
      
      console.log('🔍 Registration received:', registration);
      
      if (!registration || typeof registration !== 'string') {
        console.log('❌ Registration validation failed');
        throw new HttpsError(
          'invalid-argument',
          'Registration number is required'
        );
      }
      
      const apiKey = vehicleApiKey.value();
      
      console.log('🔑 API key exists:', !!apiKey);
      
      if (!apiKey) {
        throw new HttpsError(
          'failed-precondition',
          'API key not configured'
        );
      }
      
      const cleanReg = registration.replace(/\s/g, '').toUpperCase();
      
      // FIXED: API key in header, NOT in URL
      const apiUrl = `https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleData?v=2&api_nullitems=1&auth_apikey=${apiKey}&user_tag=&key_VRM=${cleanReg}`;
      
      console.log('📞 Calling API for registration:', cleanReg);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // API key is in the URL for UK Vehicle Data's specific endpoint
        }
      });
      
      console.log('📥 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new HttpsError('internal', `API error: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('✅ API data received:', JSON.stringify(apiData).substring(0, 200));
      
      // UK Vehicle Data response structure
      if (apiData.Response?.StatusCode !== 'Success') {
        throw new HttpsError(
          'not-found', 
          apiData.Response?.StatusMessage || 'Vehicle not found'
        );
      }
      
      const vehicleData = apiData.Response?.DataItems;
      
      if (!vehicleData) {
        throw new HttpsError('not-found', 'Vehicle data not available');
      }
      
      return {
        success: true,
        registration: vehicleData.Vrm || cleanReg,
        make: vehicleData.Make || 'Unknown',
        model: vehicleData.Model || 'Unknown',
        colour: vehicleData.Colour || null,
        fuelType: vehicleData.FuelType || null,
        yearOfManufacture: vehicleData.YearOfManufacture || null,
        dateFirstRegistered: vehicleData.DateFirstRegistered || null
      };
      
    } catch (error) {
      console.error('❌ Lookup error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to lookup vehicle: ' + error.message);
    }
  }
);