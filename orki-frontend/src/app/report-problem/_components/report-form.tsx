"use client";

import { useState } from "react";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

const categories = [
  "Login or account access",
  "Exam questions or content",
  "Flashcard issues",
  "Payment or billing",
  "Analytics data",
  "Performance or loading",
  "Other",
];

type Status = "idle" | "submitting" | "success";

export function ReportForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Simulate submission — connect to Django API endpoint in production
    setTimeout(() => setStatus("success"), 1200);
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-success/25 bg-success/5 px-6 py-10 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-success/12 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#10B981"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-heading font-bold text-foreground text-lg mb-1">Report received!</p>
        <p className="text-secondary text-sm max-w-xs mx-auto">
          Thank you, {form.name || "there"}. We'll review your report and follow up at{" "}
          <strong>{form.email}</strong> within 1–2 business days.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setForm({ name: "", email: "", category: "", description: "" });
          }}
          className="mt-5 text-sm text-primary hover:underline"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Juan dela Cruz"
            className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="juan@example.com"
            className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Problem category
        </label>
        <select
          id="category"
          name="category"
          required
          value={form.category}
          onChange={handleChange}
          className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
        >
          <option value="" disabled>
            Select a category…
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Describe the problem
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          value={form.description}
          onChange={handleChange}
          placeholder="Please describe what happened, what you expected to happen, and any steps to reproduce the issue…"
          className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted">
          By submitting you agree to our{" "}
          <Link href={routes.privacy} className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {status === "submitting" ? "Sending…" : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
