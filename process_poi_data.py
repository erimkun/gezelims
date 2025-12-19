#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
POI Verilerini Kategorilere Göre Ayırma ve GeoJSON Oluşturma
"""

import json
import os
from collections import defaultdict

# Dosya yolları
BASE_DIR = r"C:\Users\User\Desktop\vectormap\public\data"
GEOJSON_DIR = os.path.join(BASE_DIR, "geojson")
OUTPUT_DIR = GEOJSON_DIR

# Kategori eşleştirme haritası
CATEGORY_MAPPING = {
    # Eğlence kategorisi
    'eglence': [
        'sinema', 'sinema salonu', 'tiyatro', 'tiyatro sahnesi', 'çocuk tiyatrosu',
        'alışveriş merkezi', 'alisveris merkezi', 'avm', 'çarşı', 'carsi',
        'balıkçılar çarşısı', 'kuyumcular çarşısı', 'akvaryum', 'etkinlik mekanı',
        'etkinlik mekani', 'nargile salonu', 'eglence', 'oyun salonu',
        'dugun salonu', 'düğün salonu'
    ],
    
    # Kültür-Sanat kategorisi
    'kultur-sanat': [
        'müze', 'muze', 'sanat müzesi', 'sanat muzesi', 'tarihi yer müzesi',
        'tarihi yer muzesi', 'kültür merkezi', 'kultur merkezi', 'sanat merkezi',
        'konferans merkezi', 'kongre merkezi', 'film stüdyosu', 'film studyosu',
        'atölye', 'atolye', 'eğitim merkezi', 'egitim merkezi', 'kultur', 'sanat',
        'kultur turizm', 'kültür turizm', 'topluluk merkezi'
    ],
    
    # Yemek kategorisi
    'yemek': [
        'restoran', 'kafe', 'kahve', 'kahve dükkanı', 'kahve dukkani', 'cafe',
        'tatlıcı', 'tatlici', 'pastane', 'mantıcı', 'mantici', 'köfteci', 'kofteci',
        'dönerci', 'donerci', 'lounge', 'nargile', 'çay bahçesi', 'cay bahcesi',
        'büfe', 'bufe', 'fast food', 'restaurant', 'yemek', 'lokanta',
        'izgara', 'falafel', 'lübnan', 'türk mutfağı', 'turk mutfagi',
        'pideci', 'meyhane', 'börekçi', 'borekci', 'fırın', 'firin',
        'yeme icme', 'yeme içme', 'geleneksel cay', 'geleneksel çay',
        'tostçu', 'tostcu', 'bar', 'bira salonu', 'salata dükkanı', 'salata dukkani',
        'tatlı dükkanı', 'tatli dukkani', 'piyano bar', 'sandviç', 'sandvic',
        'dondurma dükkanı', 'dondurma dukkani'
    ],
    
    # Doğa kategorisi (yeni)
    'doga': [
        'park', 'bahçe', 'bahce', 'yürüyüş', 'yürüyüş yolu', 'yuruyus', 
        'mesire', 'piknik', 'orman', 'doğa', 'doga', 'sahil', 'plaj',
        'koruluk', 'yeşil alan', 'yesil alan', 'botanik', 'hayvanat bahçesi',
        'hayvanat bahcesi', 'manzara', 'seyir terası', 'seyir terasi', 'spor'
    ]
}

# Silinecek kategoriler
EXCLUDE_CATEGORIES = [
    'emlak konut', 'konut', 'sanayi', 'hizmet', 'ticaret',
    'finans', 'askeri', 'altyapı', 'altyapi',
    'dis klinigi', 'dış kliniği', 'elektronik tamir',
    'icme suyu tedarikcisi', 'içme suyu tedarikcisi',
    'icme suyu cesmesi', 'içme suyu çeşmesi'
]

def should_exclude(properties):
    """POI'nin silinip silinmeyeceğini kontrol eder"""
    # category alanını kontrol et
    if 'category' in properties:
        category_text = properties['category'].lower()
        if any(keyword in category_text for keyword in EXCLUDE_CATEGORIES):
            return True
    
    # ana_kategori alanını kontrol et
    if 'ana_kategori' in properties:
        ana_kat = properties['ana_kategori'].lower()
        alt_kat = properties.get('alt_kategori', '').lower()
        combined = f"{ana_kat} {alt_kat}"
        if any(keyword in combined for keyword in EXCLUDE_CATEGORIES):
            return True
    
    return False

