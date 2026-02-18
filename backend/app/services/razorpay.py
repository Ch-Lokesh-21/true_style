"""
Razorpay payment integration service.
- Create payment orders
- Verify payment signatures
"""

from __future__ import annotations
import razorpay
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException

from app.core.config import settings

# Setup logger
logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


async def create_razorpay_order(amount: float, currency: str = "INR", receipt: str = None) -> Dict[str, Any]:
    """
    Create a Razorpay order.
    
    Args:
        amount: Amount in rupees (will be converted to paise)
        currency: Currency code (default: INR)
        receipt: Optional receipt identifier
        
    Returns:
        Dict containing razorpay_order_id, amount, currency, etc.
    """
    try:
        # Razorpay expects amount in paise (smallest currency unit)
        amount_in_paise = int(amount * 100)
        
        logger.info(f"Creating Razorpay order: amount={amount} INR ({amount_in_paise} paise), receipt={receipt}")
        
        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": receipt or "receipt_auto",
            "payment_capture": 1  # Auto-capture payment
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        logger.info(f"Razorpay order created successfully: {order.get('id')}")
        
        return {
            "razorpay_order_id": order["id"],
            "amount": amount,
            "amount_in_paise": amount_in_paise,
            "currency": currency,
            "key_id": settings.RAZORPAY_KEY_ID,
        }
    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay BadRequestError: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Razorpay request: {str(e)}")
    except razorpay.errors.GatewayError as e:
        logger.error(f"Razorpay GatewayError: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Razorpay gateway error: {str(e)}")
    except razorpay.errors.ServerError as e:
        logger.error(f"Razorpay ServerError: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Razorpay server error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error creating Razorpay order: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {type(e).__name__}: {str(e)}")


def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    """
    Verify Razorpay payment signature.
    
    Args:
        razorpay_order_id: Razorpay order ID
        razorpay_payment_id: Razorpay payment ID
        razorpay_signature: Signature from Razorpay callback
        
    Returns:
        True if signature is valid
        
    Raises:
        HTTPException if signature verification fails
    """
    try:
        # Create the signature verification string
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if expected_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        return True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signature verification failed: {e}")


async def fetch_payment_details(payment_id: str) -> Dict[str, Any]:
    """
    Fetch payment details from Razorpay.
    
    Args:
        payment_id: Razorpay payment ID
        
    Returns:
        Payment details from Razorpay
    """
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        return payment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment details: {e}")
