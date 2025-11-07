import { Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ControlsPanelProps {
  autoAcknowledge: boolean;
  onAutoAcknowledgeChange: (value: boolean) => void;
  sensitivity: "low" | "medium" | "high";
  onSensitivityChange: (value: "low" | "medium" | "high") => void;
  onExport: () => void;
}

const ControlsPanel = ({
  autoAcknowledge,
  onAutoAcknowledgeChange,
  sensitivity,
  onSensitivityChange,
  onExport,
}: ControlsPanelProps) => {
  return (
    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Auto-acknowledge */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-ack" className="text-xs text-foreground">
            Auto-acknowledge
          </Label>
          <Switch
            id="auto-ack"
            checked={autoAcknowledge}
            onCheckedChange={onAutoAcknowledgeChange}
            aria-label="Toggle auto-acknowledge alerts"
          />
        </div>

        {/* Sensitivity */}
        <div className="space-y-2">
          <Label htmlFor="sensitivity" className="text-xs text-foreground">
            Sensitivity
          </Label>
          <Select value={sensitivity} onValueChange={onSensitivityChange}>
            <SelectTrigger id="sensitivity" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export */}
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={onExport}
          aria-label="Export alert data"
        >
          <Download className="w-3 h-3 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default ControlsPanel;
