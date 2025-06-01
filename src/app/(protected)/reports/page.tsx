
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          Reports
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reporting Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
              Reports Coming Soon
            </h2>
            <p className="text-muted-foreground">
              This section will provide comprehensive reports and analytics for your projects.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
