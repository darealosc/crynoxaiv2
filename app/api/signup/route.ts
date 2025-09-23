import { NextResponse } from "next/server";
import { Pool } from "pg";

// Set up Postgres connection
const pool = new Pool({
  user: "postgres",
  host: "81.0.219.54", 
  database: "userdb",
  password: "darealosc", 
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Insert into users table
      const result = await client.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
        [username, email, password]
      );
      return NextResponse.json({ success: true, id: result.rows[0].id });
    } catch (dbErr: any) {
      console.error('Postgres error:', dbErr);
      let errorMsg = "Signup failed.";
      if (dbErr.code === '23505') {
        errorMsg = "Email already exists. Try logging in instead.";
      } else if (dbErr.detail) {
        errorMsg += " " + dbErr.detail;
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: "Signup failed. Server error." },
      { status: 500 }
    );
  }
}
