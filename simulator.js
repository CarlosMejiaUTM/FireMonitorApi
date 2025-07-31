// --- CONFIGURACIÓN ---
// ¡IMPORTANTE! Reemplaza esta cadena con un token de autenticación válido.
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiYWRtaW4iLCJzdWIiOiJRUG13TjhpRzNBc3pFWEd4RnE5SyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDAwMTA4MCwiZXhwIjoxNzU0MDg3NDgwfQ.h_k3_MCokmidLs_2boLqZY5adVeC_1p4V19ed92v3EI';

const apiBaseUrl = 'https://firemonitorapi.onrender.com';

const nodeIds = {
  repetidor: '82QJZnVZjXgmxf39fqgK',
  central: 'tyYIw8EYlbJDsNr6nmiu',
};

/**
 * Función para enviar una petición de heartbeat a un nodo específico.
 * @param {string} nodeId - El ID del nodo.
 * @param {string} token - El token de autenticación JWT.
 */
async function sendHeartbeat(nodeId, token) {
  const url = `${apiBaseUrl}/nodes/${nodeId}/heartbeat`;
  console.log(`Enviando heartbeat para el nodo: ${nodeId}...`);

  try {
    const response = await fetch(url, {
      method: 'PATCH', // Usamos PATCH como se definió en el backend.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Header de autenticación.
      },
      body: JSON.stringify({}), // El cuerpo puede ir vacío.
    });

    if (response.ok) {
      // Si la respuesta es 2xx (ej. 200 OK)
          const data = await response.json();
          console.log(`✅ Heartbeat exitoso para ${nodeId}:`, data);
        }
      } catch (error) {
        console.error(`❌ Error al enviar heartbeat para ${nodeId}:`, error);
      }
    }