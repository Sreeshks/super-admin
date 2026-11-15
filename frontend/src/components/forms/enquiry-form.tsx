"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { publicApi } from "@/lib/api";
import { useTenant } from "@/providers/tenant-provider";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const enquirySchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Valid phone or WhatsApp number is required"),
  subject: z.string().optional(),
  message: z.string().min(5, "Please enter your message or preferred treatment"),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export function EnquiryForm() {
  const { slug } = useTenant();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      customer_name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    try {
      const res = await publicApi.submitEnquiry(slug, {
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || "Appointment & Consultation Enquiry",
        message: data.message,
      });

      if (res.success) {
        toast.success(res.message || "Enquiry submitted successfully!");
        setSubmitted(true);
        reset();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit enquiry. Please try again.";
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 px-6 border border-black/10 bg-neutral-50 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-black">
            Thank You for Reaching Out
          </h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
            Your appointment inquiry has been registered. Our concierge will be in touch with you shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs font-bold uppercase tracking-widest text-black underline pt-2 hover:text-neutral-600"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
          <span>Full name*</span>
          {errors.customer_name && (
            <span className="text-[10px] text-red-600 lowercase tracking-normal">
              {errors.customer_name.message}
            </span>
          )}
        </label>
        <input
          {...register("customer_name")}
          placeholder="Enter name (e.g. Eleanor Vance)"
          disabled={isSubmitting}
          className="w-full pb-2.5 pt-1 bg-transparent border-b border-black/20 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-black transition-colors"
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
            <span>Email*</span>
            {errors.email && (
              <span className="text-[10px] text-red-600 lowercase tracking-normal">
                {errors.email.message}
              </span>
            )}
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter email (e.g. eleanor@example.com)"
            disabled={isSubmitting}
            className="w-full pb-2.5 pt-1 bg-transparent border-b border-black/20 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-black transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
            <span>Phone*</span>
            {errors.phone && (
              <span className="text-[10px] text-red-600 lowercase tracking-normal">
                {errors.phone.message}
              </span>
            )}
          </label>
          <input
            {...register("phone")}
            placeholder="Enter phone (e.g. +91 98765 43210)"
            disabled={isSubmitting}
            className="w-full pb-2.5 pt-1 bg-transparent border-b border-black/20 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
          <span>Message*</span>
          {errors.message && (
            <span className="text-[10px] text-red-600 lowercase tracking-normal">
              {errors.message.message}
            </span>
          )}
        </label>
        <textarea
          {...register("message")}
          rows={3}
          placeholder="Say Hi! Enter your preferred dates or treatment requirements..."
          disabled={isSubmitting}
          className="w-full pb-2.5 pt-1 bg-transparent border-b border-black/20 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-black transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <>
            <span>Submit Appointment Enquiry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
