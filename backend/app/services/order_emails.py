"""
Order Email Notification Service.
- Send order confirmation emails
- Send order status update emails
- Send delivery date change notifications
"""

from __future__ import annotations
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from app.utils.fastapi_mail import _send_mail
from app.core.config import settings


def _format_date(d: date | datetime) -> str:
    """Format date for display."""
    if isinstance(d, datetime):
        d = d.date()
    return d.strftime("%B %d, %Y")


def _format_currency(amount: float) -> str:
    """Format amount as currency."""
    return f"₹{amount:,.2f}"


def generate_order_confirmation_html(
    user_name: str,
    order_id: str,
    order_items: List[Dict[str, Any]],
    total_amount: float,
    delivery_date: date,
    address: Dict[str, Any],
    payment_method: str
) -> str:
    """Generate HTML email for order confirmation."""
    
    items_html = ""
    for item in order_items:
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">{item.get('name', 'Product')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">{item.get('size', '-')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">{item.get('quantity', 1)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">{_format_currency(item.get('price', 0))}</td>
        </tr>
        """
    
    address_str = f"{address.get('address', '')}, {address.get('city', '')}, {address.get('state', '')} - {address.get('postal_code', '')}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Order Confirmation</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                padding: 24px;
                color: #333333;
                line-height: 1.6;
            }}
            .order-id {{
                background-color: #f0f7f0;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                font-size: 18px;
                margin: 16px 0;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            th {{
                background-color: #f5f5f5;
                padding: 12px;
                text-align: left;
                border-bottom: 2px solid #e0e0e0;
            }}
            .total-row {{
                font-weight: bold;
                font-size: 18px;
            }}
            .info-section {{
                background-color: #f9f9f9;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }}
            .footer {{
                background-color: #f0f2f5;
                text-align: center;
                padding: 16px;
                font-size: 12px;
                color: #888888;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ✓ Order Confirmed
            </div>
            <div class="content">
                <p>Dear {user_name},</p>
                <p>Thank you for your order! We're excited to let you know that your order has been confirmed.</p>
                
                <div class="order-id">
                    <strong>Order ID:</strong> {order_id}
                </div>
                
                <table>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Size</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                    {items_html}
                    <tr class="total-row">
                        <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                        <td style="padding: 12px; text-align: right;">{_format_currency(total_amount)}</td>
                    </tr>
                </table>
                
                <div class="info-section">
                    <p><strong>📦 Expected Delivery:</strong> {_format_date(delivery_date)}</p>
                    <p><strong>📍 Delivery Address:</strong><br/>{address_str}</p>
                    <p><strong>💳 Payment Method:</strong> {payment_method}</p>
                </div>
                
                <p>You will receive updates about your order status via email.</p>
            </div>
            <div class="footer">
                <p>© {datetime.now().year} {settings.PROJECT_NAME}. All rights reserved.</p>
                <p>If you have any questions, please contact us.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def generate_order_status_update_html(
    user_name: str,
    order_id: str,
    new_status: str,
    delivery_date: Optional[date] = None,
    delivery_otp: Optional[str] = None
) -> str:
    """Generate HTML email for order status update."""
    
    status_colors = {
        "confirmed": "#4CAF50",
        "packed": "#2196F3",
        "shipped": "#9C27B0",
        "out for delivery": "#FF9800",
        "delivered": "#4CAF50",
        "cancelled": "#f44336",
    }
    
    status_color = status_colors.get(new_status.lower(), "#607D8B")
    
    delivery_info = ""
    if delivery_date:
        delivery_info = f"""
        <div class="info-box">
            <strong>📦 Expected Delivery:</strong> {_format_date(delivery_date)}
        </div>
        """
    
    otp_info = ""
    if delivery_otp and new_status.lower() in ["out for delivery", "out_for_delivery"]:
        otp_info = f"""
        <div class="otp-box">
            <p>Please share this OTP with the delivery person:</p>
            <div class="otp">{delivery_otp}</div>
        </div>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Order Status Update</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: {status_color};
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                padding: 24px;
                color: #333333;
                line-height: 1.6;
            }}
            .status-badge {{
                display: inline-block;
                background-color: {status_color};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
            }}
            .info-box {{
                background-color: #f0f7ff;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }}
            .otp-box {{
                background-color: #fff3e0;
                padding: 20px;
                border-radius: 8px;
                margin: 16px 0;
                text-align: center;
            }}
            .otp {{
                font-size: 32px;
                font-weight: bold;
                color: #FF9800;
                letter-spacing: 8px;
                margin-top: 12px;
            }}
            .footer {{
                background-color: #f0f2f5;
                text-align: center;
                padding: 16px;
                font-size: 12px;
                color: #888888;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                Order Status Update
            </div>
            <div class="content">
                <p>Dear {user_name},</p>
                <p>Your order status has been updated.</p>
                
                <p><strong>Order ID:</strong> {order_id}</p>
                <p><strong>New Status:</strong> <span class="status-badge">{new_status}</span></p>
                
                {delivery_info}
                {otp_info}
                
                <p>Thank you for shopping with us!</p>
            </div>
            <div class="footer">
                <p>© {datetime.now().year} {settings.PROJECT_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def generate_delivery_date_change_html(
    user_name: str,
    order_id: str,
    old_date: date,
    new_date: date
) -> str:
    """Generate HTML email for delivery date change notification."""
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Delivery Date Updated</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: #FF9800;
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                padding: 24px;
                color: #333333;
                line-height: 1.6;
            }}
            .date-change {{
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin: 24px 0;
            }}
            .date-box {{
                padding: 16px 24px;
                border-radius: 8px;
                text-align: center;
            }}
            .old-date {{
                background-color: #ffebee;
                text-decoration: line-through;
                color: #c62828;
            }}
            .new-date {{
                background-color: #e8f5e9;
                color: #2e7d32;
                font-weight: bold;
            }}
            .arrow {{
                font-size: 24px;
                color: #666;
            }}
            .footer {{
                background-color: #f0f2f5;
                text-align: center;
                padding: 16px;
                font-size: 12px;
                color: #888888;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                📅 Delivery Date Updated
            </div>
            <div class="content">
                <p>Dear {user_name},</p>
                <p>The delivery date for your order has been updated.</p>
                
                <p><strong>Order ID:</strong> {order_id}</p>
                
                <div class="date-change">
                    <div class="date-box old-date">{_format_date(old_date)}</div>
                    <span class="arrow">→</span>
                    <div class="date-box new-date">{_format_date(new_date)}</div>
                </div>
                
                <p>We apologize for any inconvenience caused. Thank you for your patience!</p>
            </div>
            <div class="footer">
                <p>© {datetime.now().year} {settings.PROJECT_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


async def send_order_confirmation_email(
    user_email: str,
    user_name: str,
    order_id: str,
    order_items: List[Dict[str, Any]],
    total_amount: float,
    delivery_date: date,
    address: Dict[str, Any],
    payment_method: str
) -> None:
    """Send order confirmation email."""
    subject = f"Order Confirmed - {order_id}"
    html = generate_order_confirmation_html(
        user_name=user_name,
        order_id=order_id,
        order_items=order_items,
        total_amount=total_amount,
        delivery_date=delivery_date,
        address=address,
        payment_method=payment_method
    )
    await _send_mail(subject=subject, recipients=[user_email], body=html)


async def send_order_status_update_email(
    user_email: str,
    user_name: str,
    order_id: str,
    new_status: str,
    delivery_date: Optional[date] = None,
    delivery_otp: Optional[str] = None
) -> None:
    """Send order status update email."""
    subject = f"Order Update - {new_status.title()} - {order_id}"
    html = generate_order_status_update_html(
        user_name=user_name,
        order_id=order_id,
        new_status=new_status,
        delivery_date=delivery_date,
        delivery_otp=delivery_otp
    )
    await _send_mail(subject=subject, recipients=[user_email], body=html)


async def send_delivery_date_change_email(
    user_email: str,
    user_name: str,
    order_id: str,
    old_date: date,
    new_date: date
) -> None:
    """Send delivery date change notification email."""
    subject = f"Delivery Date Changed - {order_id}"
    html = generate_delivery_date_change_html(
        user_name=user_name,
        order_id=order_id,
        old_date=old_date,
        new_date=new_date
    )
    await _send_mail(subject=subject, recipients=[user_email], body=html)
