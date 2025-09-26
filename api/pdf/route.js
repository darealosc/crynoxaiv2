import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');
    const question = formData.get('question');

    if (!file || !question) {
      return NextResponse.json({ error: 'PDF file and question are required' }, { status: 400 });
    }

    // Save uploaded PDF temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    await writeFile(tempPath, buffer);

    // Run Python script
    return new Promise((resolve) => {
      const python = spawn('python', ['readpdf.py', tempPath], {
        cwd: process.cwd(),
      });

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.error('Failed to delete temp file:', e);
        }

        if (code !== 0) {
          resolve(NextResponse.json({ error: error || 'Python script failed' }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ answer: output.trim() }));
        }
      });

      // Send question to Python script
      python.stdin.write(question + '\n');
      python.stdin.end();
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}