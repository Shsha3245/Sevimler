import os
import base64
import hmac
import hashlib
import json
import requests  # PayTR API'sine istek atmak için zorunlu

# .env dosyasından gelen verileri alıyoruz
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "").strip()
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "").strip()
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "").strip()
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "0").strip() # Canlı mod için varsayılan 0

def create_payment_session(order, user_email, request):
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env verileri eksik.")

    try:
        # 1. TEMEL PARAMETRELERİN DÖKÜMAN FORMATINA ÇEVRİLMESİ
        merchant_id = str(MERCHANT_ID)
        merchant_oid = f"SP-{order.id}"  # Karışıklığı önlemek için sipariş numarası formatı
        email = str(user_email).strip()
        
        # Fiyatı kesinlikle kuruşa çevirip küsuratsız string yapıyoruz (Örn: 300.00 -> 30000)
        payment_amount = str(int(round(float(order.total_price) * 100)))
        
        no_installment = "0"
        max_installment = "0"
        currency = "TL"
        test_mode = str(TEST_MODE)
        
        # Dinamik IP sıkıntı yaratabileceğinden dökümanın önerdiği geçerli bir TR IPv4 adresi
        user_ip = "176.234.0.1"

        # 2. SEPET FORMATI (Dökümandaki Örnek Birebir Manuel Sepet Yapısı)
        # Format: [["Ürün Adı", "Birim Fiyat", Adet]]
        basket_items = [["Alisveris Bedeli", "{:.2f}".format(float(order.total_price)), 1]]
        
        # PHP'deki json_encode çıktısını birebir yakalamak için boşluksuz separator ayarı
        json_basket = json.dumps(basket_items, separators=(',', ':'), ensure_ascii=False)
        user_basket = base64.b64encode(json_basket.encode("utf-8")).decode("utf-8")

        # 3. YÜKLEDİĞİN DÖKÜMANDAKİ ZORUNLU KULLANICI BİLGİLERİ (Eksik Alanlar Eklendi)
        # Sipariş objesinden veya form verilerinden bu alanları besliyoruz
        user_name = getattr(order, 'full_name', 'Misafir Kullanıcı')
        user_address = getattr(order, 'address', 'Türkiye')
        user_phone = getattr(order, 'phone', '05000000000')

        # URL Tanımlamaları
        merchant_ok_url = "https://sevimlerkuruyemis.com/success"
        merchant_fail_url = "https://sevimlerkuruyemis.com/fail"

        # 4. RESMİ FORMÜLE UYALAN HASH MATRİS SIRALAMASI
        # Sıralama dökümandaki POST Request tablosuna göre harfiyen eşleşmelidir
        hash_str = (
            merchant_id +
            user_ip +
            merchant_oid +
            email +
            payment_amount +
            user_basket +
            no_installment +
            max_installment +
            currency +
            test_mode
        )

        # HMAC SHA256 Şifreleme Adımı
        hash_authenticated = hash_str + MERCHANT_SALT
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_authenticated.encode("utf-8"),
                hash_bytes:=hashlib.sha256
            ).digest()
        ).decode("utf-8")

        # 5. PAYTR API'SİNE GÖNDERİLECEK TAM PAKET (Payload)
        payload = {
            "merchant_id": merchant_id,
            "user_ip": user_ip,
            "merchant_oid": merchant_oid,
            "email": email,
            "payment_amount": payment_amount,
            "paytr_token": paytr_token,
            "user_basket": user_basket,
            "debug_on": "1",
            "no_installment": no_installment,
            "max_installment": max_installment,
            "currency": currency,
            "test_mode": test_mode,
            "user_name": user_name,
            "user_address": user_address,
            "user_phone": user_phone,
            "merchant_ok_url": merchant_ok_url,
            "merchant_fail_url": merchant_fail_url,
            "timeout_limit": "30"
        }

        # 6. KRİTİK ADIM: PAYTR SUNUCULARINA DOĞRUDAN BAĞLANIP IFRAME TOKEN ALMA
        response = requests.post("https://www.paytr.com/odeme/api/get-token", data=payload)
        res_data = response.json()

        # Eğer PayTR API'si hata döndürürse bunu loglayıp yakalıyoruz
        if res_data.get("status") == "error":
            raise Exception(f"PayTR API Hatası: {res_data.get('err_msg')}")

        # 7. FRONTEND'E SADECE IFRAME'İ AÇACAK OLAN ASIL TOKEN DEĞERİNİ DÖNDÜRÜYORUZ
        return {
            "status": "success",
            "paytr_token": res_data.get("token")  # PayTR'den dönen gerçek ödeme oturum tokenı
        }
        
    except Exception as e:
        raise Exception(f"PayTR Entegrasyon Hatası: {str(e)}")
