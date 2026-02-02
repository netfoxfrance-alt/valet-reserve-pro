import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/calendar; charset=utf-8",
  "Cache-Control": "public, max-age=900", // 15 minutes cache
};

// Escape special characters for iCal text fields
function escapeIcalText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Generate a unique UID for each event
function generateUID(appointmentId: string, centerId: string): string {
  return `${appointmentId}@cleaningpage-${centerId}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const centerId = url.searchParams.get("center");
    const token = url.searchParams.get("token");

    // Validate required parameters
    if (!centerId || !token) {
      return new Response("Missing center or token parameter", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify token matches center
    const { data: center, error: centerError } = await supabase
      .from("centers")
      .select("id, name, address, ical_token")
      .eq("id", centerId)
      .single();

    if (centerError || !center) {
      console.error("Center not found:", centerError);
      return new Response("Center not found", {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Validate token
    if (center.ical_token !== token) {
      console.error("Invalid token for center:", centerId);
      return new Response("Invalid token", {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Calculate date range: 3 months past to 6 months future
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    // Fetch appointments for this center
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        client_name,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        notes,
        vehicle_type,
        pack_id,
        custom_service_id
      `)
      .eq("center_id", centerId)
      .in("status", ["confirmed", "completed"])
      .gte("appointment_date", threeMonthsAgo.toISOString().split("T")[0])
      .lte("appointment_date", sixMonthsLater.toISOString().split("T")[0])
      .order("appointment_date", { ascending: true });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return new Response("Error fetching appointments", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Fetch packs and custom services for this center
    const { data: packs } = await supabase
      .from("packs")
      .select("id, name, price")
      .eq("center_id", centerId);

    const { data: customServices } = await supabase
      .from("custom_services")
      .select("id, name, price")
      .eq("center_id", centerId);

    // Create lookup maps
    const packsMap = new Map((packs || []).map(p => [p.id, p]));
    const servicesMap = new Map((customServices || []).map(s => [s.id, s]));

    // Generate iCal content
    const calendarName = escapeIcalText(center.name || "Mes Rendez-vous");
    
    const icalLines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CleaningPage//Calendar//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${calendarName}`,
      "X-WR-TIMEZONE:Europe/Paris",
      // Timezone definition
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Paris",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:+0100",
      "TZOFFSETTO:+0200",
      "TZNAME:CEST",
      "DTSTART:19700329T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0200",
      "TZOFFSETTO:+0100",
      "TZNAME:CET",
      "DTSTART:19701025T030000",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];

    // Add events
    for (const apt of appointments || []) {
      // Parse appointment date and time
      const [year, month, day] = apt.appointment_date.split("-").map(Number);
      const [hours, minutes] = apt.appointment_time.split(":").map(Number);
      
      const startDate = new Date(year, month - 1, day, hours, minutes);
      const duration = apt.duration_minutes || 60;
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

      // Get service info from lookup maps
      const packInfo = apt.pack_id ? packsMap.get(apt.pack_id) : null;
      const serviceInfo = apt.custom_service_id ? servicesMap.get(apt.custom_service_id) : null;
      const serviceName = packInfo?.name || serviceInfo?.name || "Prestation";
      const servicePrice = packInfo?.price || serviceInfo?.price;

      // Build event summary and description
      const summary = escapeIcalText(`RDV - ${apt.client_name}`);
      
      const descriptionParts = [serviceName];
      if (apt.vehicle_type) {
        descriptionParts.push(`Véhicule: ${apt.vehicle_type}`);
      }
      if (servicePrice) {
        descriptionParts.push(`Prix: ${servicePrice}€`);
      }
      if (apt.notes) {
        descriptionParts.push(`Notes: ${apt.notes}`);
      }
      const description = escapeIcalText(descriptionParts.join(" | "));

      // Format dates for iCal (local time with timezone)
      const dtstart = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`;
      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();
      const dtend = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

      const createdAt = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      icalLines.push(
        "BEGIN:VEVENT",
        `UID:${generateUID(apt.id, centerId)}`,
        `DTSTAMP:${createdAt}`,
        `DTSTART;TZID=Europe/Paris:${dtstart}`,
        `DTEND;TZID=Europe/Paris:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
      );
      
      if (center.address) {
        icalLines.push(`LOCATION:${escapeIcalText(center.address)}`);
      }
      
      icalLines.push(
        `STATUS:${apt.status === "confirmed" ? "CONFIRMED" : "COMPLETED"}`,
        "END:VEVENT"
      );
    }

    icalLines.push("END:VCALENDAR");

    // Join with CRLF as per iCal spec
    const finalContent = icalLines.join("\r\n");

    return new Response(finalContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Disposition": `attachment; filename="${center.name || "calendar"}.ics"`,
      },
    });
  } catch (error) {
    console.error("Calendar iCal error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
