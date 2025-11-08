import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Notification } from "@/components/NotificationsPanel";
import { Detection } from "@/components/CCTVTile";
import { toast } from "sonner";

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  getHighRiskCount: () => number;
  getTotalDetections: () => number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();

  // Simulate detection events that run continuously
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger a detection on one camera
      if (Math.random() < 0.15) {
        const cameraId = Math.floor(Math.random() * 9) + 1;
        const detectionTypes: Detection["type"][] = ["THEFT", "FIGHT", "ROBBERY", "FALL", "VANDALISM"];
        const type = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
        if (!type) return;
        
        const detection: Detection = {
          type,
          confidence: Math.floor(Math.random() * 30) + 70,
          timestamp: new Date().toLocaleTimeString(),
          x: Math.random() * 60 + 10,
          y: Math.random() * 60 + 10,
          width: Math.random() * 20 + 15,
          height: Math.random() * 20 + 15
        };

        // Create notification
        const notification: Notification = {
          id: `${cameraId}-${Date.now()}`,
          cameraId,
          detection,
          timestamp: new Date()
        };
        
        setNotifications(prev => [notification, ...prev]);

        // Only show toast if not on landing page
        if (location.pathname !== "/") {
          toast.error(`Camera ${cameraId} — ${type} detected`, {
            description: `Confidence: ${detection.confidence}%`
          });
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [location.pathname]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getHighRiskCount = () => {
    const highRiskTypes = ["THEFT", "FIGHT", "ROBBERY"];
    return notifications.filter(n => highRiskTypes.includes(n.detection.type)).length;
  };

  const getTotalDetections = () => {
    return notifications.length;
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification,
        getHighRiskCount,
        getTotalDetections
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
