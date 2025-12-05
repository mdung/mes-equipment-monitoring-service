package com.mes.model;

public enum Role {
    ADMIN,      // Full access to all features
    SUPERVISOR, // Can manage production, view reports
    OPERATOR,   // Can update production data, record quality checks
    VIEWER      // Read-only access
}
