// import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'; // Use server-side Supabase client




export async function POST(req: Request) {
    try {
      const { email, password, fullname } = await req.json();
      const supabase = createClient();

      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Step 2: If sign-up succeeds, add user to "admins" table
      if (authData.user) {
        const { error: profileError } = await supabase.from('admins').insert([
          {
            id: authData.user.id,
            fullname,
            email,
            password,
            is_approved: false,
            is_superadmin: false,
          },
        ]);

        if (profileError) throw profileError;
      }

      // Step 3: Return success response
      return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }






  // export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     console.log('Received request:', req.method); // Debugging log

//   // Only allow POST requests
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const supabase = createClient();
//   const { email, password, fullname } = req.body;

//   try {
//     // Step 1: Sign up the user with Supabase Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (authError) throw authError;

//     // Step 2: If sign-up succeeds, add the user to the "admins" table
//     if (authData.user) {
//       const { error: profileError } = await supabase
//         .from('admins')
//         .insert([
//           {
//             id: authData.user.id, // Use the user ID from Supabase Auth
//             fullname,
//             email,
//             is_approved: false, // Default value for new admins
//             is_superadmin: false, // Default value for new admins
//           },
//         ]);

//       if (profileError) throw profileError;
//     }

//     // Step 3: Return success response
//     return res.status(200).json({ message: 'User created successfully' });
//   } catch (error: any) {
//     // Step 4: Handle errors
//     return res.status(400).json({ error: error.message });
//   }
// }
