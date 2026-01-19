"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RateLimitBanner } from "@/components/ui/rate-limit-banner";

export function ContactForm() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; resetDate?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setRateLimitInfo(null);

    try {
      // Ensure honeypot field is empty (in case browser autofill touched it)
      const submissionData = {
        ...formState,
        website: "", // Force empty honeypot
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormState({ name: "", email: "", subject: "", message: "", website: "" });
      } else if (response.status === 429) {
        // Rate limit exceeded
        const data = await response.json();
        const errorMessage = data.error || "Too many submissions. Please try again later.";

        // Extract reset date from error message (format: "...after MM/DD/YYYY.")
        const dateMatch = errorMessage.match(/after ([^.]+)\./);
        const resetDate = dateMatch ? dateMatch[1] : undefined;

        setRateLimitInfo({
          message: errorMessage,
          resetDate,
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Rate limit banner */}
      {rateLimitInfo && (
        <RateLimitBanner
          message={rateLimitInfo.message}
        />
      )}

      {/* Anti-spam field - hidden honeypot */}
      <div style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="website_url_field">Leave this field empty</label>
        <input
          type="text"
          id="website_url_field"
          name="website"
          tabIndex={-1}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          value={formState.website}
          onChange={(e) => setFormState({ ...formState, website: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formState.email}
          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <div id="subject-label" className="block text-sm font-medium mb-1">
          What can I help you with?
        </div>
        {isMounted ? (
          <Select
            value={formState.subject}
            onValueChange={(value) => setFormState({ ...formState, subject: value })}
            required
            name="subject"
          >
            <SelectTrigger aria-labelledby="subject-label">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recipe-question">Recipe Question or Substitution</SelectItem>
              <SelectItem value="recipe-suggestion">Recipe Suggestion</SelectItem>
              <SelectItem value="collaboration">Collaboration Inquiry</SelectItem>
              <SelectItem value="feedback">General Feedback</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          autoComplete="off"
          required
          value={formState.message}
          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
          placeholder="Tell me more..."
          rows={6}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:bg-card dark:hover:bg-card/80 dark:border dark:border-border text-white"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {submitStatus === "success" && (
        <p className="text-sm text-foreground text-center">
          Thanks for reaching out! I'll get back to you within 2-3 days.
        </p>
      )}
      {submitStatus === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          Something went wrong. Please try emailing me directly at cheapquickvegan@gmail.com
        </p>
      )}
    </form>
  );
}
