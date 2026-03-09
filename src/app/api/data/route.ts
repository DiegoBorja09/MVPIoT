import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('device_id');
    const propertyName = searchParams.get('property');
    const range = searchParams.get('range') || '1H'; // 15D, 7D, 1D, 1H, LIVE

    console.log('[DATA API] Request params:', { deviceId, propertyName, range });

    if (!deviceId || !propertyName) {
      return jsonError('device_id and property are required', 400);
    }

    // Validar rango
    const validRanges = ['LIVE', '1H', '1D', '7D', '15D'];
    if (!validRanges.includes(range)) {
      return jsonError(`Invalid range. Must be one of: ${validRanges.join(', ')}`, 400);
    }

    // Calcular fecha de inicio según el rango
    const now = new Date();
    const rangeMap: Record<string, number> = {
      'LIVE': 5 * 60 * 1000,      // 5 minutos
      '1H': 60 * 60 * 1000,       // 1 hora
      '1D': 24 * 60 * 60 * 1000,  // 1 día
      '7D': 7 * 24 * 60 * 60 * 1000,
      '15D': 15 * 24 * 60 * 60 * 1000,
    };

    const startDate = new Date(now.getTime() - (rangeMap[range] || rangeMap['1H']));

    console.log('[DATA API] Date range:', {
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      range,
      rangeMs: rangeMap[range]
    });

    // Obtener property
    const property = await prisma.property.findUnique({
      where: {
        device_id_name: {
          device_id: deviceId,
          name: propertyName,
        },
      },
    });

    console.log('[DATA API] Property found:', property ? {
      id: property.id,
      name: property.name,
      device_id: property.device_id
    } : 'NOT FOUND');

    if (!property) {
      console.log('[DATA API] Returning empty - property not found');
      return jsonSuccess({
        data: [],
        current: null,
        property: null,
      });
    }

    // Obtener valores
    const values = await prisma.propertyValue.findMany({
      where: {
        device_id: deviceId,
        property_id: property.id,
        updated_at: {
          gte: startDate,
        },
        // Priorizar persist=true, pero también incluir false
      },
      orderBy: {
        updated_at: 'asc',
      },
    });

    console.log('[DATA API] Values found:', {
      count: values.length,
      property_id: property.id,
      sampleValues: values.slice(0, 3).map(v => ({
        id: v.id,
        value_raw: v.value_raw,
        value_number: v.value_number,
        updated_at: v.updated_at.toISOString()
      }))
    });

    // Formatear datos para el gráfico
    const data = values.map(v => ({
      timestamp: v.updated_at.toISOString(),
      value: v.value_number ?? (v.value_boolean === null ? parseFloat(v.value_raw) : (v.value_boolean ? 1 : 0)),
      raw: v.value_raw,
    }));

    // Valor actual (último)
    const current = values.length > 0 ? {
      value: values[values.length - 1].value_number ?? 
             (values[values.length - 1].value_boolean === null ? 
              parseFloat(values[values.length - 1].value_raw) : 
              (values[values.length - 1].value_boolean ? 1 : 0)),
      raw: values[values.length - 1].value_raw,
      timestamp: values[values.length - 1].updated_at.toISOString(),
    } : null;

    console.log('[DATA API] Returning:', {
      dataCount: data.length,
      current: current ? { value: current.value, timestamp: current.timestamp } : null
    });

    return jsonSuccess({
      data,
      current,
      property: {
        name: property.name,
        unit: property.unit,
        type: property.type,
      },
    });
  } catch (error: unknown) {
    console.error('[DATA API] Error:', error);
    return handleApiError(error);
  }
}
