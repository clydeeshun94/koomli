import sqlite3
import json
from datetime import datetime, timedelta
from collections import defaultdict

def get_disease_statistics():
    """
    Get comprehensive disease statistics
    """
    conn = sqlite3.connect('disease_detection.db')
    cursor = conn.cursor()
    
    # Get overall disease counts
    cursor.execute('''
    SELECT detected_diseases, COUNT(*) as count
    FROM detections
    GROUP BY detected_diseases
    ORDER BY count DESC
    ''')
    
    disease_counts = cursor.fetchall()
    
    # Get geographical distribution
    cursor.execute('''
    SELECT location_name, latitude, longitude, detected_diseases, COUNT(*) as count
    FROM detections
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY location_name, detected_diseases
    ORDER BY count DESC
    ''')
    
    geo_distribution = cursor.fetchall()
    
    # Get time-based statistics (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    cursor.execute('''
    SELECT DATE(timestamp) as date, detected_diseases, COUNT(*) as count
    FROM detections
    WHERE timestamp >= ?
    GROUP BY DATE(timestamp), detected_diseases
    ORDER BY date DESC
    ''', (thirty_days_ago,))
    
    time_series = cursor.fetchall()
    
    conn.close()
    
    return {
        'disease_counts': disease_counts,
        'geo_distribution': geo_distribution,
        'time_series': time_series
    }

def get_disease_heatmap_data():
    """
    Get data for disease heatmap visualization
    """
    conn = sqlite3.connect('disease_detection.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT latitude, longitude, detected_diseases, COUNT(*) as intensity
    FROM detections
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY latitude, longitude, detected_diseases
    ORDER BY intensity DESC
    ''')
    
    heatmap_data = cursor.fetchall()
    conn.close()
    
    return heatmap_data

def get_top_diseases_by_location():
    """
    Get top diseases by location for regional analysis
    """
    conn = sqlite3.connect('disease_detection.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT location_name, detected_diseases, COUNT(*) as count
    FROM detections
    WHERE location_name IS NOT NULL
    GROUP BY location_name, detected_diseases
    ORDER BY location_name, count DESC
    ''')
    
    location_diseases = cursor.fetchall()
    conn.close()
    
    # Group by location
    location_dict = defaultdict(list)
    for location, disease, count in location_diseases:
        location_dict[location].append({
            'disease': disease,
            'count': count
        })
    
    return dict(location_dict)

def get_monthly_trends():
    """
    Get monthly disease detection trends
    """
    conn = sqlite3.connect('disease_detection.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT strftime('%Y-%m', timestamp) as month, detected_diseases, COUNT(*) as count
    FROM detections
    GROUP BY strftime('%Y-%m', timestamp), detected_diseases
    ORDER BY month DESC
    ''')
    
    monthly_trends = cursor.fetchall()
    conn.close()
    
    return monthly_trends

def get_disease_severity_index():
    """
    Calculate a disease severity index based on detection frequency and distribution
    """
    conn = sqlite3.connect('disease_detection.db')
    cursor = conn.cursor()
    
    # Get total detections per disease
    cursor.execute('''
    SELECT detected_diseases, COUNT(*) as total_count, COUNT(DISTINCT location_name) as location_count
    FROM detections
    GROUP BY detected_diseases
    ''')
    
    disease_stats = cursor.fetchall()
    conn.close()
    
    severity_index = []
    for disease, total_count, location_count in disease_stats:
        # Simple severity calculation: total_count * location_count
        severity = total_count * location_count
        severity_index.append({
            'disease': disease,
            'total_detections': total_count,
            'locations_affected': location_count,
            'severity_index': severity
        })
    
    # Sort by severity index
    severity_index.sort(key=lambda x: x['severity_index'], reverse=True)
    
    return severity_index

def export_analytics_data():
    """
    Export all analytics data as JSON for frontend consumption
    """
    stats = get_disease_statistics()
    heatmap_data = get_disease_heatmap_data()
    location_diseases = get_top_diseases_by_location()
    monthly_trends = get_monthly_trends()
    severity_index = get_disease_severity_index()
    
    export_data = {
        'disease_statistics': stats,
        'heatmap_data': heatmap_data,
        'location_diseases': location_diseases,
        'monthly_trends': monthly_trends,
        'severity_index': severity_index,
        'export_timestamp': datetime.now().isoformat()
    }
    
    return export_data

if __name__ == '__main__':
    # Test the analytics functions
    print("Testing analytics functions...")
    
    stats = get_disease_statistics()
    print(f"Disease counts: {len(stats['disease_counts'])}")
    print(f"Geo distribution points: {len(stats['geo_distribution'])}")
    
    severity_index = get_disease_severity_index()
    print(f"Severity index entries: {len(severity_index)}")
    
    export_data = export_analytics_data()
    print(f"Export data keys: {list(export_data.keys())}")
    print("Analytics module working correctly!")