def categorize_poi(properties):
    """POI'yi kategorisine göre belirler"""
    
    # Önce silinecekler listesinde mi kontrol et
    if should_exclude(properties):
        return 'EXCLUDE'
    
    # Mevcut JSON dosyalarındaki category alanı
    if 'category' in properties:
        category_text = properties['category'].lower()
        for main_cat, keywords in CATEGORY_MAPPING.items():
            if any(keyword in category_text for keyword in keywords):
                return main_cat
    
    # poi.geojson'daki ana_kategori ve alt_kategori alanları
    if 'ana_kategori' in properties:
        ana_kat = properties['ana_kategori'].lower()
        alt_kat = properties.get('alt_kategori', '').lower()
        combined = f"{ana_kat} {alt_kat}"
        
        for main_cat, keywords in CATEGORY_MAPPING.items():
            if any(keyword in combined for keyword in keywords):
                return main_cat
    
    # poi_adi veya name'e bakarak tahmin
    name_field = properties.get('name') or properties.get('poi_adi', '')
    if name_field:
        name_lower = name_field.lower()
        for main_cat, keywords in CATEGORY_MAPPING.items():
            if any(keyword in name_lower for keyword in keywords):
                return main_cat
    
    return None

def normalize_feature(feature, source_file):
    """Feature'ı normalize et"""
    props = feature['properties']
    
    # Benzersiz ID oluştur
    feature_id = (
        props.get('id') or 
        props.get('﻿poi_id') or 
        props.get('poi_id') or
        f"{source_file}_{hash(str(feature))}"
    )
    
    # Normalize edilmiş properties
    normalized_props = {
        'id': str(feature_id),
        'name': props.get('name') or props.get('poi_adi', ''),
        'category': props.get('category') or props.get('ana_kategori', ''),
        'subcategory': props.get('alt_kategori', ''),
        'address': props.get('address') or props.get('adres', ''),
        'description': props.get('description') or props.get('aciklama', ''),
        'source': source_file
    }
    
    # Opsiyonel alanlar
    optional_fields = ['phone', 'website', 'rating', 'reviews_count', 'images', 
                       'workday_timing', 'closed_on']
    for field in optional_fields:
        if field in props:
            normalized_props[field] = props[field]
    
    return {
        'type': 'Feature',
        'geometry': feature['geometry'],
        'properties': normalized_props
    }

def load_and_process_geojson(filepath, source_name):
    """GeoJSON dosyasını yükle ve işle"""
    print(f"İşleniyor: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            features = data.get('features', [])
            print(f"  - {len(features)} feature bulundu")
            return [normalize_feature(f, source_name) for f in features]
    except Exception as e:
        print(f"  - HATA: {str(e)}")
        return []

def load_and_convert_json(filepath, source_name):
    """JSON dosyasını GeoJSON formatına çevir"""
    print(f"İşleniyor: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            features = []
            
            for item in data:
                if 'coordinates' in item:
                    feature = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': item['coordinates']
                        },
                        'properties': {k: v for k, v in item.items() if k != 'coordinates'}
                    }
                    features.append(normalize_feature(feature, source_name))
            
            print(f"  - {len(features)} feature oluşturuldu")
            return features
    except Exception as e:
        print(f"  - HATA: {str(e)}")
        return []

