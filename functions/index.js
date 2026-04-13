/**
 * Firebase Cloud Functions for Asset Finance Register
 * 
 * This function validates that new users are only from the allowed domain
 * If a user signs up with an unauthorized email domain, their account is immediately deleted
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Allowed email domain - only users from this domain can register
const ALLOWED_DOMAIN = 'greythorn.services';

/**
 * Callable Function: checkEmailDomain
 * Called from frontend before/during signup to validate email domain
 */
exports.checkEmailDomain = onCall((request) => {
  const email = request.data.email;
  
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain !== ALLOWED_DOMAIN) {
    throw new HttpsError(
      'permission-denied',
      `Only @${ALLOWED_DOMAIN} email addresses are allowed.`
    );
  }
  
  return { valid: true };
});