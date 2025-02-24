import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, content } = await req.json();

    const data = await resend.emails.send({
      from: 'BAUC International <no-reply@baucinternational.com>',
      to: [to],
      subject: subject,
      html: content,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
