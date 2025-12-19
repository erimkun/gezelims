import json
import os

# Dosya yolunu doğru şekilde ayarla
file_path = os.path.join('pearl_of_the_istanbul', 'public', 'data', 'doga.geojson')

# Dosyayı oku
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Başlangıç feature sayısı
initial_count = len(data['features'])

# Otopark içermeyen feature'ları filtrele
filtered_features = []
removed_items = []

for feature in data['features']:
    properties = feature.get('properties', {})
    name = properties.get('name', '')
    subcategory = properties.get('subcategory', '')
    category = properties.get('category', '')
    address = properties.get('address', '')
    
    # Tüm alanlarda otopark veya İspark ara (büyük/küçük harf duyarsız)
    text_to_check = f"{name} {subcategory} {category} {address}".lower()
    
    # Otopark veya İspark içeren verileri atla
    if 'otopark' in text_to_check or 'ispark' in text_to_check or 'İspark' in name:
        removed_items.append(name)
        continue
    
    filtered_features.append(feature)

# Yeni veriyi kaydet
data['features'] = filtered_features
final_count = len(data['features'])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Temizleme tamamlandı!")
print(f"📊 Başlangıç: {initial_count} feature")
print(f"📊 Silinen: {initial_count - final_count} otopark verisi")
print(f"📊 Kalan: {final_count} feature")
print(f"\n🗑️  Silinen bazı örnekler:")
for item in removed_items[:10]:
    print(f"  - {item}")
