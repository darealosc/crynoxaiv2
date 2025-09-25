import { NextResponse } from "next/server";
import { Pool } from "pg";

// Hardcoded DB credentials
const pool = new Pool({
  user: "postgres",
  host: "81.0.219.54",
  database: "userdb",
  password: "darealosc",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      // Only select columns that exist in your users table
      const result = await client.query(
        "SELECT id, email, username FROM users WHERE email = $1 AND password = $2",
        [email, password]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      // Return user info for localStorage if needed
      return NextResponse.json({
        id: result.rows[0].id,
        email: result.rows[0].email,
        username: result.rows[0].username,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed. Server error." }, { status: 500 });
  }
}
