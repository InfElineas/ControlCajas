/**
 * Script para poblar la base de datos con datos de ejemplo
 * Ejecutar con: node scripts/seed.js
 */

const { MongoClient } = require("mongodb");

const MONGODB_URI =
  "mongodb+srv://informaticoelineas6_db_user:Informatico*789@cajascluster.qjorpm7.mongodb.net/ControlCajas";

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("ControlCajas");

    console.log("Limpiando colecciones existentes...");

    // Limpiar colecciones
    const colecciones = [
      "CentroDistribucion",
      "Usuario",
      "Vehiculo",
      "Expedicion",
      "Entrega",
      "Devolucion",
      "Recogida",
    ];
    for (const col of colecciones) {
      const collection = db.collection(col);
      await collection.deleteMany({});
    }

    // Insertar Centros de Distribución
    console.log("Insertando centros de distribución...");
    const centrosDb = db.collection("CentroDistribucion");
    await centrosDb.insertMany([
      { nombre: "Centro Lima", deuda: 0 },
      { nombre: "Centro Arequipa", deuda: 0 },
      { nombre: "Centro Trujillo", deuda: 0 },
      { nombre: "Centro Cusco", deuda: 0 },
    ]);

    // Insertar Vehículos
    console.log("Insertando vehículos...");
    const vehiculosDb = db.collection("Vehiculo");
    await vehiculosDb.insertMany([
      {
        chapa: "ABC-001",
        marca: "Volvo",
        modelo: "FH16",
        tipo_chapa: "Placa Normal",
        categoria: "Camión",
      },
      {
        chapa: "ABC-002",
        marca: "Hyundai",
        modelo: "HD85",
        tipo_chapa: "Placa Normal",
        categoria: "Camión",
      },
      {
        chapa: "ABC-003",
        marca: "Volkswagen",
        modelo: "Delivery",
        tipo_chapa: "Placa Normal",
        categoria: "Furgón",
      },
      {
        chapa: "ABC-004",
        marca: "Isuzu",
        modelo: "NPR",
        tipo_chapa: "Placa Normal",
        categoria: "Camión",
      },
    ]);

    console.log("✓ Base de datos poblada exitosamente");
    console.log("\nDatos de ejemplo creados:");
    console.log("- 4 Centros de Distribución");
    console.log("- 4 Vehículos");
    console.log(
      "\nPuedes crear usuarios a través de la aplicación web (http://localhost:3000/registro)",
    );
  } catch (error) {
    console.error("Error durante el seed:", error);
  } finally {
    await client.close();
  }
}

await seed();
