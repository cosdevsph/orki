class SessionUserMiddleware:
    """
    Attaches the authenticated UserProfile to every request object so
    that DRF views can access `request.user_profile` directly.

    If the session is stale (user deleted from DB), the session is
    flushed to prevent ghost sessions accumulating.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_id = request.session.get("user_id")
        if user_id:
            try:
                from users.models import UserProfile  # noqa: PLC0415 – avoid circular import at module level

                request.user_profile = UserProfile.objects.get(id=user_id)
            except Exception:
                request.user_profile = None
                request.session.flush()
        else:
            request.user_profile = None

        return self.get_response(request)
