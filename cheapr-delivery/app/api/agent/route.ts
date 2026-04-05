import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  const { platform, address, restaurant } = await request.json();

  return new Promise<NextResponse>((resolve) => {
    const scriptPath = path.join(process.cwd(), '..', 'scrape.py');

    const proc = spawn('python3', [scriptPath, platform, address, restaurant], {
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (_code) => {
      // Find the last JSON object in stdout (agent may print extra lines)
      const match = stdout.match(/(\{[\s\S]*\})\s*$/);
      if (!match) {
        resolve(NextResponse.json(
          { error: `No output from agent. stderr: ${stderr.slice(0, 300)}` },
          { status: 500 }
        ));
        return;
      }

      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.error) {
          resolve(NextResponse.json({ error: parsed.error }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ result: parsed }));
        }
      } catch (e) {
        resolve(NextResponse.json(
          { error: `JSON parse failed: ${e}` },
          { status: 500 }
        ));
      }
    });

    // 10-minute timeout
    setTimeout(() => {
      proc.kill();
      resolve(NextResponse.json({ error: 'Agent timed out after 10 minutes' }, { status: 504 }));
    }, 10 * 60 * 1000);
  });
}
