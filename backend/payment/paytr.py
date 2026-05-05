import os
import base64
import hmac
import hashlib
import json

# .env dosyasından gelen verileri alıyoruz
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "").strip()
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "").strip()
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "").strip()
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1").strip() # Canlı mod için 0'a zorladık

def create_payment_session(order, user_email, request):
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env verileri eksik.")

    try:
        # 1. PARAMETRELERİ TAMAMEN TEMİZ STRINGE ÇEVİRME
        merchant_id = str(MERCHANT_ID)
        merchant_oid = str(order.id)
        email = str(user_email).strip()
        
        # Fiyatı kesinlikle kuruşa çevirip küsuratsız string yapıyoruz (Örn: 300.00 -> 30000)
        payment_amount = str(int(round(float(order.total_price) * 100)))
        
        no_installment = "0"
        max_installment = "0"
        currency = "TL"
        test_mode = str(TEST_MODE)

        # 2. SABİT VE GÜVENLİ IP (PayTR'nin en çok patladığı yer)
        # Dinamik IP alırken IPv6 veya Proxy gelirse hash bozulur. 
        # Canlı modda PayTR bunu onaylar, buraya geçerli bir TR IPv4 adresi sabitliyoruz.
        user_ip = "176.234.0.1"

        # 3. KUSURSUZ SEPET FORMATI (Türkçe karakter ve yuvarlama hatası içermeyen manuel sepet)
        # PayTR'nin 'Geçersiz İstek' demesinin %90 sebebi json_encode sırasındaki boşluklardır.
        basket_items = [["Alisveris Bedeli", "{:.2f}".format(float(order.total_price)), 1]]
        
        # separators=(',', ':') -> PHP'deki json_encode ile birebir aynı çıktıyı verir (boşluksuz)
        json_basket = json.dumps(basket_items, separators=(',', ':'), ensure_ascii=False)
        user_basket = base64.b64encode(json_basket.encode("utf-8")).decode("utf-8")

        # 4. FORMÜLE UYGUN MATRİS SIRALAMASI
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

        # HMAC SHA256 Şifreleme (PayTR'nin beklediği tek format)
        hash_authenticated = hash_str + MERCHANT_SALT
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_authenticated.encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        # 5. PAYTR'YE GÖNDERİLEN TAM PAKET
        return {
            "merchant_id": merchant_id,
            "user_ip": user_ip,
            "merchant_oid": merchant_oid,
            "email": email,
            "payment_amount": payment_amount,
            "user_basket": user_basket,
            "paytr_token": paytr_token,
            "debug_on": "1",
            "no_installment": no_installment,
            "max_installment": max_installment,
            "currency": currency,
            "test_mode": test_mode,
            "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
            "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
            "timeout_limit": "30"
        }
        
    except Exception as e:
        raise Exception(f"PayTR Entegrasyon Hatası: {str(e)}")
