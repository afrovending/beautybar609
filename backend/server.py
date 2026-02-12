from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
import requests

# SendGrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'beautybar609-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# SendGrid Settings
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@beautybar609.com')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://beauty-portal-pro.preview.emergentagent.com')

# Termii Settings
TERMII_API_KEY = os.environ.get('TERMII_API_KEY')
TERMII_SENDER_ID = os.environ.get('TERMII_SENDER_ID', 'BeautyBar')

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Create the main app
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== MODELS ==================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class ServiceCreate(BaseModel):
    title: str
    description: str
    image: str
    price: str
    order: int = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[str] = None
    order: Optional[int] = None

class PriceCategoryCreate(BaseModel):
    category: str
    items: List[dict]
    order: int = 0
    service_type: str = "salon"  # "salon" or "home"

class HomeBookingRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    service: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = ""

class TestimonialCreate(BaseModel):
    name: str
    text: str
    rating: int = 5

class PromotionCreate(BaseModel):
    title: str
    description: str
    discount: str
    active: bool = True

class GalleryImageCreate(BaseModel):
    url: str
    caption: Optional[str] = ""
    order: int = 0

class AnalyticsEvent(BaseModel):
    page: str
    section: Optional[str] = None
    visitor_id: str

# ================== AUTH HELPERS ==================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ================== EMAIL HELPERS ==================

