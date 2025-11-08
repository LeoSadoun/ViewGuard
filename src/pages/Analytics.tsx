import { useState, useEffect } from "react";
import { Shield, TrendingUp, MapPin, Clock, AlertTriangle, Activity, FileText, Upload, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNotifications } from "@/contexts/NotificationsContext";

const Analytics = () => {
  const { getHighRiskCount, getTotalDetections, notifications } = useNotifications();
  const [timeRange, setTimeRange] = useState("24h");
  const [isLiveUpdate, setIsLiveUpdate] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLiveUpdate(true);
      setLastUpdateTime(new Date());
      setTimeout(() => {
        setIsLiveUpdate(false);
      }, 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Generate detection trends from notifications
  const detectionTrends = (() => {
    const timeSlots = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
    const trends = timeSlots.map(time => ({
      time,
      theft: 0,
      fight: 0,
      robbery: 0,
      fall: 0,
      vandalism: 0
    }));

    notifications.forEach(notification => {
      const hour = notification.timestamp.getHours();
      const slotIndex = Math.floor(hour / 4);
      const type = notification.detection.type.toLowerCase();
      if (trends[slotIndex] && type in trends[slotIndex]) {
        (trends[slotIndex] as any)[type]++;
      }
    });

    return trends;
  })();

  // Generate camera activity from notifications
  const cameraActivity = (() => {
    const activity: Record<number, number> = {};
    
    notifications.forEach(notification => {
      activity[notification.cameraId] = (activity[notification.cameraId] || 0) + 1;
    });

    return Array.from({ length: 9 }, (_, i) => ({
      camera: `CAM ${i + 1}`,
      incidents: activity[i + 1] || 0
    }));
  })();

  // Generate detection types distribution from notifications
  const detectionTypes = (() => {
    const types: Record<string, any> = {};
    const colors: Record<string, string> = {
      THEFT: "hsl(var(--alert-high))",
      FIGHT: "hsl(var(--alert-medium))",
      ROBBERY: "hsl(var(--alert-low))",
      FALL: "hsl(var(--primary))",
      VANDALISM: "hsl(var(--accent))"
    };

    notifications.forEach(notification => {
      const type = notification.detection.type;
      if (!types[type]) {
        types[type] = {
          name: type,
          value: 0,
          color: colors[type] || "hsl(var(--primary))",
          cameras: new Set<string>(),
          topCamera: "",
          topCameraCount: 0,
          avgResponseTime: "2.0s"
        };
      }
      types[type].value++;
      types[type].cameras.add(`CAM ${notification.cameraId}`);
    });

    return Object.values(types).map((type: any) => ({
      ...type,
      cameras: Array.from(type.cameras),
      topCamera: type.cameras.size > 0 ? Array.from(type.cameras)[0] : "N/A",
      topCameraCount: type.value
    }));
  })();

  // Generate heatmap from notifications
  const heatmapData = (() => {
    const matrix = Array(6).fill(0).map(() => Array(9).fill(0));
    
    notifications.forEach(notification => {
      const hour = notification.timestamp.getHours();
      const timeSlot = Math.floor(hour / 4);
      const cameraIndex = notification.cameraId - 1;
      
      if (cameraIndex >= 0 && cameraIndex < 9 && timeSlot < 6) {
        matrix[timeSlot][cameraIndex]++;
      }
    });

    return matrix;
  })();
  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-muted/30";
    if (value === 1) return "bg-alert-low/30";
    if (value === 2) return "bg-alert-medium/40";
    if (value === 3) return "bg-alert-medium/60";
    return "bg-alert-high/80";
  };
  return <div className="min-h-screen bg-background p-4 md:p-6 cyber-bg">
      {/* Header */}
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center glow-cyber">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">ViewGuard<span className="text-primary">AI</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/monitor">
                <Shield className="w-4 h-4" />
                Monitor
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/upload">
                <Upload className="w-4 h-4" />
                Upload
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/realtime">
                <Radio className="w-4 h-4" />
                Realtime
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/reports">
                <FileText className="w-4 h-4" />
                Reports
              </Link>
            </Button>
            {/* Live Update Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 border border-border backdrop-blur-sm">
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className={`absolute w-3 h-3 rounded-full transition-all duration-300 ${isLiveUpdate ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-green-500/40'}`} />
                {isLiveUpdate && <>
                    <div className="absolute w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                    <div className="absolute w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  </>}
              </div>
              <div className="text-xs">
                <div className={`font-semibold transition-colors ${isLiveUpdate ? 'text-green-500' : 'text-foreground'}`}>
                  {isLiveUpdate ? <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 animate-pulse" />
                      Updating...
                    </span> : 'Live'}
                </div>
                <div className="text-muted-foreground">
                  {lastUpdateTime.toLocaleTimeString()}
                </div>
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
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Total Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{getTotalDetections()}</div>
            <p className="text-xs text-muted-foreground">Active notifications</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-alert-high" />
              High Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{getHighRiskCount()}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Active Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">9/13</div>
            <p className="text-xs text-muted-foreground">4 cameras offline</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative z-10">
        {/* Detection Trends */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">Detection Trends</CardTitle>
            <CardDescription>Incidents over time by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={detectionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{
                fontSize: "12px"
              }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{
                fontSize: "12px"
              }} />
                <Tooltip contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }} />
                <Legend />
                <Line type="monotone" dataKey="theft" stroke="hsl(var(--alert-high))" strokeWidth={2} name="Theft" />
                <Line type="monotone" dataKey="fight" stroke="hsl(var(--alert-medium))" strokeWidth={2} name="Fight" />
                <Line type="monotone" dataKey="robbery" stroke="hsl(var(--alert-low))" strokeWidth={2} name="Robbery" />
                <Line type="monotone" dataKey="fall" stroke="hsl(var(--primary))" strokeWidth={2} name="Fall" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Camera Activity */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">Camera Activity</CardTitle>
            <CardDescription>Total incidents per camera</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cameraActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="camera" stroke="hsl(var(--muted-foreground))" style={{
                fontSize: "12px"
              }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{
                fontSize: "12px"
              }} />
                <Tooltip contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }} />
                <Bar dataKey="incidents" fill="hsl(var(--primary))" fillOpacity={0.8} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detection Types & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Detection Types Distribution */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">Detection Types</CardTitle>
            <CardDescription>Distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={detectionTypes} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value" className="cursor-pointer">
                  {detectionTypes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />)}
                </Pie>
                <Tooltip content={({
                active,
                payload
              }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                          <h3 className="font-bold text-foreground text-lg mb-2">
                            {data.name}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              Total Incidents: <span className="text-foreground font-semibold">{data.value}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Top Camera: <span className="text-foreground font-semibold">{data.topCamera}</span> ({data.topCameraCount} incidents)
                            </p>
                            <p className="text-muted-foreground">
                              Avg Response: <span className="text-foreground font-semibold">{data.avgResponseTime}</span>
                            </p>
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-muted-foreground text-xs mb-1">Active Cameras:</p>
                              <div className="flex flex-wrap gap-1">
                                {data.cameras.map((cam: string) => <span key={cam} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                    {cam}
                                  </span>)}
                              </div>
                            </div>
                          </div>
                        </div>;
                }
                return null;
              }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">Incident Heatmap</CardTitle>
            <CardDescription>Hotspot zones across time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-9 gap-2">
                {Array.from({
                length: 9
              }, (_, i) => <div key={i} className="text-center text-[10px] text-muted-foreground font-mono">
                    C{i + 1}
                  </div>)}
              </div>
              {heatmapData.map((row, rowIndex) => <div key={rowIndex} className="grid grid-cols-9 gap-2">
                  {row.map((value, colIndex) => <div key={colIndex} className={`aspect-square rounded ${getHeatmapColor(value)} flex items-center justify-center text-xs font-semibold ${value > 0 ? "text-foreground" : "text-muted-foreground"}`} title={`Camera ${colIndex + 1}: ${value} incidents`}>
                      {value > 0 ? value : ""}
                    </div>)}
                </div>)}
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
    </div>;
};
export default Analytics;