

Automatically generated JSON definitions
========================================


Definition for object type ``Wall``
-----------------------------------

::

    {
        "WID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``WID``


Definition for object type ``User``
-----------------------------------

::

    {
        "UID": "<class 'int'>",
        "first_name": "<class 'str'>",
        "last_name": "<class 'str'>",
        "email": "<class 'str'>",
        "admin": "<class 'bool'>",
        "wall_WID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``UID``


Definition for object type ``Location``
---------------------------------------

::

    {
        "LID": "<class 'int'>",
        "description": "<class 'str'>",
        "number": "<class 'int'>",
        "street": "<class 'str'>",
        "city": "<class 'str'>",
        "postalcode": "<class 'int'>",
        "country": "<class 'str'>",
        "user_UID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``LID``


Definition for object type ``Sensor``
-------------------------------------

::

    {
        "SID": "<class 'int'>",
        "type": "Enum('water', 'electricity', 'gas', 'other')",
        "title": "<class 'str'>",
        "EUR_per_unit": "<class 'float'>",
        "user_UID": "<class 'int'>",
        "location_LID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``SID``


Definition for object type ``Value``
------------------------------------

Definition is custom!
The documentation says:

    format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): ``sensor_SID``, ``time``

There might be a "for" attribute needed when getting:

::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }


Definition for object type ``HourValue``
----------------------------------------

Definition is custom!
The documentation says:

    format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): ``sensor_SID``, ``time``

There might be a "for" attribute needed when getting:

::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }


Definition for object type ``DayValue``
---------------------------------------

Definition is custom!
The documentation says:

    format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): ``sensor_SID``, ``time``

There might be a "for" attribute needed when getting:

::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }


Definition for object type ``MonthValue``
-----------------------------------------

Definition is custom!
The documentation says:

    format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): ``sensor_SID``, ``time``

There might be a "for" attribute needed when getting:

::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }


Definition for object type ``YearValue``
----------------------------------------

Definition is custom!
The documentation says:

    format is ``[time, value]`` (to save space)

Key properties are (might not be in definition): ``sensor_SID``, ``time``

There might be a "for" attribute needed when getting:

::

    "for": {
        "what": "Sensor",
        "SID": "<class 'int'>"
    }


Definition for object type ``Tag``
----------------------------------

::

    {
        "text": "<class 'str'>",
        "sensor_SID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``sensor_SID``, ``text``


Definition for object type ``Status``
-------------------------------------

::

    {
        "SID": "<class 'int'>",
        "date": "<class 'int'>",
        "date_edited": "<class 'int'>",
        "text": "<class 'str'>",
        "author_UID": "<class 'int'>",
        "wall_WID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``SID``


Definition for object type ``Like``
-----------------------------------

::

    {
        "positive": "<class 'bool'>",
        "status_SID": "<class 'int'>",
        "user_UID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``status_SID``, ``user_UID``


Definition for object type ``Friendship``
-----------------------------------------

::

    {
        "user1_UID": "<class 'int'>",
        "user2_UID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``user1_UID``, ``user2_UID``


Definition for object type ``Group``
------------------------------------

::

    {
        "GID": "<class 'int'>",
        "title": "<class 'str'>",
        "description": "<class 'str'>",
        "public": "<class 'bool'>",
        "wall_WID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``GID``


Definition for object type ``Membership``
-----------------------------------------

::

    {
        "status": "Enum('ADMIN', 'MEMBER', 'PENDING', 'BANNED')",
        "last_change": "<class 'int'>",
        "user_UID": "<class 'int'>",
        "group_GID": "<class 'int'>"
    }

Key properties are (might not be in definition): ``user_UID``, ``group_GID``

