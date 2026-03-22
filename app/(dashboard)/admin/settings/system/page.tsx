"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save, Settings2, Clock, Calendar as CalendarIcon, FileText } from "lucide-react";
import Link from "next/link";

/**
 * System Preferences Page
 * General system settings and application behavior
 */

interface SystemPreferences {
  // Date & Time
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;

  // Application Behavior
  enableAutoSave: boolean;
  autoSaveInterval: number; // minutes
  sessionTimeout: number; // minutes
  enableOfflineMode: boolean;

  // Report Cards
  defaultGradingSystem: string;
  showPositionOnReportCard: boolean;
  showAttendanceOnReportCard: boolean;
  requireTeacherRemarks: boolean;
  requireHeadTeacherRemarks: boolean;

  // Academic
  passingGrade: number;
  maxAbsencesPerTerm: number;
  enablePromotionWorkflow: boolean;
  promotionPolicy: string;
  minimumAttendanceForPromotion: number;

  // UI/UX
  defaultTheme: string;
  enableAnimations: boolean;
  compactMode: boolean;
  showHelpTooltips: boolean;
}

export default function SystemPreferencesPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState<SystemPreferences>({
    // Date & Time
    timezone: "Africa/Lusaka",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    weekStartsOn: "Monday",

    // Application Behavior
    enableAutoSave: true,
    autoSaveInterval: 5,
    sessionTimeout: 60,
    enableOfflineMode: false,

    // Report Cards
    defaultGradingSystem: "ECZ",
    showPositionOnReportCard: true,
    showAttendanceOnReportCard: true,
    requireTeacherRemarks: true,
    requireHeadTeacherRemarks: true,

    // Academic
    passingGrade: 50,
    maxAbsencesPerTerm: 15,
    enablePromotionWorkflow: true,
    promotionPolicy: "PASS_BASED",
    minimumAttendanceForPromotion: 75,

    // UI/UX
    defaultTheme: "light",
    enableAnimations: true,
    compactMode: false,
    showHelpTooltips: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/settings/system", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load system preferences");
      }

      const data = await response.json();
      if (data.settings) {
        setPreferences(data.settings);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load system preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof SystemPreferences) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: keyof SystemPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/settings/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save preferences");
      }

      toast.success("System preferences saved successfully");
    } catch (error: any) {
      console.error("Failed to save preferences:", error);
      toast.error(error.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">System Preferences</h1>
            <p className="text-sm text-muted-foreground">
              Configure general system settings and behavior
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Date & Time Settings
          </CardTitle>
          <CardDescription>
            Configure date, time, and timezone preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Africa/Lusaka">Africa/Lusaka (CAT, UTC+2)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                value={preferences.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (24/01/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (01/24/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-24)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <select
                id="timeFormat"
                value={preferences.timeFormat}
                onChange={(e) => handleChange("timeFormat", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekStartsOn">Week Starts On</Label>
              <select
                id="weekStartsOn"
                value={preferences.weekStartsOn}
                onChange={(e) => handleChange("weekStartsOn", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Application Behavior
          </CardTitle>
          <CardDescription>
            Control how the application behaves and performs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Save Forms</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save form data while editing
              </p>
            </div>
            <Switch
              checked={preferences.enableAutoSave}
              onCheckedChange={() => handleToggle("enableAutoSave")}
            />
          </div>

          {preferences.enableAutoSave && (
            <div className="space-y-2 ml-4">
              <Label htmlFor="autoSaveInterval">Auto-Save Interval (minutes)</Label>
              <select
                id="autoSaveInterval"
                value={preferences.autoSaveInterval}
                onChange={(e) => handleChange("autoSaveInterval", Number(e.target.value))}
                className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1">Every 1 minute</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="15">Every 15 minutes</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <select
              id="sessionTimeout"
              value={preferences.sessionTimeout}
              onChange={(e) => handleChange("sessionTimeout", Number(e.target.value))}
              className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offline Mode (Coming Soon)</Label>
              <p className="text-sm text-muted-foreground">
                Allow limited functionality when internet is unavailable
              </p>
            </div>
            <Switch
              checked={preferences.enableOfflineMode}
              onCheckedChange={() => handleToggle("enableOfflineMode")}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Card Settings
          </CardTitle>
          <CardDescription>
            Configure how report cards are generated and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultGradingSystem">Default Grading System</Label>
            <select
              id="defaultGradingSystem"
              value={preferences.defaultGradingSystem}
              onChange={(e) => handleChange("defaultGradingSystem", e.target.value)}
              className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ECZ">ECZ Grading (1-9)</option>
              <option value="PERCENTAGE">Percentage (0-100%)</option>
              <option value="LETTER">Letter Grades (A-F)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Position on Report Card</Label>
              <p className="text-sm text-muted-foreground">
                Display student's class ranking on report cards
              </p>
            </div>
            <Switch
              checked={preferences.showPositionOnReportCard}
              onCheckedChange={() => handleToggle("showPositionOnReportCard")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Attendance on Report Card</Label>
              <p className="text-sm text-muted-foreground">
                Include attendance statistics on report cards
              </p>
            </div>
            <Switch
              checked={preferences.showAttendanceOnReportCard}
              onCheckedChange={() => handleToggle("showAttendanceOnReportCard")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Class Teacher Remarks</Label>
              <p className="text-sm text-muted-foreground">
                Class teacher must add remarks before finalizing report card
              </p>
            </div>
            <Switch
              checked={preferences.requireTeacherRemarks}
              onCheckedChange={() => handleToggle("requireTeacherRemarks")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Head Teacher Remarks</Label>
              <p className="text-sm text-muted-foreground">
                Head teacher must add remarks before finalizing report card
              </p>
            </div>
            <Switch
              checked={preferences.requireHeadTeacherRemarks}
              onCheckedChange={() => handleToggle("requireHeadTeacherRemarks")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Academic Settings
          </CardTitle>
          <CardDescription>
            General academic rules and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passingGrade">Passing Grade (%)</Label>
            <select
              id="passingGrade"
              value={preferences.passingGrade}
              onChange={(e) => handleChange("passingGrade", Number(e.target.value))}
              className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="40">40%</option>
              <option value="45">45%</option>
              <option value="50">50%</option>
              <option value="55">55%</option>
              <option value="60">60%</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Minimum percentage required to pass a subject
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAbsencesPerTerm">Maximum Absences Per Term</Label>
            <select
              id="maxAbsencesPerTerm"
              value={preferences.maxAbsencesPerTerm}
              onChange={(e) => handleChange("maxAbsencesPerTerm", Number(e.target.value))}
              className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="10">10 days</option>
              <option value="15">15 days</option>
              <option value="20">20 days</option>
              <option value="25">25 days</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Students exceeding this limit may require special approval for promotion
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Promotion Workflow</Label>
              <p className="text-sm text-muted-foreground">
                Require approval process for student promotions
              </p>
            </div>
            <Switch
              checked={preferences.enablePromotionWorkflow}
              onCheckedChange={() => handleToggle("enablePromotionWorkflow")}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <Label className="text-base font-semibold">Automatic Promotion Policy</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Define criteria for automatic student promotion status calculation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionPolicy">Promotion Criteria</Label>
              <select
                id="promotionPolicy"
                value={preferences.promotionPolicy}
                onChange={(e) => handleChange("promotionPolicy", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="MANUAL">Manual (Admin/Head Teacher Decision Only)</option>
                <option value="PASS_BASED">Simple Pass-Based (Minimum subjects passed)</option>
                <option value="CORE_SUBJECTS">Core Subjects + Pass Rate</option>
                <option value="OVERALL_AVERAGE">Overall Average-Based</option>
                <option value="ATTENDANCE_PERFORMANCE">Attendance + Performance</option>
                <option value="ECZ_GRADE">ECZ Grade-Based (Zambian System)</option>
              </select>
              <div className={`bg-muted/50 p-3 rounded-md text-xs space-y-2 mt-2 transition-opacity ${preferences.promotionPolicy === "MANUAL" ? "opacity-50" : "opacity-100"}`}>
                {preferences.promotionPolicy === "MANUAL" && (
                  <p>Promotion status must be set manually by admin or head teacher. No automatic calculation.</p>
                )}
                {preferences.promotionPolicy === "PASS_BASED" && (
                  <>
                    <p><strong>PROMOTED:</strong> Student passes (≥{preferences.passingGrade}%) in at least 5 out of total subjects</p>
                    <p><strong>REPEAT:</strong> Student fails more than allowed subjects</p>
                  </>
                )}
                {preferences.promotionPolicy === "CORE_SUBJECTS" && (
                  <>
                    <p><strong>PROMOTED:</strong> Pass all core subjects (Math, English, Science) AND pass at least 50% of other subjects</p>
                    <p><strong>REPEAT:</strong> Fail any core subject OR overall pass rate below 50%</p>
                  </>
                )}
                {preferences.promotionPolicy === "OVERALL_AVERAGE" && (
                  <>
                    <p><strong>PROMOTED:</strong> Overall average across all subjects ≥ {preferences.passingGrade}%</p>
                    <p><strong>REPEAT:</strong> Overall average &lt; {preferences.passingGrade}%</p>
                  </>
                )}
                {preferences.promotionPolicy === "ATTENDANCE_PERFORMANCE" && (
                  <>
                    <p><strong>PROMOTED:</strong> Overall average ≥ {preferences.passingGrade}% AND attendance ≥ {preferences.minimumAttendanceForPromotion}%</p>
                    <p><strong>REPEAT:</strong> Either condition not met</p>
                  </>
                )}
                {preferences.promotionPolicy === "ECZ_GRADE" && (
                  <>
                    <p><strong>PROMOTED:</strong> No Grade 9 (fail) in core subjects, minimum 5 passes overall</p>
                    <p><strong>REPEAT:</strong> Grade 9 in core subjects OR less than 5 passes</p>
                  </>
                )}
              </div>
            </div>

            {preferences.promotionPolicy === "ATTENDANCE_PERFORMANCE" && (
              <div className="space-y-2 transition-opacity">
                <Label htmlFor="minimumAttendanceForPromotion">Minimum Attendance for Promotion (%)</Label>
                <select
                  id="minimumAttendanceForPromotion"
                  value={preferences.minimumAttendanceForPromotion}
                  onChange={(e) => handleChange("minimumAttendanceForPromotion", Number(e.target.value))}
                  className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="70">70%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                  <option value="85">85%</option>
                  <option value="90">90%</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Students must meet this attendance threshold along with performance requirements
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UI/UX */}
      <Card>
        <CardHeader>
          <CardTitle>User Interface</CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTheme">Default Theme</Label>
            <select
              id="defaultTheme"
              value={preferences.defaultTheme}
              onChange={(e) => handleChange("defaultTheme", e.target.value)}
              className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Smooth transitions and visual effects
              </p>
            </div>
            <Switch
              checked={preferences.enableAnimations}
              onCheckedChange={() => handleToggle("enableAnimations")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more dense information display
              </p>
            </div>
            <Switch
              checked={preferences.compactMode}
              onCheckedChange={() => handleToggle("compactMode")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Help Tooltips</Label>
              <p className="text-sm text-muted-foreground">
                Display helpful hints when hovering over UI elements
              </p>
            </div>
            <Switch
              checked={preferences.showHelpTooltips}
              onCheckedChange={() => handleToggle("showHelpTooltips")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save All Preferences"}
        </Button>
      </div>
    </div>
  );
}
