const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// --- Credenciales GCP (decodificadas desde Base64) ---
const decodedCredentials = JSON.parse(
  Buffer.from(
    `ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiZmlyZW1vbml0b2RldiIsCiAgInByaXZhdGVfa2V5X2lkIjogImRmNWNhNzhjNTRjMDc2OWE5NDVlNjk3OTg3NDMyZDQ5ZWYzYTc0ZjUiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2QUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktZd2dnU2lBZ0VBQW9JQkFRQ1hBTU9MY3NWWWtwcnRcbkZYTVJmVXFCeGgzOUJKaDIrTmJiUnV0a0tmaERUN0xUQ1EwOTJNN2tpTnJzdTdVTUI5cTQwK3F1NmMyZU4yUHhcbmRvU2Roa0tlSHZKVm9sY1RDTldkMVhML05ORUN4MHB5bXJvdzYzZ1EvR2t6TGxXeHYyTnBIUzFOM1JUNWpwMnBcblJET0dnUXcvRk0zMTFobGZ1UTFtYmZScDhadndZTTVxeEhvSTVBWHFKckFRUTUvZVJ5OWZtVDlMVG9NMHZRbktcblRJZi9iMXQ1R21LN1FpLzhUcHNQbmthd1krQ2Q0QzlGc284clNNUVNZSGQvSWNwM3FTRjczWHdNTTRYU3d0U29cblVnVUZsUUtsTEtLempwVzJ2VDJRTDlsbW13SzFqMjNKRWhOMUU2QkNqZUJJM0FHT0Q5Y1daWk11cFpnVnpxakdcbkFzb1NXQTNEQWdNQkFBRUNnZ0VBU0dTdDJ2OTVuRWFnN3RQdk9DM01tQjNleDZ3NTJpUGZnZjNrb1Q4N3ppMTVcbjZwSDIzclZBTHpGclg3NTRCRjRKbnIyK1VBQTRPMGVMNnpucVIwa1VUQkZERmduLzI5aks3T0hsd1hOVlZ4TXJcblhubE9sV0IyVGhKczd3UWlRbGFpdHNTdHNSd3lUNWh2ZnJSN1RWczEvMUlla2VNRWhDOUlQTml2S2xHU2RMRi9cbjNHVUhFYmRvM3Z4ekJnUjFwaHFYeFFuQVVIbmQ4dFVlWUJyTlVFRytzVVd1bFR5R3BaMlZmS1pMREhjWUE1N09cbkxMbWpTc2RWQzl5SEZLRlQrM3dMMTJhTVhMcWJEQU9URE1wWTRULzJFUkJ4Ri9RQ0RMTlhsNE9MMjZSOHNKSEpcbmZIYVAybDQ0TUNqWk9GZnVEcENyUWdTZHc4cUdmK0k0S1Z3VE1nN2MrUUtCZ1FETjBhZ1VhU3J1WmZjNVVrRS9cbjBPRE10b1BsZFE4dmE5dTlVT2I3UXlLNUhjL1dwWkdnWXY1UGlaY0hranRuYnRBcHgyRnVrcGJSaThIR0hKUHFcbk1uRE1iTG10cVdIYmdFMkdmWUF4ZUZWbGFWTm9tM0ZmOXlxcm1DaG1LcXVVQ3A0bm1hQkZyVFlKc1paUlVCelFcbjdoeko2elVLM3REV082ODZpKy8xc010RUN3S0JnUUM3MGJvVDR5QTc5bHVtT1UxUlAweVpQdUo5VEdLUUpuRFhcblRIMFV6cmlYMGtRNHU3dWlmeDdpeVNHZ3BpWGN0emZNKyt2Q3BSRUlvQTE3c1plOS9HY2llbDJyZGxaYnRnb3JcbldEcHJHcTc0eFNXc0pOcy8xbkxKaTlWUVMzZGREMVBsRHErWEU3Rkt5ZUVRT1F0RldVb3dpV3lQSXVuM3VlQkVcbnRvL2NmODk0S1FLQmdGeGY2dFl1Vld4bUswMTQwM3cyM1k1RHBITUoxT1R0dmRQOFNZOGdGS2VNNzhsZ3lqbDNcbjlMZnlBdTBNL3NodmZkSWlnR0pHUEphVDZVWm5jU085dTg2a1Jibmh1ZC93ZDlzUzNNUlhROHllTnlkT0ROYUxcbmNvVk5aMlJqWmxxdFlVcFlzd3hTcjF3dWJrN1VhL3FCeEQ0RDZPeVdFSmoyZExFTU9ZakY3cFQ5QW9HQVVSbkhcbnVzeXBYNXNLaWlWV01JNGZ1bENBSmxDMGdzQkdtNEVveGJKWjNSenJYb0FhRHBuTHNXdmVQR3RpRUFPQmNkOGFcbk40dGxabzhPSTJwVk5yRmxxMnFoUmVlc2RKK1BscFhiYStJeXliTC9pR3pGeTdRRER1cDFxdDFiWm5DMjdrTEFcbktZRlVYaEg4UURBUm9ObGtncjdraEk0ejcwZHhBdHErRmgyT2Jia0NnWUFCcDhWbEJ1MVNJS1MwcjdDZldkRzFcbmdYTXRMYnVCeE5LcVY3OERlR0RhT1Q0LzNNRzhDbzV1NTlBa09RQjRDOUl2UnErZTl4OGZYU1ZPaXZ2c2YzK0NcbnJzREt0cFptNlJpMzNaREU2NHVaM2xEWVhGTk9FNlZJY2tzVHlhVC9UeTF2ek1wSWhPWHV1Tkt0ckZsOERXdXlcbjhrdWNScVh6Zm9mQ3NSTXVtSHIyUmc9PVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImZpcmViYXNlLWFkbWluc2RrLWZic3ZjQGZpcmVtb25pdG9kZXYuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTA3MTgwNzMxOTM1OTE0OTQyNjUwIiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay1mYnN2YyU0MGZpcmVtb25pdG9kZXYuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K`,
    'base64'
  ).toString('utf-8')
);

// --- Conexión a Firebase ---
admin.initializeApp({
  credential: admin.credential.cert(decodedCredentials),
});
const db = admin.firestore();

// --- DATOS DEL ADMINISTRADOR ---
const adminData = {
  nombre: 'Admin',
  apellido: 'FireMonitor',
  usuario: 'admin',
  correo: 'admin@firemonitor.com',
  contrasena: 'admin12345',
  role: 'admin',
};

/**
 * Función para crear el usuario admin
 */
async function createAdminUser() {
  console.log('Iniciando script para crear usuario admin...');
  const usersRef = db.collection('users');

  // 1. Verificar si ya existe
  const snapshot = await usersRef
    .where('usuario', '==', adminData.usuario)
    .get();
  if (!snapshot.empty) {
    console.log('✅ El usuario admin ya existe.');
    return;
  }

  // 2. Hashear contraseña
  console.log('Hasheando contraseña...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(adminData.contrasena, salt);

  // 3. Guardar en Firestore
  const adminToSave = {
    ...adminData,
    contrasena: hashedPassword,
  };

  console.log('Creando usuario admin...');
  await usersRef.add(adminToSave);
  console.log('🎉 ¡Usuario admin creado con éxito!');
  console.log(`Usuario: ${adminData.usuario}`);
  console.log(`Contraseña: ${adminData.contrasena}`);
}

// Ejecutar
createAdminUser().catch(console.error);
