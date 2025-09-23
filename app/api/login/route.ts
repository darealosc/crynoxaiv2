import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "81.0.219.54",
  database: "userdb",
  password: "darealosc",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { email, password, firstname, lastname } = await req.json();
    if (!email || !password || !firstname || !lastname) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      // Find user by email, password, firstname, and lastname
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2 AND username = $3",
        [email, password, firstname + ' ' + lastname]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return NextResponse.json({ id: result.rows[0].id, email: result.rows[0].email });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed. Server error." }, { status: 500 });
  }
}
