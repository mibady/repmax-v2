"use client";

import { useState } from "react";
import { ROLE_LABELS } from "@/lib/utils/role-labels";

export type UserRole = "athlete" | "parent" | "coach" | "recruiter" | "club";

interface RoleSwitcherProps {
  currentRole: UserRole;
  availableRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
}

const roleColors: Record<UserRole, string> = {
  athlete: "bg-primary",
  parent: "bg-blue-500",
  coach: "bg-green-500",
  recruiter: "bg-purple-500",
  club: "bg-orange-500",
};

const roleConfig: Record<UserRole, { label: string; icon: string; color: string }> = {
  athlete: { label: ROLE_LABELS.athlete.full, icon: ROLE_LABELS.athlete.icon, color: roleColors.athlete },
  parent: { label: ROLE_LABELS.parent.full, icon: ROLE_LABELS.parent.icon, color: roleColors.parent },
  coach: { label: ROLE_LABELS.coach.full, icon: ROLE_LABELS.coach.icon, color: roleColors.coach },
  recruiter: { label: ROLE_LABELS.recruiter.full, icon: ROLE_LABELS.recruiter.icon, color: roleColors.recruiter },
  club: { label: ROLE_LABELS.club.full, icon: ROLE_LABELS.club.icon, color: roleColors.club },
};

export function RoleSwitcher({ currentRole, availableRoles, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (availableRoles.length <= 1) {
    return null;
  }

  const current = roleConfig[currentRole];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-dark border border-white/10 hover:border-white/20 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${current.color}`} />
        <span className="text-sm font-medium text-white">{current.label}</span>
        <span className="material-symbols-rounded text-text-grey text-lg">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-surface-dark border border-white/10 shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-text-grey px-2 py-1 uppercase tracking-wider">
                Switch Role
              </p>
            </div>
            <div className="border-t border-white/5">
              {availableRoles.map((role) => {
                const config = roleConfig[role];
                const isActive = role === currentRole;

                return (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                      isActive ? "bg-white/5" : ""
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                      <span className="material-symbols-rounded text-white text-lg">
                        {config.icon}
                      </span>
                    </span>
                    <span className="flex-1 text-left">
                      <span className="block text-sm font-medium text-white">
                        {config.label}
                      </span>
                    </span>
                    {isActive && (
                      <span className="material-symbols-rounded text-primary">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
