#!/bin/bash
# AquaGuard Database Backup & Restore Automation Script

set -e

# Configuration variables
DB_HOST=${PGHOST:-"localhost"}
DB_USER=${PGUSER:-"postgres"}
DB_NAME=${PGDATABASE:-"aquaguard"}
BACKUP_DIR="/tmp/aquaguard_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

# Functions
backup_db() {
    echo "========================================="
    echo "Starting AquaGuard Database Backup"
    echo "Timestamp: $TIMESTAMP"
    echo "DB Host: $DB_HOST"
    echo "========================================="
    
    # Run pg_dump export
    pg_dump -h "$DB_HOST" -U "$DB_USER" -F p -d "$DB_NAME" > "$BACKUP_FILE"
    
    echo "Backup completed successfully."
    echo "File location: $BACKUP_FILE"
}

restore_db() {
    local target_file=$1
    if [ -z "$target_file" ]; then
        echo "Error: Please specify the SQL file path to restore."
        exit 1
    fi
    
    echo "========================================="
    echo "Restoring AquaGuard Database from File"
    echo "Target File: $target_file"
    echo "DB Host: $DB_HOST"
    echo "========================================="
    
    # Restore db schema and records
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$target_file"
    
    echo "Database restoration completed successfully."
}

usage() {
    echo "Usage: $0 {backup|restore <file_path>}"
    exit 1
}

# Argument dispatch
case "$1" in
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    *)
        usage
        ;;
esac
