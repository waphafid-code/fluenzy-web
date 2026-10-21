import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Fluenzy Cloud Backend',
    uptime: '24/7 Serverless',
    timestamp: new Date().toISOString(),
  });
}
