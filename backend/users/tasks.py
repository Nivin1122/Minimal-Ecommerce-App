from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging


logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def delete_otp_after_5_minutes(self, email):
    
    try:
       
        from .models import EmailOTP
        
        logger.info(f"⏳ Starting OTP deletion task for {email}")
        
        deleted_count, _ = EmailOTP.objects.filter(email=email).delete()
        
        if deleted_count > 0:
            logger.info(f"✅ Successfully deleted {deleted_count} OTP(s) for {email}")
            return f"Deleted {deleted_count} OTP(s) for {email}"
        else:
            logger.info(f"⚠️ No OTP found for {email}, maybe already deleted or used")
            return f"No OTP found for {email}"
            
    except Exception as exc:
        logger.error(f"❌ Error deleting OTP for {email}: {str(exc)}")
        
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@shared_task(bind=True)
def cleanup_expired_otps(self):
    """
    Clean up all expired OTPs (runs periodically)
    """
    try:
        from .models import EmailOTP
        
        expiry_time = timezone.now() - timedelta(minutes=5)
        
        deleted_count, _ = EmailOTP.objects.filter(created_at__lt=expiry_time).delete()
        
        logger.info(f"🧹 Cleaned up {deleted_count} expired OTPs")
        return f"Cleaned up {deleted_count} expired OTPs"
        
    except Exception as exc:
        logger.error(f"❌ Error in cleanup task: {str(exc)}")
        raise self.retry(exc=exc, countdown=300) 