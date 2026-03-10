import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const tipo = searchParams.get("tipo"); // 'expedicion_entrega' o 'devolucion_recogida'

    if (!fecha || !tipo) {
      return NextResponse.json(
        { error: "Fecha y tipo son requeridos" },
        { status: 400 },
      );
    }

    function applyAjuste(item: any): any {
      // Apply ajuste values to cajas if it exists
      if (item.ajuste) {
        return {
          ...item,
          cajas: {
            blancas:
              (item.cajas?.blancas ?? 0) + (item.ajuste.cajas?.blancas ?? 0),
            negras:
              (item.cajas?.negras ?? 0) + (item.ajuste.cajas?.negras ?? 0),
            verdes:
              (item.cajas?.verdes ?? 0) + (item.ajuste.cajas?.verdes ?? 0),
          },
          cajas_rotas: {
            blancas:
              (item.cajas_rotas?.blancas ?? 0) +
              (item.ajuste.cajas_rotas?.blancas ?? 0),
            negras:
              (item.cajas_rotas?.negras ?? 0) +
              (item.ajuste.cajas_rotas?.negras ?? 0),
            verdes:
              (item.cajas_rotas?.verdes ?? 0) +
              (item.ajuste.cajas_rotas?.verdes ?? 0),
          },
          tapas_rotas: {
            blancas:
              (item.tapas_rotas?.blancas ?? 0) +
              (item.ajuste.tapas_rotas?.blancas ?? 0),
            negras:
              (item.tapas_rotas?.negras ?? 0) +
              (item.ajuste.tapas_rotas?.negras ?? 0),
            verdes:
              (item.tapas_rotas?.verdes ?? 0) +
              (item.ajuste.tapas_rotas?.verdes ?? 0),
          },
          ajuste: item.ajuste.nombre || "",
        };
      }
      return item;
    }

    function sumCajas(
      actuales: { blancas: any; negras: any; verdes: any },
      nuevas: { blancas: number; negras: number; verdes: number },
    ): { blancas: number; negras: number; verdes: number } {
      return {
        blancas: (actuales?.blancas ?? 0) + (nuevas.blancas ?? 0),
        negras: (actuales?.negras ?? 0) + (nuevas.negras ?? 0),
        verdes: (actuales?.verdes ?? 0) + (nuevas.verdes ?? 0),
      };
    }

    function appendNombre(actual: string, nuevo: string): string {
      if (!actual) {
        return nuevo;
      }
      if (actual.includes(nuevo)) {
        return actual;
      }
      return actual + " + " + nuevo;
    }

    function alertCompare(event1: any, event2: any): boolean {
      if (!event1 || !event2) {
        return true; // Si falta uno de los eventos, marcar alerta
      } else {
        // Ambos existen, comparar
        return (
          event1?.cajas?.blancas !== event2?.cajas?.blancas ||
          event1?.cajas?.negras !== event2?.cajas?.negras ||
          event1?.cajas?.verdes !== event2?.cajas?.verdes
        );
      }
    }

    function alertCompareRotura(event1: any, event2: any): boolean {
      return (
        event1?.cajas_rotas?.blancas !== event2?.cajas_rotas?.blancas ||
        event1?.cajas_rotas?.negras !== event2?.cajas_rotas?.negras ||
        event1?.cajas_rotas?.verdes !== event2?.cajas_rotas?.verdes ||
        event1?.tapas_rotas?.blancas !== event2?.tapas_rotas?.blancas ||
        event1?.tapas_rotas?.negras !== event2?.tapas_rotas?.negras ||
        event1?.tapas_rotas?.verdes !== event2?.tapas_rotas?.verdes
      );
    }

    function alertRotura(event1: any, event2: any): boolean {
      return (
        event1?.cajas_rotas?.blancas > 0 ||
        event1?.cajas_rotas?.negras > 0 ||
        event1?.cajas_rotas?.verdes > 0 ||
        event1?.tapas_rotas?.blancas > 0 ||
        event1?.tapas_rotas?.negras > 0 ||
        event1?.tapas_rotas?.verdes > 0 ||
        event2?.cajas_rotas?.blancas > 0 ||
        event2?.cajas_rotas?.negras > 0 ||
        event2?.cajas_rotas?.verdes > 0 ||
        event2?.tapas_rotas?.blancas > 0 ||
        event2?.tapas_rotas?.negras > 0 ||
        event2?.tapas_rotas?.verdes > 0
      );
    }

    const { db } = await connectToDatabase();

    if (tipo === "expedicion_entrega") {
      // Obtener expediciones y entregas
      const expediciones = (
        await db.collection("Expedicion").find({ fecha }).toArray()
      ).map(applyAjuste);

      const entregas = (
        await db.collection("Entrega").find({ fecha }).toArray()
      ).map(applyAjuste);

      // Agrupar por centro de distribución
      const centrosExp = new Map();

      for (const current of expediciones) {
        const centro = current.centro_distribucion;
        if (!centrosExp.has(centro)) {
          centrosExp.set(centro, {
            centro_distribucion: centro,
            almacen: current.almacen,
            chapa: null,
            expedicion: {
              nombre: current.nombre,
              cajas: current.cajas,
              ajuste: current.ajuste || "",
            },
            entrega: null,
            alerta: false,
          });
        } else {
          const item = centrosExp.get(centro);
          item.almacen = appendNombre(item.almacen, current.almacen);
          item.expedicion = {
            nombre: appendNombre(item.expedicion?.nombre, current.nombre),
            cajas: sumCajas(item.expedicion?.cajas, current.cajas),
            ajuste: appendNombre(item.expedicion?.ajuste, current.ajuste || ""),
          };
        }
      }

      for (const current of entregas) {
        const centro = current.centro_distribucion;
        if (!centrosExp.has(centro)) {
          centrosExp.set(centro, {
            centro_distribucion: centro,
            chapa: current.chapa,
            expedicion: null,
            entrega: {
              nombre: current.nombre,
              cajas: current.cajas,
              ajuste: current.ajuste || "",
            },
            alerta: true,
          });
        } else {
          const item = centrosExp.get(centro);
          item.chapa = appendNombre(item.chapa, current.chapa);
          item.entrega = {
            nombre: appendNombre(item.entrega?.nombre, current.nombre),
            cajas: sumCajas(item.entrega?.cajas, current.cajas),
            ajuste: appendNombre(item.entrega?.ajuste, current.ajuste || ""),
          };
        }
      }

      // Verificar inconsistencias
      const resultados = Array.from(centrosExp.values()).map((item) => {
        item.alerta = alertCompare(item.expedicion, item.entrega);
        return item;
      });

      return NextResponse.json(resultados);
    } else if (tipo === "devolucion_recogida") {
      // Obtener devoluciones y recogidas
      const recogidas = (
        await db.collection("Recogida").find({ fecha }).toArray()
      ).map(applyAjuste);

      const devoluciones = (
        await db.collection("Devolucion").find({ fecha }).toArray()
      ).map(applyAjuste);

      // Agrupar por centro de distribución
      const centrosRec = new Map();

      for (const current of recogidas) {
        const centro = current.centro_distribucion;
        if (!centrosRec.has(centro)) {
          centrosRec.set(centro, {
            centro_distribucion: centro,
            chapa: current.chapa,
            recogida: {
              nombre: current.nombre,
              cajas: current.cajas,
              cajas_rotas: current.cajas_rotas,
              tapas_rotas: current.tapas_rotas,
              ajuste: current.ajuste || "",
            },
            devolucion: null,
            alerta: false,
            rotura: false,
          });
        } else {
          const item = centrosRec.get(centro);
          item.chapa = appendNombre(item.chapa, current.chapa);
          item.recogida = {
            nombre: appendNombre(item.recogida?.nombre, current.nombre),
            cajas: sumCajas(item.recogida?.cajas, current.cajas),
            cajas_rotas: sumCajas(
              item.recogida?.cajas_rotas,
              current.cajas_rotas,
            ),
            tapas_rotas: sumCajas(
              item.recogida?.tapas_rotas,
              current.tapas_rotas,
            ),
            ajuste: appendNombre(item.recogida?.ajuste, current.ajuste || ""),
          };
        }
      }

      for (const current of devoluciones) {
        const centro = current.centro_distribucion;
        if (!centrosRec.has(centro)) {
          centrosRec.set(centro, {
            centro_distribucion: centro,
            almacen: current.almacen,
            chapa: null,
            recogida: null,
            devolucion: {
              nombre: current.nombre,
              cajas: current.cajas,
              cajas_rotas: current.cajas_rotas,
              tapas_rotas: current.tapas_rotas,
              ajuste: current.ajuste || "",
            },
            alerta: false,
            rotura: false,
          });
        } else {
          const item = centrosRec.get(centro);
          item.almacen = appendNombre(item.almacen, current.almacen);
          item.devolucion = {
            nombre: appendNombre(item.devolucion?.nombre, current.nombre),
            cajas: sumCajas(item.devolucion?.cajas, current.cajas),
            cajas_rotas: sumCajas(
              item.devolucion?.cajas_rotas,
              current.cajas_rotas,
            ),
            tapas_rotas: sumCajas(
              item.devolucion?.tapas_rotas,
              current.tapas_rotas,
            ),
            ajuste: appendNombre(item.devolucion?.ajuste, current.ajuste || ""),
          };
        }
      }

      // Verificar inconsistencias
      const resultados = Array.from(centrosRec.values()).map((item) => {
        item.alerta =
          alertCompare(item.recogida, item.devolucion) ||
          alertCompareRotura(item.recogida, item.devolucion);
        item.rotura = alertRotura(item.recogida, item.devolucion);
        return item;
      });

      return NextResponse.json(resultados);
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Error comparing events:", error);
    return NextResponse.json(
      { error: "Error al comparar eventos" },
      { status: 500 },
    );
  }
}
