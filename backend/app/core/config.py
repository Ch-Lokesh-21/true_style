from pydantic_settings import BaseSettings
from pydantic import EmailStr
class Settings(BaseSettings):
    PROJECT_NAME: str 
    API_V1_PREFIX: str 
    MONGO_URI: str
    MONGO_DB : str
    REDIS_HOST : str
    PERM_CACHE_TTL_SECONDS: int
    GRIDFS_BUCKET: str
    POSTGRESQL_URI: str
    BACKEND_BASE_URL: str
    UPLOAD_MAX_BYTES: int
    UPLOAD_ALLOWED_TYPES: str
    
    JWT_ACCESS_TOKEN_SECRET: str
    JWT_REFRESH_TOKEN_SECRET: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    
    MAIL_USERNAME: EmailStr
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_FROM_NAME: str 
    MAIL_SERVER: str 
    MAIL_PORT: int 
    MAIL_STARTTLS: bool = True      
    MAIL_SSL_TLS: bool = False      
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    REFRESH_COOKIE_NAME: str 
    REFRESH_COOKIE_SECURE: bool 
    REFRESH_COOKIE_SAMESITE: str 
    REFRESH_COOKIE_MAX_AGE_DAYS: int
    REFRESH_COOKIE_PATH: str = "/"
    TOKEN_HASH_PEPPER: str 
    BACKUP_BASE_PATH: str
    
    FORGOT_PWD_OTP_TTL_SECONDS : int
    FORGOT_PWD_RESEND_COOLDOWN_SECONDS :int    
    FORGOT_PWD_MAX_OTP_ATTEMPTS : int

    FORGOT_PWD_OTP_PREFIX : str
    FORGOT_PWD_OTP_ATTEMPTS_PREFIX : str
    FORGOT_PWD_OTP_RATE_LIMIT_PREFIX : str
    
    CLEANUP_INTERVAL_MINUTES: int = 30  # Run cleanup every N minutes

    USER_MAX_REQUESTS : int           # requests per user
    USER_WINDOW_SECONDS : int            # per N seconds

    IP_MAX_REQUESTS : int              # how many requests allowed
    IP_WINDOW_SECONDS : int            # per this many seconds
    IP_BLOCK_SECONDS : int        # temporary block duration on abuse (e.g., 15 min)

    SUSPICIOUS_STRIKE_LIMIT : int         # how many windows they can hit the limit
    SUSPICIOUS_BLOCK_SECONDS : int  # block duration (e.g., 15 min)
    
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        case_sensitive = False

settings = Settings()