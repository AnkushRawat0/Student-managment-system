/**
 * 🧪 CSRF Protection Test Suite
 * 
 * Comprehensive tests to verify CSRF protection is working correctly
 */

import { NextRequest } from 'next/server';
import { 
  generateCSRFToken, 
  generateCSRFTokenPair, 
  validateCSRFToken,
  generateCSRFTokenResponse,
  validateCSRFRequest,
  validateOrigin,
  extractCSRFToken,
  getCSRFTokenFromCookies
} from './src/lib/csrf';

// Test colors for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color: string, message: string) {
  console.log(`${color}${message}${RESET}`);
}

function testResult(testName: string, passed: boolean, details?: string) {
  const status = passed ? `${GREEN}✅ PASSED` : `${RED}❌ FAILED`;
  log(RESET, `${status} - ${testName}`);
  if (details) {
    log(YELLOW, `   ${details}`);
  }
}

async function runCSRFTests() {
  log(BLUE, '\n🛡️ Starting CSRF Protection Tests\n');

  // Test 1: Token Generation
  log(YELLOW, '1. Testing Token Generation...');
  try {
    const token = generateCSRFToken();
    testResult('Token generation', Boolean(token && token.length === 64), `Generated token: ${token.substring(0, 16)}...`);
    
    const tokenPair = generateCSRFTokenPair();
    testResult('Token pair generation', 
      Boolean(tokenPair.token && tokenPair.hashedToken && 
      tokenPair.token.length === 64 && tokenPair.hashedToken.length === 64),
      `Token: ${tokenPair.token.substring(0, 16)}..., Hash: ${tokenPair.hashedToken.substring(0, 16)}...`
    );

    // Test 2: Token Validation
    log(YELLOW, '\n2. Testing Token Validation...');
    const validResult = validateCSRFToken(tokenPair.token, tokenPair.hashedToken);
    testResult('Valid token validation', validResult === true, 'Correct token should validate');

    const invalidResult = validateCSRFToken('invalid-token', tokenPair.hashedToken);
    testResult('Invalid token rejection', invalidResult === false, 'Invalid token should be rejected');

    const emptyResult = validateCSRFToken('', '');
    testResult('Empty token rejection', emptyResult === false, 'Empty tokens should be rejected');

  } catch (error) {
    testResult('Token generation tests', false, `Error: ${error}`);
  }

  // Test 3: Origin Validation
  log(YELLOW, '\n3. Testing Origin Validation...');
  try {
    // Create mock NextRequest objects
    const validOriginRequest = new NextRequest('http://localhost:3000/test', {
      headers: { 'origin': 'http://localhost:3000' }
    });
    
    const invalidOriginRequest = new NextRequest('http://localhost:3000/test', {
      headers: { 'origin': 'https://evil.com' }
    });

    const noOriginRequest = new NextRequest('http://localhost:3000/test');

    testResult('Valid origin acceptance', validateOrigin(validOriginRequest), 'localhost:3000 should be allowed');
    testResult('Invalid origin rejection', !validateOrigin(invalidOriginRequest), 'evil.com should be blocked');
    testResult('No origin handling', validateOrigin(noOriginRequest), 'Requests without origin should pass (for same-origin)');

  } catch (error) {
    testResult('Origin validation tests', false, `Error: ${error}`);
  }

  // Test 4: CSRF Response Generation
  log(YELLOW, '\n4. Testing CSRF Response Generation...');
  try {
    const response = await generateCSRFTokenResponse();
    const responseText = await response.text();
    const responseData = JSON.parse(responseText);

    testResult('CSRF response generation', 
      response.status === 200 && responseData.csrfToken,
      `Response: ${response.status}, Token present: ${!!responseData.csrfToken}`
    );

    const setCookieHeader = response.headers.get('Set-Cookie');
    testResult('CSRF cookie setting', 
      !!setCookieHeader && setCookieHeader.includes('csrf-token'),
      `Set-Cookie header: ${setCookieHeader ? 'Present' : 'Missing'}`
    );

  } catch (error) {
    testResult('CSRF response tests', false, `Error: ${error}`);
  }

  // Test 5: Full Request Validation
  log(YELLOW, '\n5. Testing Full Request Validation...');
  try {
    // Test GET request (should pass without CSRF)
    const getRequest = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET'
    });

    const getResult = await validateCSRFRequest(getRequest);
    testResult('GET request bypass', getResult.valid === true, 'GET requests should bypass CSRF validation');

    // Test POST request without CSRF (should fail)
    const postRequestNoCSRF = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'origin': 'http://localhost:3000' }
    });

    const postResult = await validateCSRFRequest(postRequestNoCSRF);
    testResult('POST request without CSRF', 
      Boolean(postResult.valid === false && postResult.error?.includes('CSRF token missing')),
      `Error: ${postResult.error}`
    );

  } catch (error) {
    testResult('Request validation tests', false, `Error: ${error}`);
  }

  log(BLUE, '\n🎉 CSRF Protection Tests Complete!\n');
}

// Export for use in other test files
export { runCSRFTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCSRFTests().catch(console.error);
}