def send_password_reset_email(to_email: str, reset_token: str, user_name: str = "User") -> bool:
    """Send password reset email via SendGrid"""
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping email")
        return False
    
    reset_link = f"{FRONTEND_URL}/admin?reset_token={reset_token}"
    
    html_content = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #050505; color: #F9F1D8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0F0F0F; padding: 40px; border: 1px solid #333;">
            <h1 style="color: #D4AF37; font-family: Georgia, serif; margin-bottom: 20px;">BeautyBar609</h1>
            <h2 style="color: #F9F1D8; margin-bottom: 30px;">Password Reset Request</h2>
            
            <p style="color: #ccc; line-height: 1.6;">Hi {user_name},</p>
            
            <p style="color: #ccc; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #D4AF37; color: #050505; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
            </div>
            
            <p style="color: #888; font-size: 14px;">Or copy this link: <span style="color: #D4AF37;">{reset_link}</span></p>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
                BeautyBar609 - Glow From Lashes To Tips<br>
                57, Arowolo Street, Off Agbe Road, Abule Egba
            </p>
        </div>
    </body>
    </html>
    """
    
    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=to_email,
        subject="Reset Your BeautyBar609 Password",
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Password reset email sent to {to_email}, status: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        return False

def send_sms_notification(phone: str, message: str) -> bool:
    """Send SMS via Termii API"""
    if not TERMII_API_KEY:
        logger.warning("Termii API key not configured, skipping SMS")
        return False
    
    # Format phone number for Nigeria
    phone_formatted = phone.replace(" ", "").replace("-", "")
    if phone_formatted.startswith("0"):
        phone_formatted = "234" + phone_formatted[1:]
    elif not phone_formatted.startswith("234") and not phone_formatted.startswith("+234"):
        phone_formatted = "234" + phone_formatted
    phone_formatted = phone_formatted.replace("+", "")
    
    url = "https://api.ng.termii.com/api/sms/send"
    payload = {
        "to": phone_formatted,
        "from": "talert",
        "sms": message,
        "type": "plain",
        "channel": "dnd",
        "api_key": TERMII_API_KEY
    }
    
    try:
        response = requests.post(url, json=payload)
        result = response.json()
        logger.info(f"Termii SMS response: {result}")
        if result.get("code") == "ok" or result.get("message_id"):
            logger.info(f"SMS sent successfully to {phone_formatted}")
            return True
        else:
            logger.error(f"SMS failed: {result}")
            return False
    except Exception as e:
        logger.error(f"Failed to send SMS: {str(e)}")
        return False

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================== AUTH ROUTES ==================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "name": user.name,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_doc["id"], user_doc["email"])
    return {"token": token, "user": {"id": user_doc["id"], "email": user_doc["email"], "name": user_doc["name"]}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"]}

@api_router.post("/auth/forgot-password")
@limiter.limit("3/minute")  # Rate limit: 3 requests per minute per IP
async def forgot_password(request: Request, data: PasswordResetRequest):
    user = await db.users.find_one({"email": data.email})
    
    # Always return same message to prevent email enumeration
    response_message = "If email exists, reset instructions have been sent"
    
    if not user:
        return {"message": response_message, "email_sent": False}
    
    # Generate reset token (valid for 1 hour)
    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "user_id": user["id"],
        "token": reset_token,
        "expires": expires.isoformat(),
        "used": False
    })
    
    # Send email via SendGrid
    user_name = user.get("name", "User")
    email_sent = send_password_reset_email(data.email, reset_token, user_name)
    
    if email_sent:
        logger.info(f"Password reset email sent to {data.email}")
        return {"message": response_message, "email_sent": True}
    else:
        # If SendGrid not configured, return token for testing (remove in production)
        logger.warning(f"SendGrid not configured. Reset token for {data.email}: {reset_token}")
        return {"message": response_message, "email_sent": False, "reset_token": reset_token}

@api_router.post("/auth/reset-password")
async def reset_password(request: PasswordReset):
    reset_doc = await db.password_resets.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token expired
    expires = datetime.fromisoformat(reset_doc["expires"])
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    # Update password
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": reset_doc["user_id"]},
        {"$set": {"password": new_hash}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

# ================== SERVICES ROUTES ==================

@api_router.get("/services")
async def get_services():
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return services

@api_router.post("/services")
async def create_service(service: ServiceCreate, user: dict = Depends(get_current_user)):
    service_doc = {
        "id": str(uuid.uuid4()),
        **service.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.services.insert_one(service_doc)
    return {k: v for k, v in service_doc.items() if k != "_id"}

@api_router.put("/services/{service_id}")
async def update_service(service_id: str, service: ServiceUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in service.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.services.update_one({"id": service_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    updated = await db.services.find_one({"id": service_id}, {"_id": 0})
    return updated

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, user: dict = Depends(get_current_user)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# ================== PRICE LIST ROUTES ==================

@api_router.get("/prices")
async def get_prices(service_type: Optional[str] = None):
    query = {}
    if service_type:
        if service_type == "salon":
            # Include prices without service_type (legacy) or with service_type=salon
            query["$or"] = [{"service_type": "salon"}, {"service_type": {"$exists": False}}]
        else:
            query["service_type"] = service_type
    prices = await db.prices.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return prices

@api_router.post("/prices")
async def create_price_category(price: PriceCategoryCreate, user: dict = Depends(get_current_user)):
    price_doc = {
        "id": str(uuid.uuid4()),
        **price.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.prices.insert_one(price_doc)
    return {k: v for k, v in price_doc.items() if k != "_id"}

@api_router.put("/prices/{price_id}")
async def update_price_category(price_id: str, price: PriceCategoryCreate, user: dict = Depends(get_current_user)):
    update_data = price.model_dump()
    result = await db.prices.update_one({"id": price_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Price category not found")
    
    updated = await db.prices.find_one({"id": price_id}, {"_id": 0})
    return updated

@api_router.delete("/prices/{price_id}")
async def delete_price_category(price_id: str, user: dict = Depends(get_current_user)):
    result = await db.prices.delete_one({"id": price_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Price category not found")
    return {"message": "Price category deleted"}

# ================== HOME BOOKING ROUTES ==================

@api_router.post("/bookings/home")
async def create_home_booking(booking: HomeBookingRequest):
    booking_doc = {
        "id": str(uuid.uuid4()),
        **booking.model_dump(),
        "status": "pending",
        "booking_type": "home",
        "sms_sent": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    
    # Send SMS confirmation to customer
    sms_message = f"Hi {booking.name}! Your BeautyBar609 home service booking is received. Service: {booking.service}, Date: {booking.preferred_date} at {booking.preferred_time}. We'll confirm shortly. Call 08058578131 for queries."
    sms_sent = send_sms_notification(booking.phone, sms_message)
    
    # Update booking with SMS status
    if sms_sent:
        await db.bookings.update_one({"id": booking_doc["id"]}, {"$set": {"sms_sent": True}})
    
    # Send notification email to admin if SendGrid configured
    if SENDGRID_API_KEY:
        try:
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #050505; color: #F9F1D8; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #0F0F0F; padding: 30px; border: 1px solid #333;">
                    <h1 style="color: #D4AF37;">New Home Service Booking!</h1>
                    <p><strong>Client:</strong> {booking.name}</p>
                    <p><strong>Phone:</strong> {booking.phone}</p>
                    <p><strong>Email:</strong> {booking.email or 'Not provided'}</p>
                    <p><strong>Service:</strong> {booking.service}</p>
                    <p><strong>Date:</strong> {booking.preferred_date}</p>
                    <p><strong>Time:</strong> {booking.preferred_time}</p>
                    <p><strong>Address:</strong> {booking.address}</p>
                    <p><strong>Notes:</strong> {booking.notes or 'None'}</p>
                    <p><strong>SMS Sent:</strong> {'Yes' if sms_sent else 'No'}</p>
                </div>
            </body>
            </html>
            """
            message = Mail(
                from_email=SENDER_EMAIL,
                to_emails=SENDER_EMAIL,
                subject=f"New Home Service Booking - {booking.name}",
                html_content=html_content
            )
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            sg.send(message)
        except Exception as e:
            logger.error(f"Failed to send booking notification: {e}")
    
    return {"message": "Booking request submitted successfully", "booking_id": booking_doc["id"], "sms_sent": sms_sent}

