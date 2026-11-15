"use client";

import React from "react";
import { ContactDetails, LocationItem } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

export function ContactSection({
  contact,
  locations = [],
}: {
  contact?: ContactDetails | null;
  locations?: LocationItem[];
}) {
  const { company, profile } = useTenant();
  const businessName = profile?.company_name || company.name;

  const phone = contact?.primary_phone || profile?.phone;
  const email = contact?.email || profile?.email;
  const whatsapp = contact?.whatsapp_number || profile?.whatsapp_number;
  const primaryLoc = locations.find((l) => l.is_primary) || locations[0];
  const mapsUrl = contact?.google_maps_url;
  const openingHours = profile?.opening_hours || {};

  return (
    <section id="contact" className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <span className="sr-only">Visit Us or Reserve a Session</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black leading-tight"
          >
            <span>WE&apos;D</span>
            <AnimatedBracket text="GET IN TOUCH" delay={0.1} />
            <span>LOVE TO</span>
            <br />
            <AnimatedBracket text="GET IN TOUCH" delay={0.25} />
            <span>HEAR FROM YOU</span>
          </motion.h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Reserve your session, consult our master therapists, or ask us about bespoke bridal and event treatments.
          </p>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* Left Column: Minimal Editorial Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 border border-black/10">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-black mb-6 pb-3 border-b border-black/10">
              Direct Enquiry & Appointment Booking
            </h3>
            <EnquiryForm />
          </div>

          {/* Right Column: Studio Information & Concierge */}
          <div className="lg:col-span-5 space-y-8 p-6 sm:p-8 bg-[#F7F6F3] border border-black/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                Studio Destination
              </span>
              <h4 className="font-sans text-lg font-bold uppercase tracking-tight text-black">
                {businessName}
              </h4>
            </div>

            {/* Address */}
            {(primaryLoc || profile?.address) && (
              <div className="space-y-1.5 pt-4 border-t border-black/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  Address
                </span>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                  {primaryLoc ? (
                    <>
                      {primaryLoc.location_name && (
                        <strong className="block font-medium text-black">
                          {primaryLoc.location_name}
                        </strong>
                      )}
                      {primaryLoc.address}, {primaryLoc.city}
                      {primaryLoc.postal_code && ` ${primaryLoc.postal_code}`}
                    </>
                  ) : (
                    <>{profile?.address}, {profile?.city}</>
                  )}
                </p>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-black underline pt-1 hover:text-neutral-600"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Direct Contact */}
            <div className="space-y-3 pt-4 border-t border-black/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                Connect Directly
              </span>
              
              {phone && (
                <div className="flex items-center gap-2.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-black flex-shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="text-neutral-800 hover:text-black font-mono transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-2.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-black flex-shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="text-neutral-800 hover:text-black transition-colors"
                  >
                    {email}
                  </a>
                </div>
              )}

              {whatsapp && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#20ba5a] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              )}
            </div>

            {/* Opening Hours */}
            <div className="space-y-2 pt-4 border-t border-black/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-black" />
                Working Hours
              </span>
              {Object.keys(openingHours).length > 0 ? (
                <div className="space-y-1 text-xs">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-0.5">
                      <span className="capitalize text-neutral-600">{day}</span>
                      <span className="font-mono text-neutral-900">{String(hours)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-neutral-600 space-y-0.5">
                  <p>Monday – Saturday: 9:30 AM – 8:30 PM</p>
                  <p>Sunday: 10:00 AM – 7:00 PM</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
