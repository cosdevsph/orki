"""
Access Control Decorator
========================

Enforces subscription access control at the view level.

Usage:
    @require_active_subscription
    def some_view(request):
        ...
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status


def require_active_subscription(view_func):
    """
    Decorator to enforce subscription requirement on DRF views.
    
    Usage:
        from core.access_control import require_active_subscription
        
        @require_active_subscription
        def get(self, request):
            ...
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        # Check if user profile exists
        if not hasattr(request, 'user_profile'):
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Check subscription status
        try:
            subscription = request.user_profile.subscription
            if not subscription.is_active:
                return Response(
                    {
                        "detail": "Premium access required. Please upgrade your subscription.",
                        "subscription_status": subscription.status,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        except Exception:
            return Response(
                {"detail": "Subscription verification failed"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Access allowed
        return view_func(self, request, *args, **kwargs)
    
    return wrapper