@api_router.get("/bookings")
async def get_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

class StatusUpdate(BaseModel):
    status: str

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, data: StatusUpdate, user: dict = Depends(get_current_user)):
    if data.status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Get booking details for SMS
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": data.status}})
    
    # Send SMS notification for status changes
    if data.status == "confirmed":
        sms_message = f"Hi {booking['name']}! Great news! Your BeautyBar609 home service for {booking['service']} on {booking['preferred_date']} at {booking['preferred_time']} is CONFIRMED. See you soon!"
        send_sms_notification(booking['phone'], sms_message)
    elif data.status == "cancelled":
        sms_message = f"Hi {booking['name']}, your BeautyBar609 booking for {booking['preferred_date']} has been cancelled. Please call 08058578131 to reschedule."
        send_sms_notification(booking['phone'], sms_message)
    
    return {"message": f"Booking status updated to {data.status}"}

# ================== TESTIMONIALS ROUTES ==================

@api_router.get("/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return testimonials

@api_router.post("/testimonials")
async def create_testimonial(testimonial: TestimonialCreate, user: dict = Depends(get_current_user)):
    testimonial_doc = {
        "id": str(uuid.uuid4()),
        **testimonial.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.testimonials.insert_one(testimonial_doc)
    return {k: v for k, v in testimonial_doc.items() if k != "_id"}

@api_router.put("/testimonials/{testimonial_id}")
async def update_testimonial(testimonial_id: str, testimonial: TestimonialCreate, user: dict = Depends(get_current_user)):
    update_data = testimonial.model_dump()
    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    updated = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    return updated

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, user: dict = Depends(get_current_user)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}

# ================== PROMOTIONS ROUTES ==================

@api_router.get("/promotions")
async def get_promotions():
    promotions = await db.promotions.find({}, {"_id": 0}).to_list(100)
    return promotions

@api_router.get("/promotions/active")
async def get_active_promotion():
    promotion = await db.promotions.find_one({"active": True}, {"_id": 0})
    return promotion

@api_router.post("/promotions")
async def create_promotion(promotion: PromotionCreate, user: dict = Depends(get_current_user)):
    # Deactivate other promotions if this one is active
    if promotion.active:
        await db.promotions.update_many({}, {"$set": {"active": False}})
    
    promotion_doc = {
        "id": str(uuid.uuid4()),
        **promotion.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.promotions.insert_one(promotion_doc)
    return {k: v for k, v in promotion_doc.items() if k != "_id"}

@api_router.put("/promotions/{promotion_id}")
async def update_promotion(promotion_id: str, promotion: PromotionCreate, user: dict = Depends(get_current_user)):
    # Deactivate other promotions if this one is active
    if promotion.active:
        await db.promotions.update_many({"id": {"$ne": promotion_id}}, {"$set": {"active": False}})
    
    update_data = promotion.model_dump()
    result = await db.promotions.update_one({"id": promotion_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    updated = await db.promotions.find_one({"id": promotion_id}, {"_id": 0})
    return updated

@api_router.delete("/promotions/{promotion_id}")
async def delete_promotion(promotion_id: str, user: dict = Depends(get_current_user)):
    result = await db.promotions.delete_one({"id": promotion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted"}

# ================== GALLERY ROUTES ==================

@api_router.get("/gallery")
async def get_gallery():
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return images

@api_router.post("/gallery")
async def create_gallery_image(image: GalleryImageCreate, user: dict = Depends(get_current_user)):
    image_doc = {
        "id": str(uuid.uuid4()),
        **image.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(image_doc)
    return {k: v for k, v in image_doc.items() if k != "_id"}

@api_router.post("/gallery/upload")
async def upload_gallery_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    # Read file and convert to base64
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    
    # Get content type
    content_type = file.content_type or "image/jpeg"
    data_url = f"data:{content_type};base64,{base64_image}"
    
    # Get current max order
    max_order_doc = await db.gallery.find_one(sort=[("order", -1)])
    new_order = (max_order_doc.get("order", 0) + 1) if max_order_doc else 0
    
    image_doc = {
        "id": str(uuid.uuid4()),
        "url": data_url,
        "caption": file.filename,
        "order": new_order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(image_doc)
    return {k: v for k, v in image_doc.items() if k != "_id"}

@api_router.put("/gallery/{image_id}")
async def update_gallery_image(image_id: str, image: GalleryImageCreate, user: dict = Depends(get_current_user)):
    update_data = image.model_dump()
    result = await db.gallery.update_one({"id": image_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    
    updated = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    return updated

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, user: dict = Depends(get_current_user)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ================== ANALYTICS ROUTES ==================

@api_router.post("/analytics/track")
async def track_event(event: AnalyticsEvent):
    event_doc = {
        "id": str(uuid.uuid4()),
        **event.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.analytics.insert_one(event_doc)
    return {"status": "tracked"}

@api_router.get("/analytics/summary")
async def get_analytics_summary(user: dict = Depends(get_current_user)):
    # Get date ranges
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    
    # Total page views
    total_views = await db.analytics.count_documents({})
    
    # Today's views
    today_views = await db.analytics.count_documents({
        "timestamp": {"$gte": today_start.isoformat()}
    })
    
    # This week's views
    week_views = await db.analytics.count_documents({
        "timestamp": {"$gte": week_start.isoformat()}
    })
    
    # This month's views
    month_views = await db.analytics.count_documents({
        "timestamp": {"$gte": month_start.isoformat()}
    })
    
    # Unique visitors (by visitor_id)
    unique_visitors_pipeline = [
        {"$group": {"_id": "$visitor_id"}},
        {"$count": "total"}
    ]
    unique_result = await db.analytics.aggregate(unique_visitors_pipeline).to_list(1)
    unique_visitors = unique_result[0]["total"] if unique_result else 0
    
    # Popular sections
    sections_pipeline = [
        {"$match": {"section": {"$ne": None}}},
        {"$group": {"_id": "$section", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    popular_sections = await db.analytics.aggregate(sections_pipeline).to_list(5)
    
    # Daily views for the last 7 days
    daily_views = []
    for i in range(7):
        day = today_start - timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = await db.analytics.count_documents({
            "timestamp": {"$gte": day.isoformat(), "$lt": next_day.isoformat()}
        })
        daily_views.append({
            "date": day.strftime("%Y-%m-%d"),
            "views": count
        })
    daily_views.reverse()
    
    return {
        "total_views": total_views,
        "today_views": today_views,
        "week_views": week_views,
        "month_views": month_views,
        "unique_visitors": unique_visitors,
        "popular_sections": [{"section": s["_id"], "views": s["count"]} for s in popular_sections],
        "daily_views": daily_views
    }

# ================== SEED DATA ==================

@api_router.post("/seed")
async def seed_data(user: dict = Depends(get_current_user)):
    """Seed initial data if collections are empty"""
    
    # Seed services if empty
    if await db.services.count_documents({}) == 0:
        services = [
            {"id": str(uuid.uuid4()), "title": "Nails Extensions", "description": "Custom nail art and extensions that make a statement", "image": "https://images.unsplash.com/photo-1750598243589-1cc3770356b8?q=85&w=800&auto=format&fit=crop", "price": "From ₦15,000", "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Lashes Extensions", "description": "Volume and classic lashes for that perfect flutter", "image": "https://images.unsplash.com/photo-1672334115165-f82b6b5e8bee?q=85&w=800&auto=format&fit=crop", "price": "From ₦20,000", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Brow Tinting & Lamination", "description": "Perfectly sculpted brows that frame your face", "image": "https://images.unsplash.com/photo-1755274556662-d37485f0677d?q=85&w=800&auto=format&fit=crop", "price": "From ₦12,000", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Microblading", "description": "Semi-permanent brows with natural hair-stroke technique", "image": "https://images.unsplash.com/photo-1755223738688-be7501b937d2?q=85&w=800&auto=format&fit=crop", "price": "From ₦80,000", "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.services.insert_many(services)
    
    # Seed prices if empty
    if await db.prices.count_documents({}) == 0:
        prices = [
            # Salon prices
            {"id": str(uuid.uuid4()), "category": "NAILS", "service_type": "salon", "items": [
                {"name": "Gel Extensions (Short)", "price": "₦15,000"},
                {"name": "Gel Extensions (Medium)", "price": "₦18,000"},
                {"name": "Gel Extensions (Long)", "price": "₦22,000"},
                {"name": "Acrylic Full Set", "price": "₦25,000"},
                {"name": "Nail Art (per nail)", "price": "₦500"},
                {"name": "Gel Polish Only", "price": "₦8,000"},
            ], "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "category": "LASHES", "service_type": "salon", "items": [
                {"name": "Classic Lashes", "price": "₦20,000"},
                {"name": "Volume Lashes", "price": "₦25,000"},
                {"name": "Mega Volume", "price": "₦30,000"},
                {"name": "Lash Lift & Tint", "price": "₦15,000"},
                {"name": "Lash Removal", "price": "₦3,000"},
            ], "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "category": "BROWS & BEAUTY", "service_type": "salon", "items": [
                {"name": "Brow Lamination", "price": "₦12,000"},
                {"name": "Brow Tint", "price": "₦5,000"},
                {"name": "Microblading", "price": "₦80,000"},
                {"name": "Microshading", "price": "₦85,000"},
                {"name": "Semi-Permanent Tattoo", "price": "From ₦30,000"},
            ], "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            # Home service prices (includes transport fee)
            {"id": str(uuid.uuid4()), "category": "NAILS", "service_type": "home", "items": [
                {"name": "Gel Extensions (Short)", "price": "₦22,000"},
                {"name": "Gel Extensions (Medium)", "price": "₦25,000"},
                {"name": "Gel Extensions (Long)", "price": "₦29,000"},
                {"name": "Acrylic Full Set", "price": "₦32,000"},
                {"name": "Nail Art (per nail)", "price": "₦500"},
                {"name": "Gel Polish Only", "price": "₦15,000"},
            ], "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "category": "LASHES", "service_type": "home", "items": [
                {"name": "Classic Lashes", "price": "₦27,000"},
                {"name": "Volume Lashes", "price": "₦32,000"},
                {"name": "Mega Volume", "price": "₦37,000"},
                {"name": "Lash Lift & Tint", "price": "₦22,000"},
                {"name": "Lash Removal", "price": "₦5,000"},
            ], "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "category": "BROWS & BEAUTY", "service_type": "home", "items": [
                {"name": "Brow Lamination", "price": "₦19,000"},
                {"name": "Brow Tint", "price": "₦10,000"},
                {"name": "Microblading", "price": "₦90,000"},
                {"name": "Microshading", "price": "₦95,000"},
                {"name": "Semi-Permanent Tattoo", "price": "From ₦40,000"},
            ], "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.prices.insert_many(prices)
    
    # Seed testimonials if empty
    if await db.testimonials.count_documents({}) == 0:
        testimonials = [
            {"id": str(uuid.uuid4()), "name": "Amaka O.", "text": "Absolutely love my nails! The attention to detail is amazing. Will definitely be back!", "rating": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Blessing A.", "text": "Best lash extensions in Lagos! They last so long and look so natural.", "rating": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Chidinma E.", "text": "My brows have never looked better. The microblading is life-changing!", "rating": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Damilola F.", "text": "Professional service, beautiful results. BeautyBar609 is my new go-to!", "rating": 5, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Favour N.", "text": "The salon is so clean and the staff are so friendly. Highly recommend!", "rating": 5, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.testimonials.insert_many(testimonials)
    
    # Seed promotions if empty
    if await db.promotions.count_documents({}) == 0:
        promotion = {
            "id": str(uuid.uuid4()),
            "title": "Special Offer",
            "description": "Book a full set of nails and lashes together and get your total service discount. Valid for first-time clients!",
            "discount": "15% OFF",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.promotions.insert_one(promotion)
    
    # Seed gallery if empty
    if await db.gallery.count_documents({}) == 0:
        gallery = [
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1594461287652-10b41090cf91?q=85&w=600&auto=format&fit=crop", "caption": "Nail Art", "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1516691475576-56cf13710ae9?q=85&w=600&auto=format&fit=crop", "caption": "Lash Extensions", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1755274556345-949613163335?q=85&w=600&auto=format&fit=crop", "caption": "Brow Work", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1750598243589-1cc3770356b8?q=85&w=600&auto=format&fit=crop", "caption": "Gel Nails", "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1740484674184-77a7629506a5?q=85&w=600&auto=format&fit=crop", "caption": "Beauty Work", "order": 4, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1672334115165-f82b6b5e8bee?q=85&w=600&auto=format&fit=crop", "caption": "Lashes", "order": 5, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.gallery.insert_many(gallery)
    
    return {"message": "Data seeded successfully"}

# ================== ROOT ROUTE ==================

@api_router.get("/")
async def root():
    return {"message": "BeautyBar609 API"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
