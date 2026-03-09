export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { jsonSuccess, handleApiError } from '@/lib/api/response';

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            unit: true,
            type: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return jsonSuccess({ devices });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
