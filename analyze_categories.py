#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kategori Ağacı Analizi
"""

import json
from collections import defaultdict

BASE_DIR = r"C:\Users\User\Desktop\vectormap\geojson"

def analyze_categories():
    categories = ['eglence', 'kultur-sanat', 'yemek', 'doga', 'diger']
    
    print("="*70)
    print("KATEGORİ AĞACI ANALİZİ")
    print("="*70)
    
    for cat in categories:
        filepath = f"{BASE_DIR}\\{cat}.geojson"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                features = data.get('features', [])
                
                # Alt kategorileri topla
                subcats = defaultdict(int)
                for feat in features:
                    subcat = feat['properties'].get('category', 'Bilinmiyor')
                    subcats[subcat] += 1
                
                print(f"\n📂 {cat.upper()} ({len(features)} POI)")
                print("-" * 70)
                
                # En çok olandan aza sırala
                sorted_subcats = sorted(subcats.items(), key=lambda x: x[1], reverse=True)
                
                for subcat, count in sorted_subcats[:20]:
                    percentage = (count / len(features)) * 100
                    bar = "█" * int(percentage / 5)
                    print(f"  ├─ {subcat:<40} {count:>4} ({percentage:>5.1f}%) {bar}")
                
                if len(sorted_subcats) > 20:
                    remaining = sum(count for _, count in sorted_subcats[20:])
                    print(f"  └─ ... {len(sorted_subcats) - 20} diğer alt kategori ({remaining} POI)")
        
        except Exception as e:
            print(f"\n❌ {cat}: HATA - {str(e)}")

if __name__ == "__main__":
    analyze_categories()
