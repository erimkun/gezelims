# Routes Page Development Plan

## 1. Mevcut Durum Analizi

Kullanıcının sorusu üzerine yapılan incelemeler sonucunda:
- **Rotalar Nerede Tutuluyor?**
  - Rotalar şu anda Firebase **Firestore** veritabanında `routes` isimli bir koleksiyonda tutulmaktadır.
  - `src/services/routeService.ts` dosyası bu koleksiyon ile iletişim kuran fonksiyonları (create, get, update, delete) içerir.
  
- **Beğeniler (Likes) Nerede Tutuluyor?**
  - Beğeniler, `routes` koleksiyonundaki her bir dokümanın içinde `votes` (sayı) ve `votedBy` (kullanıcı ID dizisi) alanlarında tutulmaktadır.
  - Anonim (giriş yapmamış) kullanıcılar için `routeStore.ts` içinde geçici bir `guestId` oluşturma mantığı mevcuttur.

- **Yorumlar (Comments) Nerede Tutuluyor?**
  - **Eksik:** Şu anki yapıda rotalara yapılan kullanıcı yorumları için bir yapı **bulunmamaktadır**.
  - `RoutePoint` içindeki `comment` alanı, rotayı oluşturan kişinin o nokta için yazdığı açıklamadır. Başkalarının rotaya yaptığı yorumlar değildir.

## 2. Yapılacaklar Listesi (Implementation Plan)

### Faz 1: Giriş Yapmamış Kullanıcılar İçin Görüntüleme (Unauthenticated Access)
Şu anki servis yapısı herkese açık okumaya izin veriyor gibi görünse de, UI tarafında kontroller yapılması gerekebilir.

- [x] `RoutesPage.tsx` bileşeninde `useEffect` ile sayfa yüklendiğinde `loadRoutes()` fonksiyonunun çağrıldığından emin olunması.
- [x] Eğer varsa, sadece giriş yapmış kullanıcıları kontrol eden engellerin (guards) "görüntüleme" modu için kaldırılması.
- [x] Rota oluşturma butonunun sadece giriş yapmış kullanıcılara gösterilmesi (veya tıklandığında login modal açılması).

### Faz 2: Yorum Sisteminin Altyapısı (Comments Backend)
Yorumların tutulması için yeni bir yapı kurulmalıdır.

- [x] **Veri Modeli:** `routes` koleksiyonunun altına `comments` alt koleksiyonu (sub-collection) eklenecek.
  - Yol: `routes/{routeId}/comments/{commentId}`
  - Model:
    ```typescript
    interface RouteComment {
      id: string;
      routeId: string;
      userId: string;
      userName: string;
      userPhoto?: string;
      text: string;
      createdAt: Timestamp;
    }
    ```
- [x] **Servis Güncellemesi:** `routeService.ts` dosyasına şu fonksiyonlar eklenecek:
  - `addComment(routeId, comment)`
  - `getComments(routeId)`
  - `deleteComment(routeId, commentId)`

### Faz 3: Store Entegrasyonu
- [x] `routeStore.ts` dosyasına yorumları yönetmek için state ve action'lar eklenecek:
  - `comments: Record<string, RouteComment[]>` (Rota ID'sine göre yorumları cache'lemek için)
  - `isLoadingComments: boolean`
  - `addComment(...)`
  - `loadComments(...)`

### Faz 4: Arayüz Geliştirmesi (UI)
- [x] **Rota Kartı / Detayı:** Rota kartlarına "Yorumlar" butonu ve sayısı eklenecek.
- [x] **Yorum Modalı/Bölümü:** Tıklandığında açılan bir panelde mevcut yorumlar listelenecek ve yeni yorum yazma input'u olacak.
- [x] **Giriş Kontrolü:** Yorum yazma alanı sadece giriş yapmış kullanıcılara aktif olacak.

### Faz 5: Beğeni (Like) İyileştirmesi
- [x] Mevcut `vote` fonksiyonunun UI üzerinde beklendiği gibi çalıştığının teyidi.
- [x] Kalp ikonunun dolu/boş durumunun hem `userId` hem de `guestId` üzerinden kontrol edilmesi.

## 3. Güvenlik Kuralları (Firestore Security Rules)
*(Bilgi amaçlı, Firebase konsoldan ayarlanmalı)*
- `routes`: read (public), write (auth required)
- `routes/{routeId}/comments`: read (public), write (auth required)
