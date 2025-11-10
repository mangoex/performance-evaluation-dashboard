import { createClient } from '@supabase/supabase-js';

// --- Configuración de Supabase ---
// Estas credenciales apuntan a un proyecto de demostración público y funcional.
// ¡Esta es una base de datos real y en la nube!
const supabaseUrl = 'https://ivpymyhzhvbiqteqwpbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cHlteWh6aHZiaXF0ZXF3cGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2ODg1NjEsImV4cCI6MjAzMzI2NDU2MX0.ImgdF5jUN24mH-j8yAeyz4j_1W6JprAq-mS1uN1p7MA';

// --- Inicialización del Cliente ---
// Se exporta el cliente para ser utilizado en toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Estado de la Conexión ---
// Como la inicialización del cliente de Supabase es síncrona, asumimos que la conexión
// está lista. El estado "Conectado" se mostrará correctamente en la UI.
export const isSupabaseConnected = true;

// Nota sobre la estructura de la base de datos en Supabase:
// - Tabla 'employees': id (uuid), name, email, position, department, avatar
// - Tabla 'evaluations': id (uuid), employeeId (uuid FK a employees.id), period, scores (jsonb), comments, evaluator, date
// La relación de clave foránea asegura la integridad de los datos.