def main():
    print("=" * 60)
    print("POI VERİLERİNİ KATEGORİLERE AYIRMA")
    print("=" * 60)
    
    all_features = []
    unique_ids = set()
    
    # 1. GeoJSON dosyalarını yükle
    print("\n1. GeoJSON dosyaları yükleniyor...")
    geojson_files = [
        ('poi.geojson', 'poi'),
        ('eglence.geojson', 'eglence'),
        ('kultur_sanat.geojson', 'kultur_sanat'),
        ('yemek.geojson', 'yemek')
    ]
    
    for filename, source in geojson_files:
        filepath = os.path.join(GEOJSON_DIR, filename)
        if os.path.exists(filepath):
            features = load_and_process_geojson(filepath, source)
            for feature in features:
                feature_id = feature['properties']['id']
                if feature_id not in unique_ids:
                    all_features.append(feature)
                    unique_ids.add(feature_id)
    
    # 2. JSON dosyalarını yükle
    print("\n2. JSON dosyaları yükleniyor...")
    json_files = [
        ('eglence.json', 'eglence_json'),
        ('kultur-sanat.json', 'kultur_sanat_json'),
        ('yemek.json', 'yemek_json')
    ]
    
    for filename, source in json_files:
        filepath = os.path.join(BASE_DIR, filename)
        if os.path.exists(filepath):
            features = load_and_convert_json(filepath, source)
            for feature in features:
                feature_id = feature['properties']['id']
                if feature_id not in unique_ids:
                    all_features.append(feature)
                    unique_ids.add(feature_id)
    
    print(f"\n✓ Toplam {len(all_features)} benzersiz feature yüklendi")
    
    # 3. Kategorilere ayır
    print("\n3. Kategorilere ayırılıyor...")
    categorized = defaultdict(list)
    uncategorized = []
    excluded_count = 0
    
    for feature in all_features:
        category = categorize_poi(feature['properties'])
        if category == 'EXCLUDE':
            excluded_count += 1
            continue
        elif category:
            categorized[category].append(feature)
        else:
            uncategorized.append(feature)
    
    # İstatistikleri göster
    print("\nKategori İstatistikleri:")
    for cat in ['eglence', 'kultur-sanat', 'yemek', 'doga']:
        count = len(categorized[cat])
        print(f"  - {cat.upper()}: {count} mekan")
    print(f"  - Kategorize edilemedi: {len(uncategorized)} mekan")
    print(f"  - Silindi (Emlak, Ticaret, Sanayi, Hizmet, Finans, vb.): {excluded_count} mekan")
    
    # 4. GeoJSON dosyalarını oluştur
    print("\n4. GeoJSON dosyaları oluşturuluyor...")
    
    for category, features in categorized.items():
        if features:
            output_file = os.path.join(OUTPUT_DIR, f"{category}.geojson")
            geojson_data = {
                "type": "FeatureCollection",
                "features": features
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(geojson_data, f, ensure_ascii=False, indent=2)
            
            print(f"  ✓ {output_file} oluşturuldu ({len(features)} feature)")
    
    # Kategorize edilemeyenleri de kaydet
    if uncategorized:
        output_file = os.path.join(OUTPUT_DIR, "diger.geojson")
        geojson_data = {
            "type": "FeatureCollection",
            "features": uncategorized
        }
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson_data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {output_file} oluşturuldu ({len(uncategorized)} feature)")
    
    # 5. Tüm verileri tek dosyada birleştir
    print("\n5. Birleştirilmiş dosya oluşturuluyor...")
    all_output = os.path.join(OUTPUT_DIR, "all_poi.geojson")
    all_geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }
    with open(all_output, 'w', encoding='utf-8') as f:
        json.dump(all_geojson, f, ensure_ascii=False, indent=2)
    print(f"  ✓ {all_output} oluşturuldu ({len(all_features)} feature)")
    
    print("\n" + "=" * 60)
    print("✓ İŞLEM TAMAMLANDI!")
    print("=" * 60)
    print(f"\nOluşturulan dosyalar:")
    print(f"  - {OUTPUT_DIR}\\eglence.geojson")
    print(f"  - {OUTPUT_DIR}\\kultur-sanat.geojson")
    print(f"  - {OUTPUT_DIR}\\yemek.geojson")
    print(f"  - {OUTPUT_DIR}\\doga.geojson")
    print(f"  - {OUTPUT_DIR}\\all_poi.geojson")
    if uncategorized:
        print(f"  - {OUTPUT_DIR}\\diger.geojson")

if __name__ == "__main__":
    main()
