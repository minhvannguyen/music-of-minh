"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertMessageProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
}

export default function AlertMessage({
  type = "info",
  title,
  message,
  className,
}: AlertMessageProps) {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const bgMap = {
    success: "bg-green-50 border-green-300 text-green-800",
    error: "bg-red-50 border-red-300 text-red-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
  };

  return (
    <Alert className={cn("border rounded-xl flex items-start gap-2", bgMap[type], className)}>
      {iconMap[type]}
      <div className="flex-1">
        {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
        <AlertDescription className="text-sm">{message}</AlertDescription>
      </div>
    </Alert>
  );
}
