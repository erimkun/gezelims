#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Koordinatları Birbirine Yakın POI'leri Bulma
"""

import json
import math
from collections import defaultdict

# Dosya yolları
BASE_DIR = r"C:\Users\User\Desktop\vectormap\public\data\geojson"

def haversine_distance(coord1, coord2):
    """İki koordinat arasındaki mesafeyi metre cinsinden hesaplar"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    
    # Dünya yarıçapı (km)
    R = 6371.0
    
    # Radyana çevir
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    
    # Haversine formülü
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c * 1000  # metre cinsinden
    return distance

def load_all_pois():
    """Tüm kategorilerden POI'leri yükle"""
    all_pois = []
    categories = ['eglence', 'kultur-sanat', 'yemek', 'doga', 'diger']
    
    for category in categories:
        filepath = f"{BASE_DIR}\\{category}.geojson"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                features = data.get('features', [])
                for feature in features:
                    coords = feature['geometry']['coordinates']
                    props = feature['properties']
                    all_pois.append({
                        'id': props.get('id', 'unknown'),
                        'name': props.get('name', 'İsimsiz'),
                        'category': props.get('category', 'Bilinmiyor'),
                        'source_category': category,
                        'coordinates': coords,
                        'lon': coords[0],
                        'lat': coords[1]
                    })
                print(f"✓ {category}: {len(features)} POI yüklendi")
        except Exception as e:
            print(f"✗ {category}: HATA - {str(e)}")
    
    return all_pois

def find_close_pois(pois, distance_threshold=10):
    """
    Birbirine yakın POI'leri bul
    distance_threshold: metre cinsinden mesafe eşiği (varsayılan 10m)
    """
    print(f"\n🔍 {distance_threshold} metre içindeki POI'ler aranıyor...\n")
    
    close_pairs = []
    checked = set()
    
    total = len(pois)
    for i, poi1 in enumerate(pois):
        if (i + 1) % 1000 == 0:
            print(f"İlerleme: {i+1}/{total} POI kontrol edildi...")
        
        for j in range(i + 1, total):
            poi2 = pois[j]
            
            # Aynı POI'yi atlama
            pair_key = tuple(sorted([poi1['id'], poi2['id']]))
            if pair_key in checked:
                continue
            
            # Mesafeyi hesapla
            distance = haversine_distance(
                [poi1['lon'], poi1['lat']], 
                [poi2['lon'], poi2['lat']]
            )
            
            if distance <= distance_threshold:
                close_pairs.append({
                    'poi1': poi1,
                    'poi2': poi2,
                    'distance': distance,
                    'same_name': poi1['name'].lower() == poi2['name'].lower(),
                    'same_category': poi1['source_category'] == poi2['source_category']
                })
                checked.add(pair_key)
    
    return close_pairs

def analyze_duplicates(close_pairs):
    """Yakın POI'leri analiz et"""
    
    print("\n" + "="*70)
    print("YAKIN POI ANALİZİ")
    print("="*70)
    
    # Genel istatistikler
    print(f"\n📊 Genel İstatistikler:")
    print(f"  - Toplam yakın çift: {len(close_pairs)}")
    
    # Aynı isimli olanlar
    same_name = [p for p in close_pairs if p['same_name']]
    print(f"  - Aynı isimli: {len(same_name)} çift")
    
    # Farklı kategorilerde olanlar
    diff_category = [p for p in close_pairs if not p['same_category']]
    print(f"  - Farklı kategorilerde: {len(diff_category)} çift")
    
    # Mesafe dağılımı
    distances = [p['distance'] for p in close_pairs]
    if distances:
        print(f"\n📏 Mesafe Dağılımı:")
        print(f"  - Min: {min(distances):.2f}m")
        print(f"  - Max: {max(distances):.2f}m")
        print(f"  - Ortalama: {sum(distances)/len(distances):.2f}m")
    
    # Kategori kombinasyonları
    print(f"\n🔀 Kategori Kombinasyonları:")
    category_combos = defaultdict(int)
    for pair in close_pairs:
        cats = tuple(sorted([pair['poi1']['source_category'], pair['poi2']['source_category']]))
        category_combos[cats] += 1
    
    for combo, count in sorted(category_combos.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {combo[0]} ↔ {combo[1]}: {count} çift")
    
    # En yakın 20 çifti göster
    print(f"\n🎯 En Yakın 20 POI Çifti:")
    print("-" * 70)
    
    sorted_pairs = sorted(close_pairs, key=lambda x: x['distance'])[:20]
    for idx, pair in enumerate(sorted_pairs, 1):
        poi1 = pair['poi1']
        poi2 = pair['poi2']
        dist = pair['distance']
        
        print(f"\n{idx}. Mesafe: {dist:.2f}m")
        print(f"   POI 1: {poi1['name']} ({poi1['source_category']}) - {poi1['category']}")
        print(f"   POI 2: {poi2['name']} ({poi2['source_category']}) - {poi2['category']}")
        if pair['same_name']:
            print(f"   ⚠️  AYNI İSİM!")
    
    # Farklı kategorilerde aynı isimli olanlar
    print(f"\n⚠️  Farklı Kategorilerde Aynı İsimli Olanlar:")
    print("-" * 70)
    
    same_name_diff_cat = [p for p in close_pairs if p['same_name'] and not p['same_category']]
    if same_name_diff_cat:
        for idx, pair in enumerate(same_name_diff_cat[:10], 1):
            poi1 = pair['poi1']
            poi2 = pair['poi2']
            print(f"\n{idx}. {poi1['name']}")
            print(f"   Kategori 1: {poi1['source_category']} ({poi1['category']})")
            print(f"   Kategori 2: {poi2['source_category']} ({poi2['category']})")
            print(f"   Mesafe: {pair['distance']:.2f}m")
    else:
        print("   ✓ Farklı kategorilerde aynı isimli POI bulunamadı")

def main():
    print("="*70)
    print("YAKIN POI TESPİT ARACI")
    print("="*70)
    
    # 1. Tüm POI'leri yükle
    print("\n1. POI'ler yükleniyor...")
    all_pois = load_all_pois()
    print(f"\n✓ Toplam {len(all_pois)} POI yüklendi")
    
    # 2. Yakın POI'leri bul (10 metre içinde)
    print("\n2. Yakın POI'ler aranıyor...")
    close_pairs = find_close_pois(all_pois, distance_threshold=10)
    
    # 3. Analiz et
    analyze_duplicates(close_pairs)
    
    # 4. Sonuçları kaydet
    output_file = f"{BASE_DIR}\\duplicate_analysis.json"
    result = {
        'total_pois': len(all_pois),
        'close_pairs_count': len(close_pairs),
        'distance_threshold_meters': 10,
        'close_pairs': [
            {
                'poi1_id': p['poi1']['id'],
                'poi1_name': p['poi1']['name'],
                'poi1_category': p['poi1']['source_category'],
                'poi2_id': p['poi2']['id'],
                'poi2_name': p['poi2']['name'],
                'poi2_category': p['poi2']['source_category'],
                'distance_meters': round(p['distance'], 2),
                'same_name': p['same_name'],
                'same_category': p['same_category']
            }
            for p in sorted(close_pairs, key=lambda x: x['distance'])
        ]
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Detaylı sonuçlar kaydedildi: {output_file}")
    
    print("\n" + "="*70)
    print("✓ ANALİZ TAMAMLANDI!")
    print("="*70)

if __name__ == "__main__":
    main()
