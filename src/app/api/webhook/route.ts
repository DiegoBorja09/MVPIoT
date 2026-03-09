import { NextRequest } from 'next/server';
import { webhookPayloadSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { parseValue, parseDate } from '@/lib/utils';
import { jsonSuccess, handleApiError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = webhookPayloadSchema.parse(body);

    await prisma.device.upsert({
      where: { device_id: validated.device_id },
      update: {},
      create: {
        device_id: validated.device_id,
        thing_id: validated.thing_id,
        webhook_id: validated.webhook_id,
      },
    });

    // Procesar cada value
    const results = [];

    for (const value of validated.values) {
      // Crear o actualizar Property
      const property = await prisma.property.upsert({
        where: {
          device_id_name: {
            device_id: validated.device_id,
            name: value.name,
          },
        },
        update: {},
        create: {
          device_id: validated.device_id,
          name: value.name,
          type: parseValue(value.value).value_number !== null ? 'number' :
                parseValue(value.value).value_boolean !== null ? 'boolean' : 'string',
        },
      });

      // Parsear el valor
      const parsed = parseValue(value.value);
      const updatedAt = parseDate(value.updated_at);

      // Crear PropertyValue (con idempotencia por unique constraint)
      try {
        const propertyValue = await prisma.propertyValue.create({
          data: {
            event_id: validated.event_id,
            device_id: validated.device_id,
            property_id: property.id,
            value_raw: value.value,
            value_number: parsed.value_number,
            value_boolean: parsed.value_boolean,
            value_string: parsed.value_string,
            persist: value.persist,
            updated_at: updatedAt,
            created_by: value.created_by,
          },
        });
        results.push({ success: true, propertyValue });
      } catch (error: any) {
        // Si es error de duplicado, ignorar (idempotencia)
        if (error.code === 'P2002') {
          results.push({ success: true, duplicate: true });
        } else {
          throw error;
        }
      }
    }

    return jsonSuccess({
      processed: results.length,
      results,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
