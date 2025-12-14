const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

// Define the API key as a secret parameter
const vehicleApiKey = defineSecret('VEHICLE_API_KEY');

exports.lookupVehicle = onCall(
  { secrets: [vehicleApiKey] },  // IMPORTANT: Bind the secret to the function
  async (request) => {
    console.log('🚀 Function called');
    
    try {
      const registration = request.data?.registration;
      
      console.log('📝 Registration received:', registration);
      
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
      const apiUrl = `https://uk.api.vehicledataglobal.com/r2/lookup?apiKey=${apiKey}&packageName=VehicleDetails&vrm=${cleanReg}`;
      
      console.log('📞 Calling API for registration:', cleanReg);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new HttpsError('internal', `API error: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('✅ API data received');
      
      if (!apiData.responseInformation?.isSuccessStatusCode) {
        throw new HttpsError(
          'not-found', 
          apiData.responseInformation?.statusMessage || 'Vehicle not found'
        );
      }
      
      const vehicleId = apiData.results?.vehicleDetails?.vehicleIdentification;
      
      if (!vehicleId) {
        throw new HttpsError('not-found', 'Vehicle data not available');
      }
      
      return {
        success: true,
        registration: vehicleId.vrm || cleanReg,
        make: vehicleId.dvlaMake || 'Unknown',
        model: vehicleId.dvlaModel || 'Unknown',
        dateFirstRegistered: vehicleId.dateFirstRegistered || vehicleId.dateFirstRegisteredInUk || null
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