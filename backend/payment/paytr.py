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
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1").strip()  # Canlı mod için varsayılan "0" yapabilirsiniz

def create_payment_session(order, user_email, request):
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env verileri eksik veya yüklenemedi.")

    try:
        # 1. TEMEL PARAMETRELERİN DÖKÜMAN FORMATINA ÇEVRİLMESİ
        merchant_id = str(MERCHANT_ID)
        merchant_oid = f"SP{order.id}"  # Çakışmaları önlemek için özel sipariş numarası formatı
        email = str(user_email).strip()
        
        # Fiyatı kesinlikle kuruşa çevirip küsuratsız string yapıyoruz (Örn: 300.00 -> "30000")
        payment_amount = str(int(round(float(order.total_price) * 100)))
        
        no_installment = "0"
        max_installment = "0"
        currency = "TL"
        test_mode = str(TEST_MODE)
        
        # 🚀 IP UYUŞMAZLIĞINI (401) ENGELLEYEN DİNAMİK YAKALAYICI:
        # Sunucu arkasındaki gerçek kullanıcı IP'sini yakalar, boşsa veya localhost ise geçerli bir TR IP'si basar.
        user_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host
        if user_ip in ["127.0.0.1", "localhost", "::1"] or not user_ip:
            user_ip = "85.105.1.1"

        # 2. SEPET FORMATI (Dökümandaki PHP json_encode standart yapısı)
        basket_items = [["Alisveris Bedeli", "{:.2f}".format(float(order.total_price)), 1]]
        
        # PHP'deki json_encode çıktısını boşluksuz yakalamak için separators ayarı mecburidir
        json_basket = json.dumps(basket_items, separators=(',', ':'), ensure_ascii=False)
        user_basket = base64.b64encode(json_basket.encode("utf-8")).decode("utf-8")

        # 3. KULLANICI BİLGİLERİ (Zorunlu alanların güvenli fall-back yönetimi)
        user_name = getattr(order, 'full_name', 'Misafir Kullanıcı')
        user_address = getattr(order, 'address', 'Turkiye')
        user_phone = getattr(order, 'phone', '05000000000')

        # URL Tanımlamaları
        merchant_ok_url = "https://sevimlerkuruyemis.com/success"
        merchant_fail_url = "https://sevimlerkuruyemis.com/fail"

        # 4. RESMİ DÖKÜMANDAKİ MATRİS SIRALAMASI
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

        # HMAC SHA256 Şifreleme Adımı (Standart ve hatasız döküman formatı)
        hash_authenticated = hash_str + MERCHANT_SALT
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_authenticated.encode("utf-8"),
                hashlib.sha256
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
            "debug_on": "1",  # 🚀 Olası bir entegrasyon hatasında PayTR'nin canlı hata raporu vermesi için "1" yapıldı
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

        # 6. PAYTR SUNUCULARINDAN TOKEN ALMA İŞLEMİ
        response = requests.post("https://www.paytr.com/odeme/api/get-token", data=payload)
        res_data = response.json()

        # Render loglarında ham yanıtı kontrol edebilmek için basıyoruz
        print(f"\n--- PAYTR SUNUCUSUNDAN DÖNEN HAM VERİ: {res_data} ---\n")

        # PayTR taraflı bir hata (örn: geçersiz key, mağaza kapalı v.b) anında burada patlasın
        if res_data.get("status") in ["error", "failed"]:
            error_msg = res_data.get("err_msg") or res_data.get("reason") or "Bilinmeyen PayTR Hatası"
            raise Exception(f"PayTR API Hatası: {error_msg}")

        # 7. FRONTEND'E TOKEN PASLANIYOR
        actual_token = res_data.get("token")

        if not actual_token:
            raise Exception("PayTR basarili dondu ama icinden token cikmadi!")

        return {
            "status": "success",
            "paytr_token": str(actual_token)
        }
        
    except Exception as e:
        raise Exception(f"PayTR Entegrasyon Hatası: {str(e)}")
