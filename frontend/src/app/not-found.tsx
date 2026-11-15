import React from "react";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            404 Error
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Website Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The salon or spa website you are searching for does not exist, is currently undergoing scheduled maintenance, or the domain has not been verified.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Platform Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

