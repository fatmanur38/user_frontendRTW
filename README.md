
# Offline Video Mülakat Platformu

Kullanıcıların mülakat deneyimini yönetmek ve admin paneli üzerinden işlemleri kolaylaştırmak için geliştirilmiştir.  
Bu projede:
- **Admin**, kullanıcı dostu bir arayüz üzerinden soru paketlerini ve mülakatları yönetir.
- **User (kullanıcı)**, kendisine iletilen mülakat linki üzerinden giriş yapar ve soruları cevaplar.


---

## Kullanılan Teknolojiler
- **React.js**: Kullanıcı arayüzü geliştirme.
- **JavaScript**: Tip güvenliği ve geliştirme kolaylığı için.
- **TailwindCSS**: Modern ve esnek stil tasarımı.
- **Axios**: Backend API'larına istek göndermek için.

---

## Kurulum Talimatları

### 1. Gerekli Yazılımlar
- [Node.js](https://nodejs.org/) (v14 veya üzeri)
- Bir paket yöneticisi: **npm** veya **yarn**

### 2. Depoyu Klonlayın
```bash
git clone https://github.com/fatmanur38/frontendRTW.git
cd frontendRTW
```
### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Ortam Değişkenlerini Ayarlayın

- Kök dizinde bir .env dosyası oluşturun ve şu bilgileri doldurun:

`VITE_API_URL`=http://localhost:4000

### 5. Projeyi Başlatın

```bash
npm run dev
```
