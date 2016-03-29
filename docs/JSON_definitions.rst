

Automatically generated JSON definitions
========================================


Definition for object type 'User'
---------------------------------

::

    {
        "UID": "<class 'int'>",
        "first_name": "<class 'str'>",
        "last_name": "<class 'str'>",
        "email": "<class 'str'>"
    }

Key properties are (might not be in definition): UID


Definition for object type 'Location'
-------------------------------------

::

    {
        "LID": "<class 'int'>",
        "description": "<class 'str'>",
        "number": "<class 'int'>",
        "street": "<class 'str'>",
        "city": "<class 'str'>",
        "postalcode": "<class 'int'>",
        "country": "<class 'str'>",
        "elec_price": "<class 'float'>",
        "user_UID": "<class 'int'>"
    }

Key properties are (might not be in definition): LID


Definition for object type 'Sensor'
-----------------------------------

::

    {
        "SID": "<class 'int'>",
        "type": "<class 'str'>",
        "title": "<class 'str'>",
        "user_UID": "<class 'int'>",
        "location_LID": "<class 'int'>"
    }

Key properties are (might not be in definition): SID


Definition for object type 'Value'
----------------------------------

Definition is custom!
The documentation says: format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): sensor_SID, time

You should also mention a "for" attribute::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }

