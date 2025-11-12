// components/alerts/AlertRuleCard.tsx - FIXED
"use client";

import { useState } from "react";
import { Trash2, Save, Edit, X } from "lucide-react";
import type { AlertRule } from "@/types/alerts";

interface AlertRuleCardProps {
  rule: AlertRule;
  sensorOptions: Array<{ value: string; label: string; unit: string }>;
  isDarkMode: boolean;
  onUpdate: (rule: AlertRule) => void;
  onDelete: (id: string) => void;
}

export default function AlertRuleCard({
  rule,
  sensorOptions,
  isDarkMode,
  onUpdate,
  onDelete,
}: AlertRuleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState(rule);

  const handleSave = () => {
    onUpdate(editedRule);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRule(rule);
    setIsEditing(false);
  };

  const selectedSensor = sensorOptions.find(
    (s) => s.value === editedRule.sensor
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return isDarkMode
          ? "text-red-400 bg-red-500/10 border-red-500/30"
          : "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return isDarkMode
          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
          : "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return isDarkMode
          ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
          : "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return isDarkMode
          ? "text-gray-400 bg-gray-500/10 border-gray-500/30"
          : "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border transition-all ${
        isDarkMode
          ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      {isEditing ? (
        <div className="space-y-4">
          {/* Sensor Selection */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Sensor
            </label>
            <select
              value={editedRule.sensor}
              onChange={(e) =>
                setEditedRule({ ...editedRule, sensor: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 outline-none`}
              aria-label="sensor"
            >
              {sensorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition and Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Condition
              </label>
              <select
                value={editedRule.condition}
                onChange={(e) =>
                  setEditedRule({
                    ...editedRule,
                    condition: e.target.value as "above" | "below",
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 outline-none`}
                aria-label="condition"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Threshold ({selectedSensor?.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={editedRule.threshold}
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ แก้ไข: ตรวจสอบ NaN ก่อนบันทึก
                  const numValue = parseFloat(value);
                  setEditedRule({
                    ...editedRule,
                    threshold: isNaN(numValue) ? 0 : numValue,
                  });
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } focus:ring-2 focus:ring-blue-500 outline-none`}
                aria-label="threshold"
                min="0"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Severity
            </label>
            <select
              value={editedRule.severity}
              onChange={(e) =>
                setEditedRule({
                  ...editedRule,
                  severity: e.target.value as "info" | "warning" | "critical",
                })
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 outline-none`}
              aria-label="severity"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3
                  className={`text-lg font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedSensor?.label}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(
                    rule.severity
                  )}`}
                >
                  {rule.severity.toUpperCase()}
                </span>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Alert when value is{" "}
                <span className="font-bold">
                  {rule.condition} {rule.threshold} {selectedSensor?.unit}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) =>
                    onUpdate({ ...rule, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                  aria-label="enabled"
                />
                <div
                  className={`w-11 h-6 rounded-full peer ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}
                ></div>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you want to delete this alert rule?")
                ) {
                  onDelete(rule.id);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
