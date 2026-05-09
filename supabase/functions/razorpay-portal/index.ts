import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight for browser security
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // These look up the values you set in Supabase Secrets
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_SECRET = Deno.env.get('RAZORPAY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      throw new Error("Razorpay keys are missing from Supabase Secrets.")
    }

    const { action, amount, razorpay_order_id, razorpay_payment_id, razorpay_signature, admission_payload } = await req.json()

    // --- ACTION: CREATE SECURE ORDER ---
    if (action === 'create_order') {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100, // INR to Paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      })

      const order = await response.json()
      if (!response.ok) throw new Error(order.error?.description || "Razorpay Order Error")

      return new Response(JSON.stringify(order), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // --- ACTION: VERIFY AND SAVE ADMISSION ---
    if (action === 'verify_and_save') {
      
      // 1. Native Web Crypto HMAC-SHA256 Verification
      const encoder = new TextEncoder()
      const secretKeyData = encoder.encode(RAZORPAY_SECRET)
      const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        secretKeyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )

      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
      const generated_signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")

      if (generated_signature !== razorpay_signature) {
        return new Response(JSON.stringify({ success: false, error: 'Signature Mismatch' }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
        })
      }

      // 2. Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // 3. Final Secure Insert
      const { error } = await supabaseAdmin
        .from('admissions')
        .insert([{
          ...admission_payload,
          payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          razorpay_signature: razorpay_signature,
          status: 'Verified & Paid'
        }])

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    throw new Error("Invalid Action")

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})