const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const serviceAccount = require('./gcp-credentials.json');

// --- DATOS DEL ADMINISTRADOR ---
const adminData = {
  nombre: 'Admin',
  apellido: 'FireMonitor',
  usuario: 'admin',
  correo: 'admin@firemonitor.com',
  contrasena: 'admin12345', // Contraseña en texto plano
  role: 'admin',
};
// -----------------------------

// --- Conexión a Firebase ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
// ---------------------------

/**
 * Función principal para crear el admin.
 */
async function createAdminUser() {
  console.log('Iniciando script para crear usuario admin...');
  const usersRef = db.collection('users');

  // 1. Verificar si el admin ya existe
  const snapshot = await usersRef
    .where('usuario', '==', adminData.usuario)
    .get();
  if (!snapshot.empty) {
    console.log('✅ El usuario admin ya existe. No se necesita hacer nada.');
    return;
  }

  // 2. Hashear la contraseña
  console.log('Hasheando contraseña...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(adminData.contrasena, salt);

  // 3. Crear el objeto final para guardar
  const adminToSave = {
    nombre: adminData.nombre,
    apellido: adminData.apellido,
    usuario: adminData.usuario,
    correo: adminData.correo,
    contrasena: hashedPassword, // Guardamos la contraseña hasheada
    role: adminData.role,
  };

  // 4. Guardar en Firestore
  console.log('Creando usuario admin en la base de datos...');
  await usersRef.add(adminToSave);
  console.log('🎉 ¡Usuario admin creado exitosamente!');
  console.log(`-> Usuario: ${adminData.usuario}`);
  console.log(`-> Contraseña: ${adminData.contrasena}`);
}

// Ejecutar la función
createAdminUser().catch(console.error);
