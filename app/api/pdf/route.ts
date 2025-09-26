import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File | null;
    const question = formData.get('question') as string | null;

    console.log('Received PDF upload request');
    console.log('File:', file ? file.name : 'No file');
    console.log('Question:', question);

    if (!file || !question) {
      return NextResponse.json({ error: 'PDF file and question are required' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Save uploaded PDF temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_${file.name}`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Created temp directory:', tempDir);
    }
    
    await writeFile(tempPath, buffer);
    console.log('PDF saved to:', tempPath);

    // Run Python script
    return new Promise<NextResponse>((resolve) => {
      const python = spawn('python', ['readpdf_api.py', tempPath], {
        cwd: process.cwd(),
      });

      let output = '';
      let error = '';

      python.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        console.log('Python stdout:', text);
      });

      python.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        error += text;
        console.error('Python stderr:', text);
      });

      python.on('close', (code: number | null) => {
        console.log('Python process closed with code:', code);
        console.log('Full output:', output);
        console.log('Full error:', error);
        
        // Clean up temp file
        try {
          fs.unlinkSync(tempPath);
          console.log('Cleaned up temp file');
        } catch (e) {
          console.error('Failed to delete temp file:', e);
        }

        if (code !== 0) {
          resolve(NextResponse.json({ 
            error: `Processing failed: ${error || 'Unknown error'}` 
          }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ answer: output.trim() || 'No response received' }));
        }
      });

      python.on('error', (err: Error) => {
        console.error('Failed to start Python process:', err);
        resolve(NextResponse.json({ 
          error: 'Failed to start PDF processing. Make sure Python is installed.' 
        }, { status: 500 }));
      });

      // Send question to Python script
            python.stdin.write(question + '\n');
            python.stdin.end();
          }); // End of Promise
        } // End of try block
        catch (error) {
          console.error('Unexpected error:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      }