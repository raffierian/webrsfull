import bcrypt from 'bcryptjs';

// Get password from command line argument or use default
const password = process.argv[2] || 'doctor123';

console.log('\n🔐 Password Hasher\n');
console.log('Password:', password);

const hash = bcrypt.hashSync(password, 10);
console.log('Hashed:', hash);

console.log('\n✅ Copy the hashed password above to use in database!\n');
