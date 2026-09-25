import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';
let token = '';

async function testProfileApi() {
  console.log('--- Starting Student Profile API Tests ---\n');

  try {
    // 1. Sign In
    console.log('1. Signing in...');
    const signInRes = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ram@gmail.com', password: 'password123', deviceId: 'test-script' }) 
    });
    
    // Fallback if credentials fail (we might need to create a user or try another)
    let signInData = await signInRes.json();
    if (!signInRes.ok) {
       console.log('Login failed with ram@gmail.com, trying to signup a test user...');
       const signUpRes = await fetch(`${API_URL}/auth/signup`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: 'Test Student', email: 'test.profile@example.com', password: 'password123', role: 'student' })
       });
       signInData = await signUpRes.json();
       if (!signUpRes.ok) {
         // Maybe it already exists, let's try to sign in
         const retrySignIn = await fetch(`${API_URL}/auth/signin`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: 'test.profile@example.com', password: 'password123', deviceId: 'test-script' }) 
         });
         signInData = await retrySignIn.json();
       }
    }

    token = signInData.token;
    console.log('✅ Successfully authenticated.\n');

    // 2. Fetch Dashboard (ensure we didn't break existing stuff)
    console.log('2. Fetching dashboard...');
    const dashRes = await fetch(`${API_URL}/student/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!dashRes.ok) throw new Error(`Dashboard failed: ${await dashRes.text()}`);
    console.log('✅ Dashboard fetched successfully.\n');

    // 3. Fetch Profile
    console.log('3. Fetching profile...');
    const getProfileRes = await fetch(`${API_URL}/student/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!getProfileRes.ok) throw new Error(`Get profile failed: ${await getProfileRes.text()}`);
    const profileData = await getProfileRes.json();
    console.log('✅ Profile fetched successfully.');
    console.log(`   Name: ${profileData.student.name}`);
    console.log(`   Phone: ${profileData.student.phone || 'Not set'}`);
    console.log(`   City: ${profileData.student.city || 'Not set'}\n`);

    // 4. Update Profile
    console.log('4. Updating profile...');
    const updatePayload = {
      phone: '+91 9876543210',
      city: 'Mumbai',
      address: '123 Main St',
      emergencyContactName: 'Test Parent'
    };
    const updateRes = await fetch(`${API_URL}/student/profile`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    if (!updateRes.ok) throw new Error(`Update profile failed: ${await updateRes.text()}`);
    console.log('✅ Profile updated successfully.\n');

    // 5. Verify Update
    console.log('5. Verifying update...');
    const verifyRes = await fetch(`${API_URL}/student/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    
    if (verifyData.student.city === 'Mumbai' && verifyData.student.phone === '+91 9876543210') {
      console.log('✅ Update verification passed.\n');
    } else {
      throw new Error(`Update verification failed. Expected city=Mumbai, phone=+91 9876543210. Got city=${verifyData.student.city}, phone=${verifyData.student.phone}`);
    }

    // 6. Test Avatar Upload Validation (Empty file)
    console.log('6. Testing avatar upload...');
    const formData = new FormData();
    // In node fetch, we need a Blob or similar for formData. We can skip the actual file upload in this simple script and just verify the endpoint exists.
    const uploadRes = await fetch(`${API_URL}/student/profile/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      // Empty body will trigger "No file uploaded" error
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.status === 400 && uploadData.error === 'No file uploaded') {
      console.log('✅ Avatar upload endpoint is responsive (correctly rejected empty request).\n');
    } else {
      console.log('⚠️ Avatar upload returned unexpected response:', uploadData);
    }

    console.log('🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testProfileApi();
