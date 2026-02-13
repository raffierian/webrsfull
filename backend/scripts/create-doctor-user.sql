-- ✅ READY-TO-RUN SQL Script
-- Password: doctor123
-- Hashed: $2a$10$.T.KldJTZkgVh/F9IOsJt.PPrSfGwXxtaQdBVu2lIArraTBeIW

-- Step 1: Create Doctor User
INSERT INTO users (id, username, email, password, name, role, phone, created_at, updated_at)
VALUES (
  'doctor-user-001',
  'dr.soewandhie',
  'doctor@rssoewandhie.com',
  '$2a$10$.T.KldJTZkgVh/F9IOsJt.PPrSfGwXxtaQdBVu2lIArraTBeIW',
  'Dr. Soewandhie',
  'DOCTOR',
  '08123456789',
  NOW(),
  NOW()
);

-- Step 2: Create Doctor Profile
INSERT INTO doctors (id, user_id, name, specialization, phone, email, created_at, updated_at)
VALUES (
  'doctor-profile-001',
  'doctor-user-001',
  'Dr. Soewandhie',
  'Dokter Umum',
  '08123456789',
  'doctor@rssoewandhie.com',
  NOW(),
  NOW()
);

-- Step 3: Verify (should return 1 row)
SELECT 
  u.id,
  u.username,
  u.name as user_name,
  u.role,
  d.id as doctor_id,
  d.name as doctor_name,
  d.specialization
FROM users u
LEFT JOIN doctors d ON d.user_id = u.id
WHERE u.role = 'DOCTOR';
