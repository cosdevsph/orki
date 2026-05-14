import requests
import json

webhook_payload = {
    "data": {
        "id": "evt_test_12345",
        "type": "checkout_session.payment.paid",
        "attributes": {
            "data": {
                "id": "pay_test_123",
                "attributes": {
                    "status": "paid",
                    "payment_method_type": "gcash"
                },
                "relationships": {
                    "checkout": {
                        "data": {
                            "attributes": {
                                "metadata": {
                                    "user_id": "1",
                                    "user_email": "roque.josephcharles@gmail.com"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

try:
    response = requests.post(
        "http://127.0.0.1:8000/api/v1/payments/webhook/",
        json=webhook_payload,
        headers={"Content-Type": "application/json"}
    )

    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
