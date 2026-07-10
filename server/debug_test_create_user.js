(async () => {
  try {
    const db = require('./config/db');
    const { createUser, findUserByPhone } = require('./models/userModel');
    console.log('DB type:', typeof db);
    // Attempt to create a user
    const result = await createUser({ full_name: 'Debug User', phone: '+19999999999', email: 'debug@example.com', password: 'hashedpassword', role: 'customer' });
    console.log('Create result:', result);
    const found = await findUserByPhone('+19999999999');
    console.log('Found user:', found);
  } catch (err) {
    console.error('Test error:');
    console.error(err && err.stack ? err.stack : err);
  }
})();
