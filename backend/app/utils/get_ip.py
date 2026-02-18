from fastapi import Request
def _get_client_ip(request: Request) -> str:
    """
    Try to get the real client IP.
    - First, check X-Forwarded-For (if behind proxy/load balancer)
    - Fallback to request.client.host
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # Can be a list: "client, proxy1, proxy2"
        return xff.split(",")[0].strip()
    return request.client.host or "unknown"