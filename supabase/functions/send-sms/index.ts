import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  phone: string;
  message: string;
  type: "form_submission" | "status_update";
  recordId?: string;
  tableName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, type, recordId, tableName }: SmsRequest = await req.json();
    
    console.log(`Sending SMS to ${phone}: ${message}`);
    console.log(`Type: ${type}, Record: ${recordId}, Table: ${tableName}`);

    const apiKey = Deno.env.get("BULKSMS_API_KEY");
    const senderId = Deno.env.get("BULKSMS_SENDER_ID");

    if (!apiKey || !senderId) {
      console.error("Missing SMS API credentials");
      return new Response(
        JSON.stringify({ error: "SMS credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number (remove leading 0 and add country code if needed)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "88" + formattedPhone;
    } else if (!formattedPhone.startsWith("88")) {
      formattedPhone = "88" + formattedPhone;
    }

    // BulkSMS BD API call
    const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedPhone}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
    console.log("Calling BulkSMS API:", apiUrl.replace(apiKey, "***"));

    // Prevent slow submissions if the SMS provider is slow/down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const smsResponse = await fetch(apiUrl, { method: "GET", signal: controller.signal }).finally(() =>
      clearTimeout(timeoutId)
    );

    const smsResult = await smsResponse.text();
    console.log("BulkSMS Response:", smsResult);

    // Detect success/failure from provider response
    let providerJson: any = null;
    try {
      providerJson = JSON.parse(smsResult);
    } catch {
      // ignore (provider may return plain text)
    }

    const responseCode = providerJson?.response_code;
    const providerError = providerJson?.error_message;

    // BulkSMSBD typically returns response_code 202 for success; treat everything else as failure
    const isSuccess = responseCode === 202 || responseCode === "202" || smsResponse.ok;

    if (!isSuccess) {
      console.error("SMS provider rejected request:", providerError || smsResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: providerError || "SMS provider error",
          response: providerJson ?? smsResult,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update sms_sent flag in database only when the SMS actually succeeded
    if (recordId && tableName) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from(tableName).update({ sms_sent: true }).eq("id", recordId);

      console.log(`Updated sms_sent flag for ${tableName}/${recordId}`);
    }

    return new Response(
      JSON.stringify({ success: true, response: smsResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
