const bcrypt = require('bcryptjs');

async function hashPassword() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('newpassword', salt);
  console.log('Hashed Password:', hashedPassword);
}

hashPassword();
