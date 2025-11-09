import { createContext, useContext, useState, ReactNode } from "react";
import { Detection } from "@/components/CCTVTile";

export interface Report {
  id: string;
  cameraId: number;
  detection: Detection;
  timestamp: Date;
  videoUrl?: string;
  videoTimestamp?: number; // The time in the video when event occurred (in seconds)
}

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Report) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};
