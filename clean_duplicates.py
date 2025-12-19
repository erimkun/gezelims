#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Duplike POI'leri Temizleme
"""

import json
import math
import re
from collections import defaultdict
from difflib import SequenceMatcher

# Dosya yolları
BASE_DIR = r"C:\Users\User\Desktop\vectormap\public\data\geojson"

def normalize_name(name):
    """İsmi normalize et (küçük harf, özel karakterler kaldır)"""
    if not name:
        return ""
    # Küçük harfe çevir
    name = name.lower()
    # Türkçe karakterleri değiştir
    replacements = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'â': 'a', 'î': 'i', 'û': 'u'
    }
    for old, new in replacements.items():
        name = name.replace(old, new)
    # Özel karakterleri temizle
    name = re.sub(r'[^\w\s]', '', name)
    # Fazla boşlukları temizle
    name = ' '.join(name.split())
    return name

def is_similar_name(name1, name2, threshold=0.85):
    """İki ismin benzerliğini kontrol et"""
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    
    if not norm1 or not norm2:
        return False
    
    # Tam eşleşme
    if norm1 == norm2:
        return True
    
    # Biri diğerini içeriyor mu (park sahası örneği için)
    if norm1 in norm2 or norm2 in norm1:
        return True
    
    # Similarity oranı
    similarity = SequenceMatcher(None, norm1, norm2).ratio()
    return similarity >= threshold

def haversine_distance(coord1, coord2):
    """İki koordinat arasındaki mesafeyi metre cinsinden hesaplar"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    
    R = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c * 1000
    return distance

def load_geojson(category):
    """GeoJSON dosyasını yükle"""
    filepath = f"{BASE_DIR}\\{category}.geojson"
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_geojson(category, data):
    """GeoJSON dosyasını kaydet"""
    filepath = f"{BASE_DIR}\\{category}.geojson"
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def find_duplicates_in_category(features, category_name):
    """Bir kategorideki duplikaları bul"""
    duplicates = []
    checked = set()
    
    for i, feat1 in enumerate(features):
        props1 = feat1['properties']
        coords1 = feat1['geometry']['coordinates']
        id1 = props1.get('id', f'unknown_{i}')
        name1 = props1.get('name', '')
        
        if id1 in checked:
            continue
        
        for j in range(i + 1, len(features)):
            feat2 = features[j]
            props2 = feat2['properties']
            coords2 = feat2['geometry']['coordinates']
            id2 = props2.get('id', f'unknown_{j}')
            name2 = props2.get('name', '')
            
            if id2 in checked:
                continue
            
            # Mesafeyi hesapla
            distance = haversine_distance(coords1, coords2)
            
            # 15 metre içinde ve benzer isimde ise duplikat
            if distance <= 15 and is_similar_name(name1, name2):
                duplicates.append({
                    'keep_index': i,  # İlkini tut
                    'remove_index': j,  # İkincisini sil
                    'keep_id': id1,
                    'remove_id': id2,
                    'name1': name1,
                    'name2': name2,
                    'distance': distance
                })
                checked.add(id2)
    
    return duplicates

def remove_duplicates():
    """Tüm kategorilerden duplikaları temizle"""
    
    print("="*70)
    print("DUPLİKAT TEMİZLEME")
    print("="*70)
    
    categories = ['eglence', 'kultur-sanat', 'yemek', 'doga', 'diger']
    total_removed = 0
    
    for category in categories:
        print(f"\n📂 {category.upper()} kategorisi işleniyor...")
        
        # GeoJSON yükle
        data = load_geojson(category)
        features = data.get('features', [])
        original_count = len(features)
        
        print(f"  - Orijinal POI sayısı: {original_count}")
        
        # Duplikaları bul
        duplicates = find_duplicates_in_category(features, category)
        
        if duplicates:
            print(f"  - {len(duplicates)} duplikat bulundu!")
            
            # Duplikat örnekleri göster (ilk 5)
            print(f"\n  📋 Örnek Duplikatlar:")
            for i, dup in enumerate(duplicates[:5], 1):
                print(f"    {i}. '{dup['name1']}' ≈ '{dup['name2']}' ({dup['distance']:.2f}m)")
            
            # Silinecek indeksleri topla
            remove_indices = set(dup['remove_index'] for dup in duplicates)
            
            # Yeni features listesi oluştur (duplikatlar hariç)
            new_features = [
                feat for idx, feat in enumerate(features)
                if idx not in remove_indices
            ]
            
            # Güncelle
            data['features'] = new_features
            save_geojson(category, data)
            
            removed_count = len(remove_indices)
            total_removed += removed_count
            
            print(f"  ✓ {removed_count} duplikat silindi")
            print(f"  ✓ Yeni POI sayısı: {len(new_features)}")
        else:
            print(f"  ✓ Duplikat bulunamadı")
    
    print("\n" + "="*70)
    print(f"✅ TEMİZLEME TAMAMLANDI!")
    print(f"   Toplam {total_removed} duplikat POI temizlendi")
    print("="*70)
    
    return total_removed

def main():
    # Duplikaları temizle
    total_removed = remove_duplicates()
    
    if total_removed > 0:
        print("\n🔄 Yeni duplikat analizi yapılıyor...\n")
        
        # Yeni analiz için komutu çalıştır
        import subprocess
        subprocess.run(['python', 'find_duplicates.py'], cwd=r'C:\Users\User\Desktop\vectormap')
    else:
        print("\n✓ Temizlenecek duplikat bulunamadı!")

if __name__ == "__main__":
    main()
