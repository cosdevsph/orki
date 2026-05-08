from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Stricter rate limit for authentication endpoints to mitigate
    brute-force and credential-stuffing attacks.
    """

    scope = "auth"
