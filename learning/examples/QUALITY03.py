import os
def port(config):
    value=int(config.get("PORT","8080"))
    if not 1 <= value <= 65535:
        raise ValueError("invalid port")
    return value
print(port({}))
print(port({"PORT":"9090"}))
try:
    port({"PORT":"0"})
except ValueError as error:
    print(str(error))
