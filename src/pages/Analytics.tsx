import { useState } from "react";
import { ArrowLeft, TrendingUp, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("24h");

  // Mock data for charts
  const detectionTrends = [
    { time: "00:00", theft: 2, fight: 1, robbery: 0, fall: 1 },
    { time: "04:00", theft: 1, fight: 0, robbery: 1, fall: 0 },
    { time: "08:00", theft: 4, fight: 2, robbery: 1, fall: 1 },
    { time: "12:00", theft: 6, fight: 3, robbery: 2, fall: 2 },
    { time: "16:00", theft: 8, fight: 4, robbery: 1, fall: 1 },
    { time: "20:00", theft: 5, fight: 2, robbery: 3, fall: 0 },
  ];

  const cameraActivity = [
    { camera: "CAM 1", incidents: 12 },
    { camera: "CAM 2", incidents: 8 },
    { camera: "CAM 3", incidents: 15 },
    { camera: "CAM 4", incidents: 22 },
    { camera: "CAM 5", incidents: 6 },
    { camera: "CAM 6", incidents: 18 },
    { camera: "CAM 7", incidents: 10 },
    { camera: "CAM 8", incidents: 14 },
    { camera: "CAM 9", incidents: 9 },
  ];

  const detectionTypes = [
    { name: "THEFT", value: 45, color: "hsl(var(--alert-high))" },
    { name: "FIGHT", value: 28, color: "hsl(var(--alert-medium))" },
    { name: "ROBBERY", value: 18, color: "hsl(var(--alert-low))" },
    { name: "FALL", value: 9, color: "hsl(var(--primary))" },
  ];

  const heatmapData = [
    [0, 1, 0, 2, 1, 0, 3, 1, 0],
    [1, 0, 2, 1, 0, 1, 0, 2, 1],
    [0, 2, 1, 0, 3, 2, 1, 0, 2],
    [2, 1, 0, 4, 2, 1, 0, 3, 1],
    [1, 0, 3, 2, 1, 0, 2, 1, 0],
    [0, 2, 1, 0, 2, 3, 1, 0, 2],
  ];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-muted/30";
    if (value === 1) return "bg-alert-low/30";
    if (value === 2) return "bg-alert-medium/40";
    if (value === 3) return "bg-alert-medium/60";
    return "bg-alert-high/80";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-foreground hover:text-primary"
            >
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-xs text-muted-foreground">Detection trends and insights</p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Total Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">114</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-alert-high" />
              High Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">28</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Active Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">9/9</div>
            <p className="text-xs text-muted-foreground">All operational</p>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">2.4s</div>
            <p className="text-xs text-muted-foreground">Detection latency</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Detection Trends */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Detection Trends</CardTitle>
            <CardDescription>Incidents over time by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={detectionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="theft"
                  stroke="hsl(var(--alert-high))"
                  strokeWidth={2}
                  name="Theft"
                />
                <Line
                  type="monotone"
                  dataKey="fight"
                  stroke="hsl(var(--alert-medium))"
                  strokeWidth={2}
                  name="Fight"
                />
                <Line
                  type="monotone"
                  dataKey="robbery"
                  stroke="hsl(var(--alert-low))"
                  strokeWidth={2}
                  name="Robbery"
                />
                <Line
                  type="monotone"
                  dataKey="fall"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Fall"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Camera Activity */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Camera Activity</CardTitle>
            <CardDescription>Total incidents per camera</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cameraActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="camera"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="incidents" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detection Types & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Types Distribution */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Detection Types</CardTitle>
            <CardDescription>Distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={detectionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {detectionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Incident Heatmap</CardTitle>
            <CardDescription>Hotspot zones across time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-9 gap-2">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] text-muted-foreground font-mono"
                  >
                    C{i + 1}
                  </div>
                ))}
              </div>
              {heatmapData.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-9 gap-2">
                  {row.map((value, colIndex) => (
                    <div
                      key={colIndex}
                      className={`aspect-square rounded ${getHeatmapColor(
                        value
                      )} flex items-center justify-center text-xs font-semibold ${
                        value > 0 ? "text-foreground" : "text-muted-foreground"
                      }`}
                      title={`Camera ${colIndex + 1}: ${value} incidents`}
                    >
                      {value > 0 ? value : ""}
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>Low activity</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted/30 rounded"></div>
                  <div className="w-4 h-4 bg-alert-low/30 rounded"></div>
                  <div className="w-4 h-4 bg-alert-medium/40 rounded"></div>
                  <div className="w-4 h-4 bg-alert-high/80 rounded"></div>
                </div>
                <span>High activity</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
